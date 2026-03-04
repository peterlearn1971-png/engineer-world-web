import Link from "next/link";
import React from "react";
import DeleteButton from "./DeleteButton"; 
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const cleanRef = (id: string) => id ? id.split("-")[0].toUpperCase() : "";

export default async function AdminCandidatePage(props: {
  params: Promise<{ candidate_id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedParams = await props.params;
  const candidate_id = resolvedParams?.candidate_id;
  const sp = await props.searchParams;
  const success = sp?.success;
  const errorMsg = sp?.error;

  // FETCH DATA
  const { data: candidate } = await supabaseAdmin.from("candidates").select("*").eq("id", candidate_id).maybeSingle();
  
  if (!candidate) {
    return (
      <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <Link href="/admin/candidates" style={{ color: '#6366f1', fontWeight: 700 }}>← Back to List</Link>
        <h1 style={{ marginTop: 20 }}>Candidate Not Found</h1>
        <p>Could not find candidate ID: <code>{candidate_id}</code></p>
      </main>
    );
  }

  const { data: card } = await supabaseAdmin.from("candidate_cards").select("*").eq("candidate_id", candidate_id).maybeSingle();

  // --- FETCH DATA FOR THE JOB TANK DROPDOWN ---
  const { data: allJobs } = await supabaseAdmin
    .from("jobs")
    .select(`id, title, location, work_mode, owner_user_id, companies ( name )`);

  const { data: allReps } = await supabaseAdmin.from("company_users").select("*");
  const repMap = new Map();
  allReps?.forEach(r => {
    const displayName = r.full_name || r.email || "Unnamed Rep";
    if (r.id) repMap.set(r.id, displayName);
    if (r.user_id) repMap.set(r.user_id, displayName);
    if (r.auth_user_id) repMap.set(r.auth_user_id, displayName);
  });

  const { data: tankItems } = await supabaseAdmin
    .from("job_tank_items")
    .select(`id, job_id, jobs (id, title, companies(name))`)
    .eq("candidate_id", candidate_id);
  // --------------------------------------------------

  // STYLES
  const section: React.CSSProperties = { 
    background: 'white', 
    padding: '32px', 
    borderRadius: '16px', 
    borderWidth: '1px', 
    borderStyle: 'solid', 
    borderColor: '#e2e8f0', 
    marginBottom: '32px' 
  };
  
  const label: React.CSSProperties = { 
    display: 'block', 
    fontSize: '11px', 
    fontWeight: 900, 
    color: '#94a3b8', 
    textTransform: 'uppercase', 
    marginBottom: '8px' 
  };
  
  const input: React.CSSProperties = { 
    width: '100%', 
    padding: '14px', 
    borderRadius: '10px', 
    borderWidth: '1px', 
    borderStyle: 'solid', 
    borderColor: '#e2e8f0', 
    background: '#f8fafc', 
    fontSize: '15px', 
    boxSizing: 'border-box' 
  };

  // HELPER: Convert DB Arrays to comma-separated strings for the input box
  const arrayToValue = (val: any) => {
    if (Array.isArray(val)) return val.join(", ");
    return val || "";
  };

  return (
    <main style={{ padding: "60px 20px", maxWidth: '1000px', margin: "0 auto", fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <Link href="/admin/candidates" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 700 }}>← Back</Link>
           <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '8px 0' }}>{candidate.full_name || candidate.name}</h1>
           <p style={{ color: '#94a3b8', fontSize: '14px' }}>Ref: {cleanRef(candidate.id)}</p>
        </div>
        {success === 'true' && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}>✅ Changes Saved</div>}
        {errorMsg && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}>⚠️ Error: {errorMsg}</div>}
      </div>

      {/* --- SECTION: JOB TANK ASSIGNMENTS --- */}
      <div style={{ ...section, borderTopWidth: "4px", borderTopColor: "#0f172a" }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>Job Tank Assignments</h3>
        
        {/* List of Active Assignments */}
        <div style={{ marginBottom: '24px' }}>
          {tankItems?.map((item: any) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "12px 16px", borderRadius: "8px", marginBottom: 8 }}>
              <span>🚀 {item.jobs?.companies?.name || "Job"}: {item.jobs?.title}</span>
              
              {/* X Button to remove them from this tank */}
              <form action="/api/admin/job-tank/remove" method="POST" style={{ margin: 0 }}>
                <input type="hidden" name="candidate_id" value={candidate.id} />
                <input type="hidden" name="job_id" value={item.job_id} />
                <input type="hidden" name="return_to" value={`/admin/candidates/${candidate.id}`} />
                <button type="submit" style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 900, fontSize: "16px", padding: "0 4px" }} title="Remove Candidate from Tank">
                  ×
                </button>
              </form>
            </div>
          ))}
          {(!tankItems || tankItems.length === 0) && (
            <div style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>This candidate is not currently assigned to any Job Tanks.</div>
          )}
        </div>

        {/* Add to Tank Dropdown */}
        <form action="/api/admin/job-tank/add" method="POST" style={{ display: 'flex', gap: '12px' }}>
          <input type="hidden" name="candidate_id" value={candidate.id} />
          <input type="hidden" name="return_to" value={`/admin/candidates/${candidate.id}`} />
          
          <select name="job_id" required style={{ ...input, flex: 1, padding: "12px" }}>
            <option value="">Select a Job to assign...</option>
            {allJobs?.map((j: any) => {
              const repName = repMap.get(j.owner_user_id) || "Unassigned";
              return (
                <option key={j.id} value={j.id}>
                  {j.companies?.name || 'Unknown Co'} | {j.title} | {j.location || j.work_mode || 'Remote'} | Rep: {repName}
                </option>
              );
            })}
          </select>
          <button type="submit" style={{ padding: "12px 24px", background: "black", color: "white", borderRadius: "10px", fontWeight: 800, border: "none", cursor: "pointer" }}>
            Add to Tank
          </button>
        </form>
      </div>

      <div style={section}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>Client-Facing Profile</h3>
        <form action="/api/admin/candidate-cards/upsert" method="POST">
           <input type="hidden" name="candidate_id" value={candidate.id} />
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><span style={label}>Current Role</span><input name="target_role" defaultValue={card?.target_role || ""} style={input} /></div>
              <div><span style={label}>Current Company</span><input name="current_company" defaultValue={card?.current_company || ""} style={input} /></div>
              <div><span style={label}>Years Exp</span><input name="years_experience" type="number" defaultValue={card?.years_experience || 0} style={input} /></div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><span style={label}>Location (Blurb)</span><input name="location_blurb" defaultValue={card?.location_blurb || ""} style={input} /></div>
              <div>
                <span style={label}>Languages</span>
                <input name="languages" defaultValue={arrayToValue(card?.languages)} placeholder="e.g. English, French" style={input} />
              </div>
              <div>
                <span style={label}>Skills</span>
                <input name="skills" defaultValue={arrayToValue(card?.skills)} placeholder="e.g. Auto, Commercial" style={input} />
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><span style={label}>Salary Expectation</span><input name="salary_expectation" defaultValue={card?.salary_expectation || ""} style={input} /></div>
              <div><span style={label}>Availability</span><input name="availability" defaultValue={card?.availability || ""} style={input} /></div>
              <div><span style={label}>Work Mode</span><input name="work_mode" defaultValue={card?.work_mode || ""} style={input} /></div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
              <div><span style={label}>Licenses</span><input name="license_certification" defaultValue={card?.license_certification || ""} style={input} /></div>
              <div><span style={label}>LinkedIn URL</span><input name="linkedin_url" defaultValue={card?.linkedin_url || ""} style={input} /></div>
           </div>

           <div>
              <span style={label}>Client-Facing Summary</span>
              <textarea name="summary" defaultValue={card?.summary || ""} style={{ ...input, minHeight: '120px' }} />
           </div>
           
           <button type="submit" style={{ width: '100%', padding: '16px', background: 'black', color: 'white', borderRadius: '10px', fontWeight: 800, marginTop: 20, border: 'none', cursor: 'pointer' }}>Save Client-Facing Profile</button>
        </form>
      </div>

      {/* --- SECTION: STEALTH PREFERENCES (READ-ONLY) --- */}
      <div style={{ ...section, background: candidate.stealth_mode ? '#0f172a' : '#f8fafc', borderColor: candidate.stealth_mode ? '#0f172a' : '#e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: candidate.stealth_mode ? 'white' : '#0f172a' }}>Stealth Job Match (Candidate Preferences)</h3>
          {candidate.stealth_mode ? (
             <span style={{ fontSize: "11px", background: "#6366f1", color: "white", padding: "6px 12px", borderRadius: "8px", fontWeight: 900, textTransform: "uppercase" }}>🟢 Active</span>
          ) : (
             <span style={{ fontSize: "11px", background: "#e2e8f0", color: "#64748b", padding: "6px 12px", borderRadius: "8px", fontWeight: 900, textTransform: "uppercase" }}>⚪ Off</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
              <span style={{ ...label, color: candidate.stealth_mode ? '#94a3b8' : '#64748b' }}>Target Roles</span>
              <div style={{ padding: '14px', background: candidate.stealth_mode ? '#1e293b' : 'white', borderRadius: '10px', fontSize: '15px', color: candidate.stealth_mode ? 'white' : 'black' }}>
                  {arrayToValue(candidate.target_roles) || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not specified</span>}
              </div>
          </div>
          <div>
              <span style={{ ...label, color: candidate.stealth_mode ? '#94a3b8' : '#64748b' }}>Target Salary</span>
              <div style={{ padding: '14px', background: candidate.stealth_mode ? '#1e293b' : 'white', borderRadius: '10px', fontSize: '15px', color: candidate.stealth_mode ? 'white' : 'black' }}>
                  {card?.salary_expectation ? `$${card.salary_expectation}` : <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not specified</span>}
              </div>
          </div>
          <div>
              <span style={{ ...label, color: candidate.stealth_mode ? '#94a3b8' : '#64748b' }}>Target Locations</span>
              <div style={{ padding: '14px', background: candidate.stealth_mode ? '#1e293b' : 'white', borderRadius: '10px', fontSize: '15px', color: candidate.stealth_mode ? 'white' : 'black' }}>
                  {card?.location_blurb || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not specified</span>}
              </div>
          </div>
          <div>
              <span style={{ ...label, color: candidate.stealth_mode ? '#94a3b8' : '#64748b' }}>Target Organizations</span>
              <div style={{ padding: '14px', background: candidate.stealth_mode ? '#1e293b' : 'white', borderRadius: '10px', fontSize: '15px', color: candidate.stealth_mode ? 'white' : 'black' }}>
                  {arrayToValue(candidate.target_companies) || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not specified</span>}
              </div>
          </div>
        </div>
        <div>
          <span style={{ ...label, color: candidate.stealth_mode ? '#94a3b8' : '#64748b' }}>Confidential Avoid List</span>
          <div style={{ padding: '14px', background: candidate.stealth_mode ? '#1e293b' : 'white', borderRadius: '10px', fontSize: '15px', color: candidate.stealth_mode ? 'white' : 'black', borderWidth: '1px', borderStyle: 'solid', borderColor: candidate.stealth_mode ? '#ef4444' : '#e2e8f0' }}>
              {candidate.excluded_companies || <span style={{ color: '#64748b', fontStyle: 'italic' }}>No companies excluded</span>}
          </div>
        </div>
      </div>
      {/* ---------------------------------------------------- */}

      <div style={section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Candidate Resume</h3>
          {candidate.resume_url && (
            <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, textTransform: "uppercase" }}>
              ✓ File Attached
            </span>
          )}
        </div>

        <form action="/api/admin/candidates/upload-resume" method="POST" encType="multipart/form-data" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <input type="hidden" name="candidate_id" value={candidate.id} />
          
          <input 
            type="file" 
            name="resume" 
            accept=".pdf,.doc,.docx"
            required 
            style={{ padding: "10px", borderWidth: "1px", borderStyle: "solid", borderColor: "#cbd5e1", borderRadius: "8px", fontSize: "14px", flex: 1, background: "#f8fafc" }}
          />
          
          <button type="submit" style={{ padding: "12px 24px", background: "#6366f1", color: "white", borderRadius: "8px", fontWeight: 800, border: "none", cursor: "pointer", transition: "all 0.2s" }}>
            Upload File
          </button>
        </form>

        {candidate.resume_url && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#f1f5f9", fontSize: "14px" }}>
            <a href={candidate.resume_url} target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 800 }}>
              Open Current Resume in New Tab →
            </a>
          </div>
        )}
      </div>

      <div style={{ ...section, borderStyle: 'dashed' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>Internal Notes</h3>
        <form action="/api/admin/candidates/update" method="POST">
           <input type="hidden" name="candidate_id" value={candidate.id} />
           <textarea name="notes" defaultValue={candidate.internal_notes || ""} style={{ ...input, minHeight: '100px', background: '#fff' }} />
           <button type="submit" style={{ marginTop: '12px', padding: '10px 20px', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e2e8f0', cursor: 'pointer' }}>Save Internal Notes</button>
        </form>
      </div>
      
      <DeleteButton candidateId={candidate.id} />
    </main>
  );
}