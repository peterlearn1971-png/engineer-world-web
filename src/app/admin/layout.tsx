"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are on the login page, don't show the sidebar or branding
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const wrap: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
    background: "#f8fafc", 
  };

  const sidebar: React.CSSProperties = {
    borderRight: "1px solid #e2e8f0",
    background: "white",
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  };

  const brand: React.CSSProperties = {
    fontWeight: 900,
    fontSize: "20px",
    marginBottom: "48px",
    paddingLeft: "12px",
    letterSpacing: "-0.03em",
    color: "#0f172a",
  };

  const navLinkBase: React.CSSProperties = {
    display: "block",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    marginBottom: "4px",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
  };

  const getLinkStyle = (path: string): React.CSSProperties => {
    const isActive = pathname === path;
    return {
      ...navLinkBase,
      background: isActive ? "#f1f5f9" : "transparent",
      color: isActive ? "#6366f1" : "#64748b",
      border: isActive ? "1px solid #e2e8f0" : "1px solid transparent",
    };
  };

  return (
    <div style={wrap}>
      <aside style={sidebar}>
        <div style={brand}>
          INSURE<span style={{ color: "#6366f1" }}>WORLD</span>
        </div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", paddingLeft: "12px" }}>
          Internal Management
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link href="/admin/intro-requests" style={getLinkStyle("/admin/intro-requests")}>
            Intro Requests
          </Link>

          <Link href="/admin/companies" style={getLinkStyle("/admin/companies")}>
            Companies
          </Link>

          <Link href="/admin/candidates" style={getLinkStyle("/admin/candidates")}>
            Candidates
          </Link>

          <Link href="/admin/jobs" style={getLinkStyle("/admin/jobs")}>
            Jobs
          </Link>
        </nav>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <Link href="/" style={{ ...navLinkBase, color: "#94a3b8", fontSize: "12px" }}>
            Exit to Website
          </Link>
        </div>
      </aside>

      <main style={{ padding: "40px", maxWidth: "1200px" }}>
        {children}
      </main>
    </div>
  );
}