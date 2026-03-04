"use client";

import React, { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for visibility

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const secret = "PeterRyan1974!!"; 

    if (password === secret) {
      // 1. Write the cookie
      document.cookie = `admin_key=${secret}; path=/; max-size=86400; SameSite=Lax`;
      
      // 2. FORCE the phone to jump to the dashboard
      window.location.href = "/admin";
    } else {
      alert("Invalid Password");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
      <form onSubmit={handleLogin} style={{ background: "white", padding: "40px", borderRadius: "20px", border: "1px solid #e2e8f0", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <h1 style={{ fontWeight: 900, color: "#0f172a" }}>INSURE<span style={{ color: "#6366f1" }}>WORLD</span></h1>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "14px" }}>Admin Entry</p>
        
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input 
            type={showPassword ? "text" : "password"} // Switches type based on eye icon
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "14px 45px 14px 14px", 
              borderRadius: "10px", 
              border: "1px solid #e2e8f0",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
          
          {/* THE EYE ICON BUTTON */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {showPassword ? (
              // Eye-off icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              // Eye icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        </div>

        <button type="submit" style={{ width: "100%", background: "#6366f1", color: "white", padding: "14px", borderRadius: "10px", fontWeight: 800, cursor: "pointer", border: "none", fontSize: "16px" }}>
          Log In
        </button>
      </form>
    </div>
  );
}