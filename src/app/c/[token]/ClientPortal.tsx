"use client";

import { useState } from "react";

// --- TYPES ---
type Candidate = {
  id: string;
  full_name: string | null;
  city: string | null;
  region: string | null;
  headline: string | null;
  resume_url?: string | null;
  bio?: string | null;
};

type TankItem = {
  job_id: string;
  candidate_id: string;
  status?: string;
  client_note?: string | null; // Added field
};

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  comp_band: string | null;
  created_at: string;
};

type Props = {
  companyName: string;
  viewingAs: string | null;
  filterMode: boolean;
  jobs: Job[];
  tankItems: TankItem[];
  candidates: Record<string, Candidate>;
};

export default function ClientPortal({ 
  companyName, viewingAs, filterMode, jobs, tankItems, candidates 
}: Props) {

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedCandidate = selectedCandidateId ? candidates[selectedCandidateId] : null;

  // Surgical Save Function for Notes
  async function saveNote(jobId: string, candidateId: string, note: string) {
    try {
      await fetch("/api/client/update-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, candidateId, note }),
      });
    } catch (err) {
      console.error("Note save failed:", err);
    }
  }

  async function handleAction(action: "request_intro" | "reject") {
    alert(`Action '${action}' recorded for ${selectedCandidate?.full_name}!`);
    setSelectedCandidateId(null);
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh", paddingBottom: 50 }}>
      <header style={{ background: "white", borderBottom: "1px solid #ddd", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div>
             <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 0.5 }}>PORTAL</div>
             <div style={{ fontSize: 20, fontWeight: 700 }}>{companyName}</div>
           </div>
           {viewingAs && (
               <div style={{ fontSize: 13, background: "#f0f0f0", padding: "6px 12px", borderRadius: 20 }}>
                   👤 {viewingAs} {filterMode ? "(My Jobs Only)" : ""}
               </div>
           )}
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "30px auto", padding: "0 20px" }}>
        {jobs.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 60 }}>
                <h3>No active jobs found.</h3>
            </div>
        ) : (
            <div style={{ display: "grid", gap: 30 }}>
                {jobs.map(job => {
                    const jobCandidates = tankItems.filter(t => t.job_id === job.id);
                    
                    return (
                        <div key={job.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                            <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{job.title}</div>
                                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                                    {job.location} • {job.work_mode} • {job.comp_band}
                                </div>
                            </div>

                            <div>
                                {jobCandidates.map(item => {
                                    const c = candidates[item.candidate_id];
                                    if (!c) return null;
                                    
                                    return (
                                        <div 
                                            key={item.candidate_id} 
                                            style={{ 
                                                padding: "16px 20px", 
                                                borderBottom: "1px solid #f0f0f0", 
                                                display: "grid", 
                                                gridTemplateColumns: "1fr 220px 100px 180px", // Defined columns to fix the gap
                                                gap: 20,
                                                alignItems: "center"
                                            }}
                                        >
                                            {/* 1. Candidate Info */}
                                            <div onClick={() => { setSelectedJobId(job.id); setSelectedCandidateId(c.id); }} style={{ cursor: "pointer" }}>
                                                <div style={{ fontWeight: 600, fontSize: 16, color: "#4f46e5" }}>{c.full_name} →</div>
                                                <div style={{ fontSize: 12, color: "#888" }}>{c.headline}</div>
                                            </div>

                                            {/* 2. NEW: Notes Section (Fills the gap) */}
                                            <div>
                                              <textarea 
                                                defaultValue={item.client_note || ""}
                                                onBlur={(e) => saveNote(job.id, c.id, e.target.value)}
                                                placeholder="Add private note..."
                                                style={{ 
                                                  width: "100%", height: "50px", padding: "8px", fontSize: "12px", 
                                                  borderRadius: "6px", border: "1px solid #eee", resize: "none",
                                                  background: "#fffbeb", fontFamily: "inherit"
                                                }}
                                              />
                                            </div>

                                            {/* 3. Status */}
                                            <div style={{ textAlign: "center" }}>
                                              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", background: "#f0fdf4", color: "#166534", borderRadius: 6 }}>
                                                {item.status || "Unlocked"}
                                              </span>
                                            </div>

                                            {/* 4. Actions (Resume and Intro styled per your image) */}
                                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                                {c.resume_url && (
                                                  <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ 
                                                    textDecoration: "none", color: "#333", fontSize: "12px", fontWeight: 600, 
                                                    background: "white", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "8px",
                                                    display: "flex", alignItems: "center", gap: "5px"
                                                  }}>
                                                    📄 Resume
                                                  </a>
                                                )}
                                                <button 
                                                  onClick={() => setSelectedCandidateId(c.id)}
                                                  style={{ 
                                                    background: "#6366f1", color: "white", border: "none", 
                                                    padding: "8px 16px", borderRadius: "8px", fontWeight: 700, 
                                                    fontSize: "12px", cursor: "pointer" 
                                                  }}
                                                >
                                                  Request Intro
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </main>

      {/* Profile Drawer logic remains the same */}
      {selectedCandidate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
            <div onClick={() => setSelectedCandidateId(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
            <div style={{ position: "relative", width: "100%", maxWidth: 600, background: "white", height: "100%", overflowY: "auto", padding: 30 }}>
                <button onClick={() => setSelectedCandidateId(null)} style={{ position: "absolute", top: 20, right: 20, fontSize: 24, border: "none", background: "none", cursor: "pointer" }}>×</button>
                <h2>{selectedCandidate.full_name}</h2>
                <p>{selectedCandidate.headline}</p>
                <div style={{ marginTop: 20, padding: 20, background: "#f9f9f9", borderRadius: 10 }}>
                  <h4 style={{ marginTop: 0 }}>Bio</h4>
                  <p style={{ lineHeight: 1.6 }}>{selectedCandidate.bio || "No summary provided."}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}