import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CreateJobForm from "./create-form"; // Ensure you have this file from our previous step!

export const dynamic = "force-dynamic";
export const revalidate = 0;

type JobRow = {
  id: string;
  created_at?: string;
  title: string | null;
  status: string | null;
  location: string | null;
  work_mode: string | null;
  comp_band: string | null;
  company_id: string;
  owner_user_id?: string | null;
  companies?: { name: string | null } | null;
  owner?: { name: string | null; email: string | null } | null;
};

type CompanyRow = { id: string; name: string | null; };
type CompanyUserRow = { id: string; company_id: string; email: string | null; name: string | null; role: string | null; };

function fmt(dt: any) {
  const v = String(dt ?? "").trim();
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString(); } catch { return v; }
}

function norm(v: any) { return String(v ?? "").trim(); }

export default async function AdminJobsPage({ searchParams }: { searchParams?: Promise<{ view?: string }>; }) {
  // SECURITY
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_key")?.value;
  const secret = "PeterRyan1974!!";
  if (cookieSecret !== secret) redirect("/admin/login");

  const sp = (await searchParams) || {};
  const view = String(sp.view || "").toLowerCase() === "all" ? "all" : "active";
  const indigo = "#6366f1";
  const navy = "#0f172a";

  // DATA FETCHING
  const { data: companyRows } = await supabaseAdmin.from("companies").select("id, name").order("name").limit(500);
  const { data: userRows } = await supabaseAdmin.from("company_users").select("id, company_id, email, name, role").eq("active", true).order("name").limit(2000);

  let q = supabaseAdmin.from("jobs").select(`
      id, created_at, title, status, location, work_mode, comp_band, company_id, owner_user_id,
      companies ( name ),
      owner:company_users!owner_user_id ( name, email )
    `).order("created_at", { ascending: false }).limit(300);

  // If view is active, we hide closed AND filled (unless you want filled to show in active?)
  // Usually "Filled" jobs are considered "Done", so we treat them like Closed for the filter.
  if (view === "active") q = q.neq("status", "closed").neq("status", "filled");
  
  const { data: jobData } = await q;

  const companies = (companyRows || []) as CompanyRow[];
  const companyUsers = (userRows || []) as CompanyUserRow[];
  const rows = (jobData || []) as unknown as JobRow[];
  const returnTo = view === "all" ? "/admin/jobs?view=all" : "/admin/jobs";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: navy }}>
      {/* PERSISTENT HEADER */}
      <header style={{ background: "white", padding: "20px 40px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', cursor: 'pointer' }}>
            INSURE<span style={{ color: indigo }}>WORLD</span> <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', textTransform: 'uppercase' }}>Admin</span>
          </div>
        </Link>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Authenticated Administrator</div>
      </header>

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* IMPORTED FORM COMPONENT */}
        <CreateJobForm 
            companies={companies} 
            companyUsers={companyUsers} 
            indigo={indigo} 
        />

        {/* LIST SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>Jobs</h1>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <Link href="/admin/jobs" style={{ fontSize: "13px", fontWeight: 700, textDecoration: "none", color: view === "active" ? indigo : "#64748b", borderBottom: view === "active" ? `2px solid ${indigo}` : "none", paddingBottom: "4px" }}>Active Jobs</Link>
              <Link href="/admin/jobs?view=all" style={{ fontSize: "13px", fontWeight: 700, textDecoration: "none", color: view === "all" ? indigo : "#64748b", borderBottom: view === "all" ? `2px solid ${indigo}` : "none", paddingBottom: "4px" }}>All Jobs (Including Filled)</Link>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div style={{ background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Created</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Company & Title</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Meta</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                // Determine Badge Color
                let badgeBg = "#f0fdf4"; // default active (greenish)
                let badgeColor = "#166534";
                
                if (r.status === 'closed') { badgeBg = "#f1f5f9"; badgeColor = "#475569"; }
                if (r.status === 'filled') { badgeBg = "#dcfce7"; badgeColor = "#15803d"; } // Bright Green for Filled
                if (r.status === 'paused') { badgeBg = "#fff7ed"; badgeColor = "#9a3412"; } // Orange for Paused

                return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "24px", fontSize: "13px", color: "#64748b" }}>{fmt(r.created_at)}</td>
                    <td style={{ padding: "24px" }}>
                        <div style={{ fontWeight: 800, color: navy, fontSize: '16px' }}>{r.companies?.name}</div>
                        <div style={{ color: indigo, fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>{r.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Owner: {r.owner?.name || "Unassigned"}</div>
                    </td>
                    <td style={{ padding: "24px", fontSize: "12px", color: "#475569" }}>
                        {r.location && <div>Location: {r.location}</div>}
                        {r.work_mode && <div>Mode: {r.work_mode}</div>}
                        <div style={{ marginTop: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: badgeBg, color: badgeColor, fontWeight: 800, fontSize: '10px' }}>
                            {norm(r.status).toUpperCase()}
                        </span>
                        </div>
                    </td>
                    <td style={{ padding: "24px", textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link href={`/admin/jobs/${r.id}`} style={{ padding: "8px 16px", borderRadius: "8px", background: navy, color: "white", fontWeight: 700, fontSize: "12px", textDecoration: 'none' }}>Open Tank</Link>
                        
                        <form action="/api/admin/jobs/update" method="post" style={{ display: 'flex', gap: '4px' }}>
                            <input type="hidden" name="job_id" value={r.id} />
                            <input type="hidden" name="return_to" value={returnTo} />
                            
                            {/* UPDATED DROPDOWN WITH FILLED */}
                            <select name="status" defaultValue={r.status || "open"} style={{ padding: "7px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", cursor: "pointer" }}>
                                <option value="open">Open</option>
                                <option value="paused">Paused</option>
                                <option value="filled">Filled (Won!)</option>
                                <option value="closed">Closed</option>
                            </select>
                            
                            <button type="submit" style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Save</button>
                        </form>

                        <form action="/api/admin/jobs/delete" method="post" style={{ display: 'flex', gap: '4px' }}>
                            <input type="hidden" name="job_id" value={r.id} />
                            <input type="hidden" name="return_to" value={returnTo} />
                            <input name="confirm" placeholder="DELETE" style={{ padding: "7px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", width: "80px" }} />
                            <button type="submit" style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Delete</button>
                        </form>
                        </div>
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}