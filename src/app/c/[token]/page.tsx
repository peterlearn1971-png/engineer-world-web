import React from "react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage(props: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ u?: string }>;
}) {
  const { token } = await props.params;
  const { u: rawEmail } = await props.searchParams;
  
  const { data: tokenRow } = await supabaseAdmin.from("company_portal_tokens").select("company_id").eq("token", token).single();
  if (!tokenRow) return <div style={{ padding: 40 }}>Invalid Link</div>;
  
  const { data: company } = await supabaseAdmin.from("companies").select("*").eq("id", tokenRow.company_id).single();
  const cleanEmail = rawEmail ? decodeURIComponent(rawEmail).trim().toLowerCase() : undefined;
  
  let viewer = null;
  if (cleanEmail) {
    const { data: user } = await supabaseAdmin.from("company_users").select("*").ilike("email", cleanEmail).maybeSingle();
    viewer = user;
  }

  // STRICT OWNERSHIP FILTER
  let jobQuery = supabaseAdmin.from("jobs").select("*, companies(name)").eq("company_id", company.id);
  if (viewer) {
    jobQuery = jobQuery.eq("owner_user_id", viewer.id);
  }
  const { data: jobs } = await jobQuery.order("created_at", { ascending: false });

  const navy = "#0f172a";
  const accent = "#6366f1";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* BRANDED NAVBAR */}
      <nav style={{ background: "white", padding: "20px 40px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', maxWidth: "1200px", margin: "0 auto" }}>
           <div style={{ fontSize: '18px', fontWeight: 800, color: navy }}>{company?.name}</div>
           <span style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-0.02em' }}>
             INSURE<span style={{ color: accent }}>WORLD</span>
           </span>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
           <h1 style={{ fontSize: "42px", fontWeight: 900, marginBottom: "16px" }}>Active Job Openings</h1>
           {viewer && (
             <div style={{ fontSize: "18px", color: "#64748b", fontWeight: 600 }}>
               Welcome back, <span style={{ color: accent }}>{viewer.name || viewer.email}</span>
             </div>
           )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {jobs?.map(job => (
             <div key={job.id} style={{ background: "white", padding: "32px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                   <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>{job.title}</h2>
                   <div style={{ color: "#64748b", marginTop: "8px" }}>{job.location} • {job.work_mode}</div>
                </div>
                <Link href={`/c/${token}/jobs/${job.id}${rawEmail ? `?u=${encodeURIComponent(rawEmail)}` : ""}`}
                      style={{ background: accent, color: "white", padding: "14px 28px", borderRadius: "12px", fontWeight: 800, textDecoration: "none" }}>
                  Open Job Tank
                </Link>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}