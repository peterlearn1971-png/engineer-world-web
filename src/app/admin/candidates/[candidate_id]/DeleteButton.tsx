"use client";

import React, { useRef } from "react";

export default function DeleteButton({ candidateId }: { candidateId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Force the user to type DELETE
    const val = window.prompt('🚨 WARNING: This will wipe out their profile, job tank history, and notes. THIS CANNOT BE UNDONE.\n\nType "DELETE" to confirm:');
    
    if (val === "DELETE") {
      // Secretly add the confirmation word to the form and submit
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "confirm";
      input.value = "DELETE";
      formRef.current?.appendChild(input);
      formRef.current?.submit();
    } else if (val !== null) {
      alert("Deletion cancelled. You must type DELETE exactly.");
    }
  };

  return (
    <form ref={formRef} action="/api/admin/candidates/delete" method="post" onSubmit={handleDelete}>
      <input type="hidden" name="candidate_id" value={candidateId} />
      <button 
        type="submit" 
        style={{ padding: "10px 20px", borderRadius: 8, background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 600, border: "none", width: "100%", marginTop: "12px" }}
      >
        Permanently Delete Candidate
      </button>
    </form>
  );
}