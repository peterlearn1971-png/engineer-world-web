import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const cleanRef = (id: string) => (id ? id.split("-")[0].toUpperCase() : "");

export default async function AdminCandidatesPage(props: {
  searchParams: Promise<{ q?: string; rep?: string }>;
}) {
  // 1. SECURITY
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_key")?.value;
  const secret = "PeterRyan1974!!";
  if (cookieSecret !== secret) redirect("/admin/login");

  // 2. DATA FETCHING
  const sp = await props.searchParams;
  const q = sp?.q?.toLowerCase() || "";
  const selectedRep = sp?.rep || "";

  const indigo = "#6366f1";
  const navy = "#0f172a";

  // Fetch all jobs
  const { data: allJobs } = await supabaseAdmin
    .from("jobs")
    .select(`id, title, location, work_mode, owner_user_id, companies ( name )`);

  // Fetch all reps
  const { data: allReps } = await supabaseAdmin.from("company_users").select("*");
  const repMap = new Map();
  allReps?.forEach((r) => {
    const displayName = r.full_name || r.email || "Unnamed Rep";
    if (r.id) repMap.set(r.id, displayName);
    if (r.user_id) repMap.set(r.user_id, displayName);
    if (r.auth_user_id) repMap.set(r.auth_user_id, displayName);
  });

  // Fetch candidates
  const { data: candidates } = await supabaseAdmin
    .from("candidates")
    .select(
      `*, candidate_cards (*), job_tank_items ( id, visible_to_client, job_id, jobs (id, title, location, owner_user_id, companies(name)) )`
    )
    .order("created_at", { ascending: false });

  const rows = candidates || [];

  // 3. FILTERING LOGIC
  const filtered = rows.filter((r) => {
    const cc = r.candidate_cards?.[0] || {};
    const hay = [r.full_name, r.email, cc.headline, cc.target_role, cc.location_blurb, r.city]
      .map((v) => String(v ?? "").toLowerCase())
      .join(" ");
    const matchesSearch = !q || hay.includes(q);

    const matchesRep =
      !selectedRep ||
      r.job_tank_items?.some((item: any) => item.jobs?.owner_user_id === selectedRep);

    return matchesSearch && matchesRep;
  });

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: navy }}>
      <header
        style={{
          background: "white",
          padding: "20px 40px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.02em", cursor: "pointer" }}>
            INSURE<span style={{ color: indigo }}>WORLD</span>{" "}
            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px", textTransform: "uppercase" }}>
              Admin
            </span>
          </div>
        </Link>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Authenticated Administrator</div>
      </header>

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Candidates</h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              {filtered.length} Vetted professionals in network
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <form action="/admin/candidates" method="GET" style={{ display: "flex", gap: "12px" }}>
              <select
                name="rep"
                defaultValue={selectedRep}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "white",
                  fontWeight: 600,
                  color: navy,
                  outline: "none",
                }}
              >
                <option value="">All Reps</option>
                {Array.from(repMap.entries()).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                name="q"
                defaultValue={q}
                placeholder="Search candidates..."
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  width: "320px",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  background: navy,
                  color: "white",
                  borderRadius: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Filter
              </button>
            </form>

            <Link
              href="/admin/candidates/new"
              style={{
                padding: "12px 24px",
                background: indigo,
                color: "white",
                borderRadius: "12px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              + Add Candidate
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ width: "200px", padding: "16px 20px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Candidate</th>
                  <th style={{ width: "200px", padding: "16px 20px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Role & Experience</th>
                  <th style={{ width: "320px", padding: "16px 20px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Active Matches</th>
                  
                  {/* UPDATED: Increased Width from 300px to 350px */}
                  <th style={{ width: "350px", padding: "16px 20px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Job Tank</th>
                  
                  <th style={{ width: "120px", padding: "16px 20px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                  <th style={{ width: "120px", padding: "16px 20px", textAlign: "right", position: "sticky", right: 0, background: "#f8fafc", zIndex: 10, borderLeft: "1px solid #e2e8f0" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const cc = r.candidate_cards?.[0] || {};
                  const tankItems = r.job_tank_items || [];
                  const hasStealthData = !!(r.stealth_preferences || r.excluded_companies || r.stealth_notes);

                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 800, color: navy, fontSize: "15px" }}>{r.full_name}</div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {r.source === "PRO" && (
                              <span style={{ background: "linear-gradient(90deg, #6366f1, #4f46e5)", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
                            )}
                            {hasStealthData && (
                              <span style={{ background: "#0f172a", color: "white", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", border: "1px solid #334155" }}>STEALTH 🕵️</span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>REF: {cleanRef(r.id)}</div>
                      </td>

                      <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: indigo, fontSize: "14px" }}>{cc.target_role || "Role Not Set"}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{cc.years_experience || 0} Yrs • {cc.location_blurb || r.city || "Remote"}</div>
                      </td>

                      <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {tankItems.map((item: any) => {
                            const job = item.jobs;
                            const repName = repMap.get(job?.owner_user_id) || "Unassigned";
                            const city = job?.location?.split(",")[0] || "Remote";

                            return (
                              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", background: item.visible_to_client ? "#f0fdf4" : "#f8fafc", padding: "8px 12px", borderRadius: "10px", border: `1px solid ${item.visible_to_client ? "#bbf7d0" : "#e2e8f0"}` }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ color: "#64748b" }}>🚀</span>
                                    <span style={{ fontWeight: 800, color: navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job?.companies?.name || "Job"}: {job?.title}</span>
                                  </div>
                                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500, paddingLeft: "20px" }}>{city} • {repName}</div>
                                </div>
                                <form action="/api/admin/job-tank/remove" method="POST" style={{ margin: 0, marginLeft: "12px" }}>
                                  <input type="hidden" name="candidate_id" value={r.id} />
                                  <input type="hidden" name="job_id" value={item.job_id || job?.id || ""} />
                                  <input type="hidden" name="return_to" value="/admin/candidates" />
                                  <button type="submit" style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", fontWeight: 900, fontSize: "16px" }}>×</button>
                                </form>
                              </div>
                            );
                          })}
                          {tankItems.length === 0 && <span style={{ color: "#cbd5e1", fontSize: "12px", fontStyle: "italic" }}>No active matches</span>}
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                        <form action="/api/admin/job-tank/add" method="POST" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <input type="hidden" name="candidate_id" value={r.id} />
                          <input type="hidden" name="return_to" value="/admin/candidates" />
                          
                          {/* UPDATED: Added boxSizing: "border-box" to prevent cut-off */}
                          <select name="job_id" required style={{ width: "100%", padding: "10px", fontSize: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", cursor: "pointer", background: "white", color: navy, fontWeight: 500, boxSizing: "border-box" }}>
                            <option value="">Select Job...</option>
                            {allJobs?.map((j: any) => {
                                const rep = repMap.get(j.owner_user_id) || "Unassigned";
                                return (
                                    <option key={j.id} value={j.id}>
                                        {j.companies?.name} | {j.title} ({rep})
                                    </option>
                                );
                            })}
                          </select>
                          
                          {/* UPDATED: Added boxSizing: "border-box" */}
                          <button type="submit" style={{ width: "100%", padding: "8px 12px", background: navy, color: "white", borderRadius: "9999px", fontWeight: 700, border: "none", fontSize: "12px", cursor: "pointer", boxSizing: "border-box" }}>
                            Add to Tank
                          </button>
                        </form>
                      </td>

                      <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, background: r.stealth_mode ? "#fffbeb" : "#f0fdf4", color: r.stealth_mode ? "#92400e" : "#166534" }}>{r.stealth_mode ? "STEALTH" : "ACTIVE"}</span>
                      </td>

                      <td style={{ padding: "16px 20px", textAlign: "right", verticalAlign: "top", position: "sticky", right: 0, background: "white", zIndex: 5, boxShadow: "-4px 0 8px rgba(0,0,0,0.05)", borderLeft: "1px solid #e2e8f0" }}>
                        <Link href={`/admin/candidates/${r.id}`} style={{ textDecoration: "none", color: navy, fontWeight: 700, fontSize: "13px", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: "9999px", whiteSpace: "nowrap", background: "white" }}>Manage</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}