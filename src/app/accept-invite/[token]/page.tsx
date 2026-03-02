// src/app/accept-invite/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AcceptInvitePage() {
  const params = useParams<{ token?: string }>();
  const token = typeof params?.token === "string" ? params.token : "";

  const [loading, setLoading] = useState(true);
  const [json, setJson] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const [actionLink, setActionLink] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  async function loadStatus(t: string) {
    setLoading(true);
    setError("");
    setJson(null);

    if (!t) {
      setError("Missing token in URL");
      setJson({ error: "Missing token in URL" });
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/invites/status?token=${encodeURIComponent(t)}`, {
      cache: "no-store",
    });

    const j = await res.json().catch(() => ({}));
    setJson(j);

    if (!res.ok) setError(j?.error || "Status request failed");
    setLoading(false);
  }

  async function generateLoginLink() {
    if (!token) {
      alert("Missing token in URL");
      return;
    }

    setGenerating(true);
    setActionLink("");
    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Failed to generate login link");
        return;
      }

      setActionLink(j?.action_link || "");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadStatus(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", maxWidth: 900 }}>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Accept Invite</h1>

      <div style={{ marginBottom: 12, opacity: 0.85 }}>
        Token:{" "}
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
          {token || "(missing)"}
        </span>
      </div>

      {loading ? <div>Loading status…</div> : null}

      {!loading && error ? (
        <div style={{ padding: 12, border: "1px solid #f0caca", borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
          <div>{error}</div>
        </div>
      ) : null}

      {!loading ? (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Status JSON</div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(json, null, 2)}</pre>
        </div>
      ) : null}

      <button
        onClick={generateLoginLink}
        disabled={generating}
        style={{ padding: "10px 14px", cursor: generating ? "not-allowed" : "pointer" }}
      >
        {generating ? "Generating…" : "Generate login link"}
      </button>

      {actionLink ? (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Login link</div>
          <a href={actionLink} style={{ wordBreak: "break-all" }}>
            {actionLink}
          </a>
        </div>
      ) : null}
    </div>
  );
}
