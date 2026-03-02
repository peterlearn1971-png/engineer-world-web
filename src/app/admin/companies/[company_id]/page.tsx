import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { humanRef } from "@/lib/refs";
import CopyTextButton from "@/components/CopyTextButton";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

const BASE_URL = "https://insure-world-3j9d.vercel.app";

// --- TYPES ---
type PortalEvent = {
  id: string;
  created_at: string;
  event_type: string;
  company_id: string;
  candidate_id: string | null;
  token: string | null;
  meta: any;
};

type CompanyUserRow = {
  id: string;
  company_id: string | null;
  email: string;
  name: string | null;
  role: string | null;
  active: boolean | null;
  created_at: string | null;
  title: string | null;
  region_scope: string | null;
  auth_user_id: string | null;
};

// --- HELPERS ---
function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return dt; }
}

function eventLabel(t: string) {
  const v = String(t || "").trim().toLowerCase();
  if (v === "portal_view") return "Opened portal";
  if (v === "shortlist_add") return "Saved candidate";
  if (v === "shortlist_remove") return "Removed candidate";
  if (v === "intro_request") return "Requested intro";
  if (v === "intro_request_duplicate") return "Intro request (duplicate blocked)";
  return t || "Event";
}

function safeMeta(meta: any) {
  if (!meta) return "";
  try {
    const s = typeof meta === "string" ? meta : JSON.stringify(meta);
    return s.length > 140 ? s.slice(0, 140) + "…" : s;
  } catch { return ""; }
}

function StatusBadge({ role }: { role: string }) {
  const isRestricted = role === "company_rep";
  if (isRestricted) {
    return (
      <span style={{ 
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 20, 
        background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5",
        fontSize: 12, fontWeight: 600 
      }}>
        🔒 Own Jobs Only
      </span>
    );
  }
  return (
    <span style={{ 
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20, 
      background: "#f0fdf4", color: "#15803d", border: "1px solid #dcfce7",
      fontSize: 12, fontWeight: 600 
    }}>
      🌍 Full Access
    </span>
  );
}

function statCard(label: string, value: number) {
  return (
    <div style={{ 
      background: "white", padding: "16px", borderRadius: 12, 
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.02)" 
    }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: "#111" }}>{value}</div>
    </div>
  );
}

export default async function AdminCompanyManagePage({
  params,
}: {
  params: Promise<{ company_id: string }>;
}) {
  const { company_id } = await params;

  // --- ACTIONS ---
  async function generateToken() {
    "use server";
    const token = randomBytes(32).toString("hex");
    await supabaseAdmin.from("company_portal_tokens").insert({
      company_id: company_id,
      token: token,
    });
    revalidatePath(`/admin/companies/${company_id}`);
  }

  async function createUser(formData: FormData) {
    "use server";
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const role = String(formData.get("role"));
    const title = String(formData.get("title"));
    
    await supabaseAdmin.from("company_users").insert({
        company_id: company_id,
        name, email, role, title, active: true
    });
    revalidatePath(`/admin/companies/${company_id}`);
  }

  // --- DATA FETCHING ---
  const { data: companyRow } = await supabaseAdmin.from("companies").select("id, name").eq("id", company_id).single();
  const company = companyRow;

  const { data: companyUsers } = await supabaseAdmin.from("company_users").select("*").eq("company_id", company_id).order("created_at", { ascending: true });

  const { data: tokenRows } = await supabaseAdmin.from("company_portal_tokens").select("token, revoked_at, created_at").eq("company_id", company_id).order("created_at", { ascending: false });
  const activeTokenRow = (tokenRows || []).find((t: any) => !t.revoked_at);
  const masterToken = activeTokenRow?.token;

  const { data: shortlistRows } = await supabaseAdmin.from("shortlists").select("id").eq("company_id", company_id).eq("title", "Default").limit(1);
  const shortlist_id = shortlistRows?.[0]?.id ?? null;
  let savedCount = 0;
  if (shortlist_id) {
    const { count } = await supabaseAdmin.from("shortlist_items").select("*", { count: "exact", head: true }).eq("shortlist_id", shortlist_id);
    savedCount = count ?? 0;
  }

  // 7-day stats
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  async function countEvents(event_type: string) {
    const { count } = await supabaseAdmin.from("portal_events").select("*", { count: "exact", head: true }).eq("company_id", company_id).eq("event_type", event_type).gte("created_at", since);
    return count ?? 0;
  }
  const views7d = await countEvents("portal_view");
  const intro7d = await countEvents("intro_request");

  const { data: eventRows } = await supabaseAdmin.from("portal_events").select("*").eq("company_id", company_id).order("created_at", { ascending: false }).limit(25);
  const events = (eventRows || []) as PortalEvent[];

  // FIX: Candidate mapping logic
  const candidateIds = Array.from(new Set(events.map((e) => e.candidate_id).filter(Boolean) as string[]));
  const candidateMap = new Map<string, { name: string; location: string; headline: string }>();
  if (candidateIds.length > 0) {
    const { data: candRows } = await supabaseAdmin.from("candidates").select("id, full_name, city, region").in("id", candidateIds);
    const { data: cardRows } = await supabaseAdmin.from("candidate_cards").select("candidate_id, headline").in("candidate_id", candidateIds);
    const headlineByCandidate = new Map<string, string>();
    cardRows?.forEach((r: any) => headlineByCandidate.set(r.candidate_id, r.headline || ""));
    candRows?.forEach((c: any) => {
        const name = (c.full_name || "").trim() || `Candidate ${humanRef("CAN", c.id)}`;
        const location = [c.city, c.region].filter(Boolean).join(", ") || "—";
        const headline = headlineByCandidate.get(c.id) || "—";
        candidateMap.set(c.id, { name, location, headline });
    });
  }

  // --- STYLES ---
  const cardStyle: React.CSSProperties = { 
    background: "white", 
    borderRadius: "12px", 
    padding: "24px", 
    marginBottom: "24px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f1f5f9"
  };
  
  const btnBase: React.CSSProperties = { 
    display: "inline-flex", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "40px", 
    padding: "0 18px", 
    borderRadius: "8px", 
    fontSize: "14px", 
    fontWeight: 600, 
    cursor: "pointer", 
    textDecoration: "none",
    transition: "all 0.2s ease" 
  };
  
  const btnPrimary: React.CSSProperties = { 
    ...btnBase, 
    background: "#4f46e5", 
    color: "white", 
    border: "none",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  };
  
  const btnSecondary: React.CSSProperties = { 
    ...btnBase, 
    background: "white", 
    color: "#334155", 
    border: "1px solid #e2e8f0" 
  };

  const inputStyle: React.CSSProperties = { 
    height: "40px", 
    padding: "0 12px", 
    borderRadius: "8px", 
    border: "1px solid #e2e8f0", 
    width: "100%", 
    fontSize: "14px",
    outlineColor: "#6366f1"
  };

  const labelStyle: React.CSSProperties = { 
    display: "block", 
    fontSize: "12px", 
    fontWeight: 700, 
    color: "#64748b", 
    marginBottom: "6px", 
    textTransform: "uppercase",
    letterSpacing: "0.025em"
  };

  const thStyle: React.CSSProperties = { 
    textAlign: "left", 
    padding: "12px 16px", 
    fontSize: "12px", 
    fontWeight: 600, 
    color: "#64748b", 
    textTransform: "uppercase", 
    borderBottom: "2px solid #f1f5f9",
    letterSpacing: "0.05em"
  };

  const tdStyle: React.CSSProperties = { 
    padding: "16px", 
    fontSize: "14px", 
    color: "#1e293b", 
    borderBottom: "1px solid #f8fafc" 
  };

  return (
    <div style={{ padding: "48px 24px", maxWidth: "1100px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: "40px" }}>
        <Link href="/admin/companies" style={{ textDecoration: "none", color: "#64748b", fontSize: "14px", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to companies
        </Link>
        <h1 style={{ margin: 0, fontSize: "36px", fontWeight: 800, letterSpacing: "-0.025em", color: "#1e293b" }}>{company?.name || "Company"}</h1>
      </div>

      {/* Master Link Card */}
      {masterToken ? (
        <div style={{ ...cardStyle, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div>
                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "16px", marginBottom: "4px" }}>🔗 Master Portal Link</div>
                <div style={{ fontSize: "14px", color: "#64748b" }}>Share this link for view-only access to all active jobs.</div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ background: "white", padding: "0 16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "13px", color: "#475569", height: "40px" }}>
                {`${BASE_URL}/c/${masterToken}`}
                </div>
                <CopyTextButton text={`${BASE_URL}/c/${masterToken}`} label="Copy Link" />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, background: "#fff1f2", border: "1px solid #fecdd3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, color: "#be123c" }}>No active portal link generated yet.</div>
          <form action={generateToken}><button type="submit" style={btnPrimary}>Generate Portal Link</button></form>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {statCard("Portal Views (7d)", views7d)}
        {statCard("Saved Candidates", savedCount)}
        {statCard("Intro Requests (7d)", intro7d)}
        <div style={{ ...cardStyle, marginBottom: 0, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
             <Link href={`/admin/companies/${company_id}/saved`} style={{ ...btnSecondary, width: "100%" }}>View Full Saved List</Link>
        </div>
      </div>

      {/* Users Section */}
      <div style={cardStyle}>
        <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "#1e293b" }}>Team Members</div>
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>User Details</th>
                        <th style={thStyle}>System Role</th>
                        <th style={thStyle}>Portal Access</th>
                        <th style={{...thStyle, textAlign: "right"}}>Magic Link</th>
                    </tr>
                </thead>
                <tbody>
                    {(companyUsers || []).map((u: CompanyUserRow) => {
                        const link = masterToken ? `${BASE_URL}/c/${masterToken}?u=${encodeURIComponent(u.email)}` : "";
                        return (
                            <tr key={u.id} style={{ transition: "background 0.1s" }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{u.name}</div>
                                    <div style={{ fontSize: "13px", color: "#64748b" }}>{u.email}</div>
                                </td>
                                <td style={tdStyle}>
                                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                                    {u.role?.replace("company_", "").toUpperCase() || "USER"}
                                  </span>
                                </td>
                                <td style={tdStyle}><StatusBadge role={u.role || ""} /></td>
                                <td style={{...tdStyle, textAlign: "right"}}>
                                    {masterToken && <CopyTextButton text={link} label="Copy Login Link" />}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Add User Form */}
        <div style={{ marginTop: "32px", paddingTop: "32px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#475569" }}>Add New Team Member</div>
            <form action={createUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "16px", alignItems: "end" }}>
                <div><label style={labelStyle}>Full Name</label><input name="name" placeholder="John Doe" required style={inputStyle} /></div>
                <div><label style={labelStyle}>Email Address</label><input name="email" type="email" placeholder="john@company.com" required style={inputStyle} /></div>
                <div>
                    <label style={labelStyle}>Permissions</label>
                    <select name="role" style={inputStyle} defaultValue="company_rep">
                        <option value="company_rep">Representative (Own Jobs Only)</option>
                        <option value="company_owner">Owner (All Jobs)</option>
                        <option value="company_vp">VP (All Jobs)</option>
                    </select>
                </div>
                <button type="submit" style={btnPrimary}>Add User</button>
            </form>
        </div>
      </div>

      {/* Activity Feed */}
      <div style={cardStyle}>
        <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "#1e293b" }}>Recent Portal Activity</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
            {events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>
                No activity recorded yet.
              </div>
            ) : events.map((e, idx) => {
                const c = e.candidate_id ? candidateMap.get(e.candidate_id) : null;
                const isLast = idx === events.length - 1;
                return (
                    <div key={e.id} style={{ display: "grid", gridTemplateColumns: "140px 180px 1fr", gap: "20px", alignItems: "center", padding: "16px 0", borderBottom: isLast ? "none" : "1px solid #f8fafc" }}>
                        <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>{fmt(e.created_at)}</div>
                        <div><span style={{ padding: "4px 10px", borderRadius: "6px", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.025em" }}>{eventLabel(e.event_type)}</span></div>
                        <div style={{ fontSize: "14px", color: "#334155" }}>
                            {e.candidate_id && <span>Candidate: <b style={{ color: "#0f172a" }}>{c?.name || e.candidate_id}</b> </span>}
                            {e.meta && <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "8px", fontStyle: "italic" }}>{safeMeta(e.meta)}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}

