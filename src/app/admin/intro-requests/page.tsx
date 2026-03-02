import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// --- 1. CREATE ADMIN SUPABASE CLIENT (Bypasses RLS) ---
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminIntroRequestsPage() {
  // --- 2. SECURITY BOUNCER ---
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_key")?.value;
  const secret = "PeterRyan1974!!";
  
  if (cookieSecret !== secret) {
    redirect("/admin/login");
  }

  // --- 3. FETCH REAL DATA ---
  const { data: rawRequests, error } = await supabaseAdmin
    .from("intro_requests")
    .select(`
      id,
      status,
      created_at,
      candidate_id,
      job_id,
      candidates ( full_name ),
      companies ( name )
    `)
    .order("created_at", { ascending: false });

  if (error) console.error("Supabase Admin Fetch Error:", error);
  const requests = rawRequests || [];

  // --- 4. THE ACCEPT ENGINE ---
  async function acceptRequest(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const candidateId = formData.get("candidateId") as string;
    const jobId = formData.get("jobId") as string;

    // A. Update the request status to 'completed'
    await supabaseAdmin.from("intro_requests").update({ status: "completed" }).eq("id", id);
    
    // B. Unlock the profile for the employer in the Job Tank
    if (candidateId && jobId) {
      await supabaseAdmin
        .from("job_tank_items")
        .update({ visible_to_client: true })
        .match({ candidate_id: candidateId, job_id: jobId });
    }
    
    revalidatePath("/admin/intro-requests");
  }

  // --- 5. THE REJECT ENGINE ---
  async function rejectRequest(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const candidateId = formData.get("candidateId") as string;
    const jobId = formData.get("jobId") as string;

    // A. Update the request status to 'declined'
    await supabaseAdmin.from("intro_requests").update({ status: "declined" }).eq("id", id);
    
    // B. Ensure the profile stays hidden in the Job Tank
    if (candidateId && jobId) {
      await supabaseAdmin
        .from("job_tank_items")
        .update({ visible_to_client: false, status: "declined" })
        .match({ candidate_id: candidateId, job_id: jobId });
    }
    
    revalidatePath("/admin/intro-requests");
  }

  const indigo = "#6366f1";
  const navy = "#0f172a";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: navy }}>
      <header style={{ background: "white", padding: "20px 40px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', cursor: 'pointer' }}>
            INSURE<span style={{ color: indigo }}>WORLD</span> <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', textTransform: 'uppercase' }}>Admin</span>
          </div>
        </Link>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
          Authenticated Administrator
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>Intro Requests</h1>
          <span style={{ background: '#e0e7ff', color: indigo, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            {requests.length} Total
          </span>
        </div>

        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Candidate</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Target Company</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 24px", textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => {
                const candidateName = req.candidates?.full_name || "Unknown Candidate";
                const companyName = req.companies?.name || "Unknown Company";
                const dateString = new Date(req.created_at).toLocaleDateString();

                return (
                  <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "20px 24px", fontWeight: 600 }}>{candidateName}</td>
                    <td style={{ padding: "20px 24px", color: "#475569" }}>{companyName}</td>
                    <td style={{ padding: "20px 24px", color: "#94a3b8", fontSize: '14px' }}>{dateString}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        background: req.status === 'new' ? '#fff7ed' : req.status === 'completed' ? '#f0fdf4' : '#fef2f2',
                        color: req.status === 'new' ? '#9a3412' : req.status === 'completed' ? '#166534' : '#991b1b'
                      }}>
                        {req.status === 'new' ? 'Pending' : req.status}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", textAlign: 'right' }}>
                      
                      {/* ONLY SHOW BUTTONS IF "new" */}
                      {req.status === 'new' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <form action={acceptRequest}>
                            <input type="hidden" name="id" value={req.id} />
                            <input type="hidden" name="candidateId" value={req.candidate_id || ''} />
                            <input type="hidden" name="jobId" value={req.job_id || ''} />
                            <button type="submit" style={{ background: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                              Accept & Reveal
                            </button>
                          </form>

                          <form action={rejectRequest}>
                            <input type="hidden" name="id" value={req.id} />
                            <input type="hidden" name="candidateId" value={req.candidate_id || ''} />
                            <input type="hidden" name="jobId" value={req.job_id || ''} />
                            <button type="submit" style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>Action Complete</span>
                      )}

                    </td>
                  </tr>
                );
              })}
              
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    No intro requests found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}