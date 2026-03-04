"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [isMounted, setIsMounted] = useState(false);

  // This is the magic fix: It ensures the sidebar only loads 
  // AFTER the browser is fully ready.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  // If the browser isn't ready yet, show a clean loading state 
  // instead of a broken "Zombie" menu.
  if (!isMounted) {
    return <div style={{ padding: "40px", fontWeight: 700 }}>Loading Admin...</div>;
  }

  const wrapStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
    background: "#f8fafc",
  };

  const sidebarStyle: React.CSSProperties = {
    borderRight: "1px solid #e2e8f0",
    background: "white",
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  };

  const navLinkBase: React.CSSProperties = {
    display: "block",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    marginBottom: "4px",
    fontSize: "14px",
    fontWeight: 600,
  };

  const getLinkStyle = (path: string): React.CSSProperties => {
    const isActive = pathname === path || (path !== "/admin" && pathname.startsWith(path));
    return {
      ...navLinkBase,
      background: isActive ? "#f1f5f9" : "transparent",
      color: isActive ? "#6366f1" : "#64748b",
    };
  };

  return (
    <div style={wrapStyle}>
      <aside style={sidebarStyle}>
        <div style={{ fontWeight: 900, fontSize: "20px", marginBottom: "48px", color: "#0f172a" }}>
          INSURE<span style={{ color: "#6366f1" }}>WORLD</span>
        </div>
        <nav style={{ flex: 1 }}>
          <Link href="/admin/intro-requests" style={getLinkStyle("/admin/intro-requests")}>Intro Requests</Link>
          <Link href="/admin/companies" style={getLinkStyle("/admin/companies")}>Companies</Link>
          <Link href="/admin/candidates" style={getLinkStyle("/admin/candidates")}>Candidates</Link>
          <Link href="/admin/jobs" style={getLinkStyle("/admin/jobs")}>Jobs</Link>
        </nav>
      </aside>
      <main style={{ padding: "40px" }}>{children}</main>
    </div>
  );
}