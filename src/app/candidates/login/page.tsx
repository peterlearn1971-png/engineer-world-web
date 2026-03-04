"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function cleanAuthError(msg: string) {
  const m = (msg || "").toLowerCase();

  if (m.includes("anonymous sign-ins are disabled")) {
    return "Auth is rejecting this login method. In Supabase: Authentication → Providers → Email, enable Email + Password.";
  }

  if (m.includes("signups not allowed") || m.includes("signup is disabled")) {
    return "Account creation is disabled in Supabase Auth settings.";
  }

  if (m.includes("email logins are disabled")) {
    return "Email login is disabled in Supabase Auth settings.";
  }

  return msg;
}

export default function CandidateLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      if (!alive) return;
      if (u) router.replace("/candidates");
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (u) router.replace("/candidates");
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMessage(cleanAuthError(error.message));
      setBusy(false);
      return;
    }

    setBusy(false);
    router.replace("/candidates");
  }

  async function createAccount() {
    setMessage("");
    setBusy(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMessage(cleanAuthError(error.message));
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;

    setBusy(false);

    if (u) {
      router.replace("/candidates");
      return;
    }

    setMessage("Account created. Check your email to confirm, then log in.");
  }

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Candidate login</h1>

      {message ? <div className="border p-2 rounded text-sm">{message}</div> : null}

      <form className="space-y-3" onSubmit={login}>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            className="border w-full p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            type="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            className="border w-full p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            type="password"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="bg-black text-white px-4 py-2 rounded">
            {busy ? "Working..." : "Log in"}
          </button>

          <button type="button" onClick={createAccount} disabled={busy} className="border px-4 py-2 rounded">
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
