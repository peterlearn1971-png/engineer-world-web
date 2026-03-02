import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// --- HELPERS ---
function norm(v: any) { return String(v ?? "").trim(); }

function getRoleLabel(cc: any) {
  if (!cc) return "Professional";
  return cc.target_role || (Array.isArray(cc.target_roles) && cc.target_roles.length > 0 ? cc.target_roles[0] : null) || cc.headline || "Professional";
}

function formatUrl(url: string) {
  if (!url) return "#";
  const trimmed = url.trim();
  if (trimmed.startsWith('http')) return trimmed;
  return `https://${trimmed}`;
}

export default async function ClientTalentMapPage(props: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ q?: string; u?: string; success?: string }>;
}) {
  const { token } = await props.params;
  const sp = (await props.searchParams) || {};
  const userEmail = sp.u;
  const q = norm(sp.q).toLowerCase();

  // 1. Validate Token & Get Company ID
  const { data: companyRow } = await supabaseAdmin.from("company_portal_tokens").select("company_id").eq("token", token).single();
  if (!companyRow) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Invalid Portal Link</div>;
  const company_id = companyRow.company_id;

  // 2. Fetch Job Tank Items + Candidates (Includes resume_url)
  const { data: tankRows } = await supabaseAdmin
    .from("job_tank_items")
    .select(`*, jobs!inner(company_id), candidates(*)`)
    .eq("jobs.company_id", company_id)
    .eq("visible_to_client", true)
    .order("created_at", { ascending: false });

  const rows = tankRows || [];
  const candidateIds = rows.map(r => r.candidate_id);

  // 3. Fetch Candidate Cards (Includes linkedin_url)
  const { data: cardRows } = await supabaseAdmin
    .from("candidate_cards")
    .select("candidate_id, headline, summary, years_experience, linkedin_url, location_blurb")
    .in("candidate_id", candidateIds);
    
  const cardMap = new Map(cardRows?.map(c => [c.candidate_id, c]));

  // 4. Fetch Intro Requests to check status
  const { data: allRequests } = await supabaseAdmin
    .from("intro_requests")
    .select("candidate_id, status")
    .eq("company_id", company_id);

  const requestStatusMap = new Map(allRequests?.map(r => [r.candidate_id, r.status]) || []);

  // 5. Filtering & Grouping
  const filtered = rows.filter(r => {
    if (!q) return true;
    const cc = cardMap.get(r.candidate_id);
    const hay = [r.candidates?.full_name, cc?.location_blurb, getRoleLabel(cc)].map(norm).join(" ").toLowerCase();
    return hay.includes(q);
  });

  const groups = new Map<string, any[]>();
  filtered.forEach(r => {
    const cc = cardMap.get(r.candidate_id);
    const loc = cc?.location_blurb || r.candidates?.city || "Remote / Other";
    if (!groups.has(loc)) groups.set(loc, []);
    groups.get(loc)?.push({ ...r, cc });
  });

  // --- STYLES ---
  const pageStyle: React.CSSProperties = { padding: "48px 24px", maxWidth: 1000, margin: "0 auto", fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" };
  const cardStyle: React.CSSProperties = { background: "white", borderRadius: "16px", padding: "28px", marginBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #f1f5f9" };
  const chipBase: React.CSSProperties = { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: "1px solid" };

  const returnTo = `/c/${token}/talent-map${userEmail ? `?u=${userEmail}` : ""}`;

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Talent Map</h1>
        <Link href={`/c/${token}${userEmail ? `?u=${userEmail}` : ""}`} style={{ padding: "8px 16px", borderRadius: "8px", background: "white", color: "#64748b", border: "1px solid #e2e8f0", textDecoration: "none", fontSize: "14px" }}>← Back</Link>
      </div>

      {Array.from(groups.entries()).map(([loc, groupRows]) => (
        <div key={loc} style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", marginBottom: "20px" }}>📍 {loc}</div>
          
          {groupRows.map(r => {
            const cc = cardMap.get(r.candidate_id);
            const currentStatus = requestStatusMap.get(r.candidate_id);
            
            // Checking for every possible "Unlocked" status
            const isUnlocked = currentStatus === "completed" || currentStatus === "granted" || currentStatus === "approved";

            return (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                      {isUnlocked ? r.candidates?.full_name : `Candidate ${r.candidate_id.slice(0, 5).toUpperCase()}`}
                      {isUnlocked && <span style={{ marginLeft: 10, fontSize: "10px", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px" }}>UNLOCKED</span>}
                    </div>

                    <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#475569" }}>
                      {cc?.summary || "No professional summary available."}
                    </div>

                    {/* --- THE LINKS SECTION --- */}
                    {isUnlocked && (
                      <div style={{ display: "flex", gap: "24px", paddingTop: "20px", borderTop: "1px dashed #e2e8f0", marginTop: 20 }}>
                        {cc?.linkedin_url ? (
                          <a href={formatUrl(cc.linkedin_url)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#0077b5", fontWeight: 700, fontSize: "14px", display: 'flex', alignItems: 'center', gap: 4 }}>
                             <span style={{ background: '#0077b5', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>in</span> View LinkedIn ↗
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>No LinkedIn Provided</span>
                        )}

                        {r.candidates?.resume_url ? (
                          <a href={r.candidates.resume_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#6366f1", fontWeight: 700, fontSize: "14px" }}>
                             📄 View Resume PDF ↗
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>No Resume Attached</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ minWidth: "140px", textAlign: 'right' }}>
                    {isUnlocked ? (
                       <div style={{ color: "#16a34a", fontWeight: 700, fontSize: "14px" }}>✓ Intro Approved</div>
                    ) : (
                      <form action="/api/intro-requests/create" method="POST">
                        <input type="hidden" name="candidate_id" value={r.candidate_id} />
                        <input type="hidden" name="job_id" value={r.job_id || ""} />
                        <input type="hidden" name="company_id" value={company_id} />
                        <input type="hidden" name="return_to" value={returnTo} />
                        <button type="submit" style={{ padding: "12px 24px", borderRadius: "12px", background: "#0f172a", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Request Intro</button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}