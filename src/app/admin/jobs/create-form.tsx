"use client"; // This marks it as a Client Component

import React, { useState } from "react";
import { humanRef } from "@/lib/refs";

type CreateJobFormProps = {
  companies: any[];
  companyUsers: any[];
  indigo: string;
};

export default function CreateJobForm({ companies, companyUsers, indigo }: CreateJobFormProps) {
  const [selectedCompany, setSelectedCompany] = useState("");

  // Filter users based on selection
  const filteredUsers = companyUsers.filter(
    (u) => !selectedCompany || u.company_id === selectedCompany
  );

  return (
    <div style={{ background: "white", borderRadius: "24px", padding: "32px", border: "1px solid #e2e8f0", marginBottom: "40px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Create New Job</h2>
      <form action="/api/admin/jobs/create" method="post" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        
        {/* COMPANY SELECTOR */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>COMPANY</label>
          <select 
            id="job_company_id" 
            name="company_id" 
            required 
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">Select Company...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} [{humanRef("CO", c.id)}]
              </option>
            ))}
          </select>
        </div>

        {/* JOB OWNER (Filtered by React state) */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>JOB OWNER (REP)</label>
          <select 
            id="job_owner_user_id" 
            name="owner_user_id" 
            required 
            disabled={!selectedCompany} // Disable if no company picked
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
          >
            <option value="">
               {selectedCompany ? "Select Owner..." : "Select Company First..."}
            </option>
            {filteredUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} | {humanRef("CO", u.company_id)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>JOB TITLE</label>
          <input name="title" required placeholder="Senior Underwriter" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }} />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>LOCATION</label>
          <input name="location" placeholder="Toronto, ON" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }} />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "8px" }}>WORK MODE</label>
          <input name="work_mode" placeholder="Hybrid" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit" style={{ width: "100%", background: indigo, color: "white", padding: "14px", borderRadius: "10px", border: "none", fontWeight: 700, cursor: "pointer" }}>
            Create Job Listing
          </button>
        </div>
      </form>
    </div>
  );
}