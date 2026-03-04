import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  // 1. FETCH COMPANIES
  const { data: companies } = await supabaseAdmin
    .from("companies")
    .select("id, name")
    .order("name", { ascending: true });

  // 2. FETCH REPS (Restored this query so the list isn't empty)
  const { data: reps } = await supabaseAdmin
    .from("company_users")
    .select("id, name, email")
    .eq("active", true)
    .order("name", { ascending: true });

  // 3. SERVER ACTION: CREATE JOB
  async function createJob(formData: FormData) {
    "use server";
    const title = formData.get("title")?.toString();
    const company_id = formData.get("company_id")?.toString();
    const owner_user_id = formData.get("owner_user_id")?.toString(); // Capture the owner!
    const status = formData.get("status")?.toString().toLowerCase() || 'open';
    const location = formData.get("location")?.toString();

    if (!title || !company_id) return;

    const { data: newJob, error } = await supabaseAdmin.from("jobs").insert({
        title,
        company_id,
        owner_user_id, // Save the owner if selected
        status,
        location,
        work_mode: "Hybrid",
        created_at: new Date().toISOString()
    }).select().single();

    if (newJob) redirect(`/admin/jobs/${newJob.id}`);
  }

  const navy = "#0f172a";
  const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, color: navy, outline: 'none', background: '#fff' };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Link href="/admin/jobs" style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textDecoration: "none", marginBottom: "20px", display: "inline-block" }}>← Cancel & Back</Link>
        
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: navy, marginBottom: "40px" }}>Post New Job</h1>

        <form action={createJob} style={{ background: "white", padding: "40px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                {/* COMPANY SELECTOR */}
                <div>
                    <label style={labelStyle}>Client Company</label>
                    <select name="company_id" required style={inputStyle}>
                        <option value="">Select Company...</option>
                        {companies?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* JOB OWNER (REPS) - Restored! */}
                <div>
                    <label style={labelStyle}>Job Owner (Rep)</label>
                    <select name="owner_user_id" style={inputStyle}>
                        <option value="">Select a Rep...</option>
                        {reps?.map((r: any) => (
                            <option key={r.id} value={r.id}>{r.name || r.email}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Job Title</label>
                <input name="title" required placeholder="e.g. Commercial Account Manager" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                <div>
                    <label style={labelStyle}>Location</label>
                    <input name="location" placeholder="e.g. Toronto" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Status</label>
                    <select name="status" style={inputStyle}>
                        <option value="open">Open (Active)</option>
                        <option value="hold">On Hold</option>
                    </select>
                </div>
            </div>

            <button type="submit" style={{ width: "100%", padding: "16px", background: navy, color: "white", fontSize: "16px", fontWeight: 800, borderRadius: "12px", border: "none", cursor: "pointer" }}>
                Create Insurance Job Listing
            </button>
        </form>
      </div>
    </div>
  );
}