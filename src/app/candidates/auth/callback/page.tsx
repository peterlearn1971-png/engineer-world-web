"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CandidateAuthCallbackPage() {
  const [msg, setMsg] = useState("Signing in...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = new URL(window.location.href);

        // 1) PKCE flow: Supabase redirects with ?code=...
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (!cancelled) setMsg(`Auth error: ${error.message}`);
            return;
          }
          window.location.href = "/candidates";
          return;
        }

        // 2) Implicit flow: Supabase returns tokens in the URL hash (#...)
        // Example: #access_token=...&refresh_token=...&type=signup
        const hash = window.location.hash?.startsWith("#")
          ? window.location.hash.slice(1)
          : "";

        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              if (!cancelled) setMsg(`Auth error: ${error.message}`);
              return;
            }

            // clean up the hash so refresh doesn't re-run weirdly
            window.history.replaceState({}, document.title, url.pathname + url.search);

            window.location.href = "/candidates";
            return;
          }
        }

        // 3) Nothing usable found
        if (!cancelled) {
          setMsg(
            "Missing auth code/tokens in callback URL.\n\n" +
              "If you clicked an older email link, generate a new one.\n" +
              "Also verify Redirect URL is set to:\n" +
              "http://localhost:3000/candidates/auth/callback"
          );
        }
      } catch (e: any) {
        if (!cancelled) setMsg(`Callback error: ${e?.message || String(e)}`);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Candidates</h1>
      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          background: "#f7f7f7",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg}
      </div>
    </main>
  );
}
