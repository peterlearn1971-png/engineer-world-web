// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getHashParams() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const out: Record<string, string> = {};
  if (!hash || !hash.startsWith("#")) return out;

  const qs = hash.slice(1);
  const pairs = qs.split("&").filter(Boolean);

  for (const p of pairs) {
    const [k, v] = p.split("=");
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
}

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href);
        const invite_token = url.searchParams.get("invite_token") || "";

        if (!invite_token) {
          setMsg("Missing invite token in callback URL.");
          return;
        }

        // 1) PKCE style: ?code=...
        const code = url.searchParams.get("code");
        if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) {
            setMsg(exchErr.message);
            return;
          }
        } else {
          // 2) Implicit style: #access_token=...&refresh_token=...
          const hp = getHashParams();
          const access_token = hp["access_token"] || "";
          const refresh_token = hp["refresh_token"] || "";

          if (!access_token || !refresh_token) {
            setMsg("Missing auth code and missing access tokens in callback URL.");
            return;
          }

          const { error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (setErr) {
            setMsg(setErr.message);
            return;
          }
        }

        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) {
          setMsg(userErr.message);
          return;
        }

        const user = userRes?.user;
        if (!user) {
          setMsg("Signed in, but no user returned.");
          return;
        }

        setMsg("Linking account…");

        const res = await fetch("/api/invites/consume", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ invite_token, auth_user_id: user.id }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMsg(json?.error || "Failed to link invite.");
          return;
        }

        const landing = json?.landing || "/app";
        window.location.replace(landing);
      } catch (e: any) {
        setMsg(e?.message || "Unknown error finishing sign-in.");
      }
    }

    run();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Signing in</h1>
      <p style={{ marginTop: 0 }}>{msg}</p>
    </div>
  );
}
