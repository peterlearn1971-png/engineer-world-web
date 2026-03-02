import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CopyTextButton from "@/components/CopyTextButton";
import { humanRef } from "@/lib/refs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CompanyRow = {
  id: string;
  name: string | null;
  contact_name: string | null;
  contact_email: string | null;
};

export default async function AdminCompaniesPage() {
  // 1. SECURITY (Cookie Check)
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_key")?.value;
  const secret = "PeterRyan1974!!";
  if (cookieSecret !== secret) redirect("/admin/login");

  // 2. DATA FETCHING (Exactly your original logic)
  const { data: companies, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, contact_name, contact_email")
    .order("name", { ascending: true });

  const indigo = "#6366f1";
  const navy = "#0f172a";

  if (error) {
    return (
      <div style={{ padding: "40px", color: "#ef4444" }}>
        Error loading companies: {error.message}
      </div>
    );
  }

  const companyList = companies ?? [];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: navy }}>
      {/* PERSISTENT HEADER */}
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

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 20px" }}>
        {/* ACTION BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Companies</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              {companyList.length} registered clients in directory
            </p>
          </div>

          <Link 
            href="/admin/companies/new" 
            style={{ padding: "12px 24px", background: indigo, color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: '14px', boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.2)" }}
          >
            + New Company
          </Link>
        </div>

        {/* DATA TABLE */}
        <div style={{ background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Company Name & Ref</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Primary Contact</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companyList.map((c: CompanyRow) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "24px" }}>
                    <div style={{ fontWeight: 800, fontSize: "16px", color: navy, marginBottom: "8px" }}>
                      {c.name || "Unnamed Entity"}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#f1f5f9", fontSize: "11px", fontWeight: 700, color: "#64748b", border: "1px solid #e2e8f0" }}>
                        REF: {humanRef("CO", c.id)}
                      </span>
                      <CopyTextButton text={c.id} label="Copy ID" />
                    </div>
                  </td>
                  
                  <td style={{ padding: "24px" }}>
                    <div style={{ fontWeight: 700, color: "#334155", fontSize: "14px" }}>
                      {c.contact_name || "No Contact Assigned"}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                      {c.contact_email || "No Email Provided"}
                    </div>
                  </td>

                  <td style={{ padding: "24px", textAlign: 'right' }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: 'flex-end' }}>
                      <Link 
                        href={`/admin/companies/${c.id}`} 
                        style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", color: navy, fontWeight: 700, fontSize: "13px", textDecoration: 'none' }}
                      >
                        Manage
                      </Link>
                      <Link 
                        href={`/client/${c.id}`} 
                        style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, fontSize: "13px", textDecoration: 'none' }}
                        title="Internal preview"
                      >
                        Portal Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {companyList.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                    No companies in the directory yet. Start by adding your first client.
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