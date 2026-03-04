"use client";

import React, { useState, useEffect } from "react";

interface CandidateNotesProps {
  jobId: string;
  candidateId: string;
  initialNote: string;
}

export default function CandidateNotes({ 
  jobId, 
  candidateId, 
  initialNote 
}: CandidateNotesProps) {
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Keep the box in sync if the initial data changes
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  async function handleBlur() {
    // If the text hasn't changed, don't trigger a save
    if (note === initialNote) return;

    setStatus("saving");

    try {
      // FIXED: Points to /api/save-tank-note based on your file structure
      const response = await fetch("/api/save-tank-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          candidateId,
          note,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setStatus("success");
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
      
    } catch (error) {
      console.error("Save error:", error);
      setStatus("error");
    }
  }

  return (
    <div style={{ marginBottom: "40px" }}>
      <label style={{ 
        fontSize: '11px', 
        fontWeight: 900, 
        color: '#6366f1', 
        textTransform: 'uppercase', 
        marginBottom: '12px', 
        display: 'block',
        letterSpacing: '0.05em'
      }}>
        Private Feedback & Candidate Notes
      </label>
      
      <textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add private notes about this candidate here..."
        style={{
          width: "100%",
          height: "140px",
          padding: "20px",
          borderRadius: "15px",
          border: status === "error" ? "2px solid #ef4444" : "2px solid #e2e8f0",
          background: "#fffbeb",
          fontSize: "16px",
          fontFamily: "inherit",
          resize: "none",
          outline: "none",
          color: "#451a03",
          lineHeight: "1.6",
          transition: "border-color 0.2s ease"
        }}
      />
      
      <div style={{ textAlign: "right", marginTop: "8px", fontSize: "12px", fontWeight: 700 }}>
        {status === "saving" && <span style={{ color: "#64748b" }}>⏳ Saving feedback...</span>}
        {status === "success" && <span style={{ color: "#22c55e" }}>✅ Saved to Record</span>}
        {status === "error" && <span style={{ color: "#ef4444" }}>❌ Error: Connection failed</span>}
        {status === "idle" && <span style={{ color: "#94a3b8", fontWeight: 400 }}>Saves automatically when you click out</span>}
      </div>
    </div>
  );
}     