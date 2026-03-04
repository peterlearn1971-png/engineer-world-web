"use client";

import * as React from "react";

export default function CopyTextButton({
  text,
  label = "Copy",
  title,
}: {
  text: string;
  label?: string;
  title?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // If clipboard blocked, do nothing
    }
  }

  // --- STYLES ---
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 6, // Matches your new table style
    border: copied ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
    background: copied ? "#f0fdf4" : "white", // Green flash on copy
    color: copied ? "#166534" : "#374151",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={title || "Copy to clipboard"}
      style={baseStyle}
    >
      {copied ? (
        <>
          {/* Checkmark Icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          {/* Copy Icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}