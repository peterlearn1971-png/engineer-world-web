import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string; job_id: string }>;
  searchParams: Promise<{ u?: string; success?: string }>;
}

export default async function ClientJobTankPage(props: PageProps) {
  const { token, job_id } = await props.params;
  const { u: rawEmail } = await props.searchParams;

  // 1. Security & Company Check
  const { data: tokenRow } = await supabaseAdmin.from("company_portal_tokens").select("company_id").eq("token", token).single();
  if (!tokenRow || !tokenRow.company_id) return <div style={{ padding: 60 }}>Invalid Link</div>;
  
  const currentCompanyId = tokenRow.company_id;
  const { data: company } = await supabaseAdmin.from("companies").select("name").eq("id", currentCompanyId).single();

  // 2. Account Rep Name
  const cleanEmail = rawEmail ? decodeURIComponent(rawEmail).trim().toLowerCase() : undefined;
  let viewerName = "";
  if (cleanEmail) {
    const { data: user } = await supabaseAdmin.from("company_users").select("name").ilike("email", cleanEmail).maybeSingle();
    viewerName = user?.name || "";
  }

  // 3. Fetch Job and Candidate Data
  // Note: 'select(*)' fetches the new 'client_status' column automatically
  const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", job_id).single();
  const { data: tankItems } = await supabaseAdmin.from("job_tank_items").select(`*, candidates(*)`).eq("job_id", job_id).order("created_at", { ascending: false });
  
  const candidateIds = tankItems?.map((i: any) => i.candidate_id) || [];
  const { data: cards } = await supabaseAdmin.from("candidate_cards").select("*").in("candidate_id", candidateIds);
  const cardMap = new Map(cards?.map((c: any) => [c.candidate_id, c]));

  const { data: requests } = await supabaseAdmin.from("intro_requests").select("candidate_id, status").eq("job_id", job_id);
  const statusMap = new Map(requests?.map((r: any) => [r.candidate_id, r.status]));

  async function requestIntro(formData: FormData) {
    "use server";
    const cId = formData.get("candidate_id")?.toString();
    if (cId) {
      await supabaseAdmin.from("intro_requests").insert({ 
        candidate_id: cId, job_id, company_id: currentCompanyId, status: "new", created_at: new Date().toISOString() 
      });
      revalidatePath(`/c/${token}/jobs/${job_id}`);
    }
  }

  async function refreshData() {
    "use server";
    revalidatePath(`/c/${token}/jobs/${job_id}`);
  }

  const accent = "#6366f1";
  const chipStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', whiteSpace: 'nowrap' };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{ background: "white", padding: "15px 40px", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', maxWidth: "1200px", margin: "0 auto" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <Link href={`/c/${token}${rawEmail ? `?u=${rawEmail}` : ""}`} style={{ fontWeight: 700, color: "#64748b", textDecoration: "none" }}>← Back to Dashboard</Link>
              <form action={refreshData}>
                <button type="submit" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: accent, fontWeight: 700, fontSize: "14px" }}>
                   🔄 Refresh
                </button>
              </form>
           </div>
           <div style={{ fontSize: '15px', fontWeight: 700, color: "#64748b" }}>Account Rep: <span style={{ color: accent }}>{viewerName || "Client Portal"}</span></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>{company?.name}</div>
              <span style={{ fontWeight: 900, fontSize: '20px' }}>INSURE<span style={{ color: accent }}>WORLD</span></span>
           </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* JOB HEADER */}
        <div style={{ background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "40px" }}>
           <h1 style={{ fontSize: "38px", fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.02em" }}>{job?.title}</h1>
           <div>
              <div style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Client Notes</div>
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", fontSize: "15px", lineHeight: "1.7", color: "#334155", whiteSpace: "pre-wrap" }}>
                {job?.client_notes || "No additional notes provided."}
              </div>
           </div>
        </div>

        {/* CANDIDATE LIST */}
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Candidate</th>
                <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tankItems?.map((item: any) => {
                const c = item.candidates;
                const card = cardMap.get(c.id);
                const status = statusMap.get(c.id);
                const isUnlocked = status === "completed";
                const isPending = status === "new";
                
                // NEW LOGIC: Check the client's decision first!
                const clientDecision = item.client_status; // 'interested', 'pass', or 'pending'

                // Status Badge Logic
                let badgeLabel = "Locked";
                let badgeColor = "#f1f5f9"; // gray
                let badgeText = "#64748b";

                if (clientDecision === "interested") {
                    badgeLabel = "Interested";
                    badgeColor = "#dcfce7"; // green
                    badgeText = "#166534";
                } else if (clientDecision === "pass") {
                    badgeLabel = "Passed";
                    badgeColor = "#fee2e2"; // red
                    badgeText = "#991b1b";
                } else if (isUnlocked) {
                    badgeLabel = "Unlocked";
                    badgeColor = "#dcfce7"; 
                    badgeText = "#166534";
                } else if (isPending) {
                    badgeLabel = "Pending";
                    badgeColor = "#fef9c3"; // yellow
                    badgeText = "#ca8a04";
                }

                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "24px 20px" }}>
                        {isUnlocked ? (
                          <Link href={`/c/${token}/candidates/${c.id}?u=${rawEmail || ""}&job_id=${job_id}`} style={{ fontSize: "17px", fontWeight: 800, color: accent, textDecoration: "none" }}>
                            {c.full_name}
                          </Link>
                        ) : (
                          <div style={{ fontSize: "17px", fontWeight: 800, color: "#cbd5e1", filter: "blur(4px)" }}>Hidden Name</div>
                        )}
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                          {card?.target_role && <span style={chipStyle}>{card.target_role}</span>}
                          {card?.current_company && <span style={chipStyle}>{card.current_company}</span>}
                          {card?.years_experience && <span style={chipStyle}>{card.years_experience} Yrs Exp</span>}
                          {card?.location_blurb && <span style={chipStyle}>{card.location_blurb}</span>}
                          {card?.salary_expectation && <span style={chipStyle}>${card.salary_expectation}</span>}
                          {card?.licenses && <span style={{ ...chipStyle, background: '#e0e7ff', color: '#4338ca' }}>{card.licenses}</span>}
                        </div>
                    </td>

                    <td style={{ padding: "20px" }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          background: badgeColor, 
                          color: badgeText,
                          textTransform: 'uppercase'
                        }}>
                          {badgeLabel}
                        </span>
                    </td>

                    <td style={{ padding: "20px" }}>
                        {isUnlocked ? (
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {/* If they haven't decided yet, encourage them to View Profile */}
                            <Link href={`/c/${token}/candidates/${c.id}?u=${rawEmail || ""}&job_id=${job_id}`} style={{ color: accent, fontWeight: 700, textDecoration: "none", fontSize: '13px' }}>
                                {clientDecision === 'pending' ? 'Review & Decide →' : 'View Profile'}
                            </Link>
                          </div>
                        ) : !isPending && (
                          <form action={requestIntro}>
                            <input type="hidden" name="candidate_id" value={c.id}/>
                            <button type="submit" style={{ background: accent, color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Request Intro</button>
                          </form>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}