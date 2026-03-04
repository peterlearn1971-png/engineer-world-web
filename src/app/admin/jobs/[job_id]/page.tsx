import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ job_id: string }>;
}

export default async function AdminJobPage(props: PageProps) {
  const params = await props.params;
  const { job_id } = params;
  
  // 1. FETCH JOB
  const { data: job } = await supabaseAdmin.from("jobs").select("*, companies(id, name)").eq("id", job_id).single();
  if (!job) return <div style={{ padding: 40 }}>Job not found</div>;

  // 2. FETCH REPS
  const { data: reps } = await supabaseAdmin.from("company_users").select("id, name, email").order("name");

  // 3. FETCH PENDING REQUESTS
  const { data: requests } = await supabaseAdmin
    .from("intro_requests")
    .select("*, candidates(full_name)")
    .eq("job_id", job_id)
    .neq("status", "completed")
    .order("created_at", { ascending: false });

  // 4. FETCH CANDIDATES IN TANK
  const { data: tankItems } = await supabaseAdmin
    .from("job_tank_items")
    .select("*, candidates(id, full_name, email)")
    .eq("job_id", job_id)
    .order("created_at", { ascending: false });

  // 5. [NEW] FETCH COMPANY SUCCESS STATS (Marketing Data)
  // This counts how many *other* jobs for this company are marked 'filled'
  const { count: filledCount } = await supabaseAdmin
    .from("jobs")
    .select("*", { count: 'exact', head: true })
    .eq("company_id", job.companies?.id)
    .eq("status", "filled");

  // --- ACTIONS ---
  
  async function approveRequest(formData: FormData) {
    "use server";
    const reqId = formData.get("request_id")?.toString();
    if (reqId) {
      await supabaseAdmin.from("intro_requests").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", reqId);
      revalidatePath(`/admin/jobs/${job_id}`);
    }
  }

  async function updateJob(formData: FormData) {
    "use server";
    const id = formData.get("target_job_id")?.toString(); 
    const title = formData.get("title")?.toString();
    const status = formData.get("status")?.toString(); 
    const location = formData.get("location")?.toString();
    const work_mode = formData.get("work_mode")?.toString();
    const comp_band = formData.get("comp_band")?.toString();
    const languages = formData.get("languages")?.toString();
    const client_notes = formData.get("client_notes")?.toString();
    const owner_user_id = formData.get("owner_user_id")?.toString() || null;

    if (id) {
      const { error } = await supabaseAdmin.from("jobs").update({
        title, 
        status, 
        location, 
        work_mode, 
        comp_band, 
        languages, 
        client_notes, 
        owner_user_id,
        updated_at: new Date().toISOString()
      }).eq("id", id);

      if (error) {
        console.error("SUPABASE ERROR:", error.message);
      } else {
        revalidatePath(`/admin/jobs/${id}`);
      }
    }
  }

  async function removeFromTank(formData: FormData) {
    "use server";
    const itemId = formData.get("item_id")?.toString();
    if (itemId) {
      await supabaseAdmin.from("job_tank_items").delete().eq("id", itemId);
      revalidatePath(`/admin/jobs/${job_id}`);
    }
  }

  // Styles
  const navy = "#0f172a";
  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em', display: 'block' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: navy, outline: 'none' };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
             <Link href="/admin/jobs" style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textDecoration: "none" }}>← BACK TO JOBS</Link>
             <h1 style={{ fontSize: "32px", fontWeight: 900, color: navy, marginTop: "8px" }}>{job.title}</h1>
             <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#6366f1" }}>{job.companies?.name}</div>
                
                {/* NEW: SUCCESS STATS BADGE */}
                <div style={{ fontSize: "11px", fontWeight: 800, background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "6px" }}>
                    🏆 {filledCount || 0} Roles Filled Total
                </div>
             </div>
          </div>
          <Link href={`/admin/candidates?q=${encodeURIComponent(job.title)}`} style={{ background: "white", padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", fontWeight: 700, textDecoration: "none", color: navy }}>
                Find Candidates
          </Link>
        </div>

        {/* ALERTS (Pending Requests) */}
        {requests && requests.length > 0 && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "16px", padding: "24px", marginBottom: "40px" }}>
             <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#be123c", marginBottom: "12px" }}>🚨 {requests.length} Pending Intro Request(s)</h3>
             {requests.map(req => (
               <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "12px", borderRadius: "8px", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{req.candidates?.full_name}</div>
                  <form action={approveRequest}>
                    <input type="hidden" name="request_id" value={req.id} />
                    <button type="submit" style={{ background: "#be123c", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Approve & Unlock</button>
                  </form>
               </div>
             ))}
          </div>
        )}

        {/* JOB DETAILS FORM */}
        <form action={updateJob} style={{ background: "white", padding: "40px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "30px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>Job Context & Details</h2>
          
          <input type="hidden" name="target_job_id" value={job_id} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
             <div>
                <label style={labelStyle}>Job Title</label>
                <input name="title" defaultValue={job.title} style={inputStyle} />
             </div>
             
             {/* UPDATED: STATUS DROPDOWN WITH 'FILLED' */}
             <div>
                <label style={labelStyle}>Status</label>
                <select name="status" defaultValue={job.status || "open"} style={{ ...inputStyle, cursor: "pointer", background: "#f8fafc" }}>
                   <option value="open">Open (Active)</option>
                   <option value="hold">On Hold</option>
                   <option value="filled">✅ Filled (Success!)</option>
                   <option value="closed">Closed (Unsuccessful)</option>
                </select>
             </div>
             
             <div>
                <label style={labelStyle}>Assigned Rep</label>
                <select name="owner_user_id" defaultValue={job.owner_user_id || ""} style={{ ...inputStyle, cursor: "pointer", background: "#f8fafc" }}>
                   <option value="">-- Unassigned --</option>
                   {reps?.map((r: any) => (
                     <option key={r.id} value={r.id}>{r.name || r.email}</option>
                   ))}
                </select>
             </div>

             <div>
                <label style={labelStyle}>Location</label>
                <input name="location" defaultValue={job.location} style={inputStyle} />
             </div>
             <div>
                <label style={labelStyle}>Work Mode</label>
                <input name="work_mode" defaultValue={job.work_mode} style={inputStyle} />
             </div>
             <div>
                <label style={labelStyle}>Comp Band</label>
                <input name="comp_band" defaultValue={job.comp_band} style={inputStyle} />
             </div>
             <div>
                <label style={labelStyle}>Preferred Languages</label>
                <input name="languages" defaultValue={job.languages} style={inputStyle} />
             </div>
          </div>

          <div style={{ marginBottom: "30px" }}>
             <label style={labelStyle}>Client Notes</label>
             <textarea name="client_notes" defaultValue={job.client_notes} style={{ ...inputStyle, minHeight: "200px" }} />
          </div>

          <div style={{ textAlign: "right" }}>
             <button type="submit" style={{ background: "#0f172a", color: "white", padding: "14px 40px", borderRadius: "12px", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer" }}>
               Save Changes
             </button>
          </div>
        </form>

        {/* CANDIDATES IN TANK LIST */}
        <div style={{ background: "white", padding: "40px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Candidates in this Tank ({tankItems?.length || 0})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
             {tankItems?.map((item: any) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "10px" }}>
                   <Link href={`/admin/candidates/${item.candidate_id}`} style={{ fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>
                      {item.candidates?.full_name || "Unknown Candidate"} →
                   </Link>
                   <form action={removeFromTank}>
                      <input type="hidden" name="item_id" value={item.id} />
                      <button type="submit" style={{ color: "#ef4444", background: "white", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Remove</button>
                   </form>
                </div>
             ))}
             {(!tankItems || tankItems.length === 0) && (
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>No candidates added yet.</div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}