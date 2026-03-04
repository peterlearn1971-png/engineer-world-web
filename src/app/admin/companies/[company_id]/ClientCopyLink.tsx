"use client";

import * as React from "react";

export default function ClientCopyLink({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function onCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: select the input and copy
        inputRef.current?.focus();
        inputRef.current?.select();
        document.execCommand("copy");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Last fallback: select the input so user can Ctrl+C
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }

  const btn: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    cursor: "pointer",
  };

  const input: React.CSSProperties = {
    width: 420,
    maxWidth: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "#fafafa",
    fontSize: 12,
  };

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <input ref={inputRef} value={url} readOnly style={input} aria-label="Client portal link" />
      <button type="button" onClick={onCopy} style={btn}>
        {copied ? "Copied" : "Copy client link"}
      </button>
    </div>
  );
}