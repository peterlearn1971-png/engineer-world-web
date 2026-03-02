import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import CandidateNotes from "@/components/CandidateNotes"; 

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string; candidate_id: string }>;
  searchParams: Promise<{ u?: string; job_id?: string }>;
}

export default async function ClientCandidateProfilePage(props: PageProps) {
  const { token, candidate_id } = await props.params;
  const { u: rawEmail, job_id } = await props.searchParams;

  // 1. SECURITY & COMPANY
  const { data: tokenRow } = await supabaseAdmin.from("company_portal_tokens").select("company_id").eq("token", token).single();
  if (!tokenRow || !tokenRow.company_id) return <div style={{ padding: 60 }}>Access Denied</div>;
  const currentCompanyId = tokenRow.company_id;
  const { data: company } = await supabaseAdmin.from("companies").select("name").eq("id", currentCompanyId).single();

  // 2. ACCOUNT REP
  const cleanEmail = rawEmail ? decodeURIComponent(rawEmail).trim().toLowerCase() : undefined;
  let viewerName = "";
  if (cleanEmail) {
    const { data: user } = await supabaseAdmin.from("company_users").select("name, email").ilike("email", cleanEmail).maybeSingle();
    if (user) viewerName = user.name || user.email;
  }

  // 3. FETCH PROFILE DATA
  const { data: candidate } = await supabaseAdmin.from("candidates").select("*").eq("id", candidate_id).single();
  const { data: card } = await supabaseAdmin.from("candidate_cards").select("*").eq("candidate_id", candidate_id).single();

  // 4. FETCH EXISTING NOTES
  let initialNote = "";
  if (job_id) {
    const { data: tankItem } = await supabaseAdmin
      .from("job_tank_items")
      .select("client_note")
      .eq("job_id", job_id)
      .eq("candidate_id", candidate_id)
      .maybeSingle();
    initialNote = tankItem?.client_note || "";
  }

  if (!candidate) return <div style={{ padding: 60 }}>Candidate profile not found.</div>;

  // STYLES
  const black = "#000", accent = "#6366f1";
  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' };
  const boxStyle: React.CSSProperties = { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, color: "#334155", minHeight: "45px" };

  // BACK BUTTON LOGIC
  const backUrl = job_id ? `/c/${token}/jobs/${job_id}?u=${rawEmail || ""}` : `/c/${token}?u=${rawEmail || ""}`;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      
      {/* TRIPLE-SECTION NAVBAR */}
      <nav style={{ background: "white", padding: "15px 40px", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', maxWidth: "1200px", margin: "0 auto" }}>
           <Link href={backUrl} style={{ fontWeight: 700, color: "#64748b", textDecoration: "none" }}>← Back</Link>
           <div style={{ fontSize: '15px', fontWeight: 700 }}>Account Rep: <span style={{ color: accent }}>{viewerName || "Client Portal"}</span></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>{company?.name}</div>
              <span style={{ fontWeight: 900, fontSize: '20px' }}>INSURE<span style={{ color: accent }}>WORLD</span></span>
           </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "30px" }}>
           <h1 style={{ fontSize: "52px", fontWeight: 900, margin: "0 0 4px 0" }}>{candidate.full_name}</h1>
           <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>Ref: {candidate.id.split('-')[0].toUpperCase()}</div>
        </div>

        {/* NOTES BOX */}
        {job_id && <CandidateNotes jobId={job_id} candidateId={candidate_id} initialNote={initialNote} />}

        {/* PROFILE GRID */}
        <div style={{ background: "white", padding: "35px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
           <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "35px" }}>Client-Facing Profile</h2>
           
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "30px" }}>
              <div><div style={labelStyle}>Current Role</div><div style={boxStyle}>{card?.target_role}</div></div>
              <div><div style={labelStyle}>Company</div><div style={boxStyle}>{card?.current_company}</div></div>
              <div><div style={labelStyle}>Experience</div><div style={boxStyle}>{card?.years_experience} Yrs</div></div>
              <div><div style={labelStyle}>Location</div><div style={boxStyle}>{card?.location_blurb}</div></div>
              <div><div style={labelStyle}>Salary</div><div style={boxStyle}>{card?.salary_expectation}</div></div>
              <div><div style={labelStyle}>Licenses</div><div style={{ ...boxStyle, border: "2px solid #e0e7ff", color: "#4338ca" }}>{card?.licenses}</div></div>

              {/* INTEGRATED LINKS */}
              <div><div style={labelStyle}>Resume</div><div style={boxStyle}>
                {candidate.resume_url ? <a href={candidate.resume_url} target="_blank" style={{ color: accent }}>📄 View Resume</a> : "N/A"}
              </div></div>
              <div style={{ gridColumn: "span 2" }}><div style={labelStyle}>LinkedIn</div><div style={boxStyle}>
                {card?.linkedin_url ? <a href={card.linkedin_url} target="_blank" style={{ color: accent }}>{card.linkedin_url}</a> : "Confidential"}
              </div></div>
           </div>

           <div style={{ marginTop: "30px" }}>
              <div style={labelStyle}>Professional Summary</div>
              <div style={{ ...boxStyle, minHeight: "140px", whiteSpace: "pre-wrap", background: "white", fontWeight: 500 }}>{card?.summary}</div>
           </div>
        </div>
      </div>
    </div>
  );
}