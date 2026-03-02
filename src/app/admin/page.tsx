"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardHome() {
  const router = useRouter();
  const indigo = "#6366f1";
  const navy = "#0f172a";

  // Securely destroy the session and send them to the homepage
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const MailIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const BuildingIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/></svg>;
  const UsersIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const BriefcaseIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

  const navItems = [
    { title: "Intro Requests", desc: "Manage candidate introductions", icon: <MailIcon />, href: "/admin/intro-requests", accent: "#818cf8" },
    { title: "Companies", desc: "Manage client accounts & portals", icon: <BuildingIcon />, href: "/admin/companies", accent: "#60a5fa" },
    { title: "Candidates", desc: "Vetted talent database", icon: <UsersIcon />, href: "/admin/candidates", accent: "#a78bfa" },
    { title: "Jobs", desc: "Active job listings & owners", icon: <BriefcaseIcon />, href: "/admin/jobs", accent: "#fbbf24" },
  ];

  return (
    <div style={{ 
      background: `radial-gradient(at 0% 0%, #f1f5f9 0, transparent 50%), radial-gradient(at 50% 0%, #e0e7ff 0, transparent 50%), #f8fafc`,
      minHeight: "100vh", 
      fontFamily: "Inter, -apple-system, sans-serif", 
      color: navy,
      paddingBottom: "100px"
    }}>
      <header style={{ 
        background: "rgba(255, 255, 255, 0.8)", 
        backdropFilter: "blur(12px)",
        padding: "20px 40px", 
        borderBottom: "1px solid rgba(226, 232, 240, 0.5)", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        position: "sticky", 
        top: 0, 
        zIndex: 100 
      }}>
        <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em' }}>
          INSURE<span style={{ color: indigo }}>WORLD</span> <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Control</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>System Active</span>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.background = "#fef2f2";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "white";
            }}
          >
            Exit & Log Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "32px" }}>
          {navItems.map((item, idx) => (
            <Link key={idx} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ 
                padding: "40px 32px", 
                background: "white", 
                borderRadius: "32px", 
                border: "1px solid #e2e8f0", 
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                height: "100%",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.borderColor = indigo;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}>
                <div style={{ 
                  background: `${item.accent}15`, 
                  color: item.accent, 
                  padding: "20px", 
                  borderRadius: "20px", 
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: 0, color: navy, fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "15px", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}