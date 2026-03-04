// src/app/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CompanyUser = {
  id: string;
  company_id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  active: boolean | null;
};

type Job = {
  id: string;
  company_id: string;
  owner_user_id: string;
  title: string | null;
  created_at: string;
};

export default function AppHome() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      const { data: sessionRes } = await supabase.auth.getSession();
      const session = sessionRes?.session;

      if (!session?.user) {
        setLoading(false);
        setErr("Not signed in.");
        return;
      }

      setUserEmail(session.user.email || "");

      // Find company membership for this auth user
      const { data: cu, error: cuErr } = await supabase
        .from("company_users")
        .select("id, company_id, email, name, role, active")
        .eq("auth_user_id", session.user.id)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (cuErr) {
        setLoading(false);
        setErr(cuErr.message);
        return;
      }
      if (!cu) {
        setLoading(false);
        setErr("Signed in, but no company membership is linked yet.");
        return;
      }

      setCompanyUser(cu);

      // RLS should filter this automatically based on role + ownership
      const { data: js, error: jErr } = await supabase
        .from("jobs")
        .select("id, company_id, owner_user_id, title, created_at")
        .order("created_at", { ascending: false });

      if (jErr) {
        setLoading(false);
        setErr(jErr.message);
        return;
      }

      setJobs(js || []);
      setLoading(false);
    }

    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, marginBottom: 10 }}>InsureWorld</h1>

      {loading ? <div>Loading…</div> : null}

      {!loading && err ? (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Status</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{err}</div>
        </div>
      ) : null}

      {!loading && !err ? (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ opacity: 0.85 }}>Signed in as: {userEmail}</div>
            <div style={{ opacity: 0.85 }}>
              Role: <strong>{companyUser?.role}</strong> · Company ID:{" "}
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                {companyUser?.company_id}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={signOut} style={{ padding: "10px 14px", cursor: "pointer" }}>
              Sign out
            </button>
          </div>

          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Jobs you can see</h2>
          {jobs.length === 0 ? (
            <div style={{ opacity: 0.85 }}>No jobs visible. (If you are a rep, you’ll only see owned jobs.)</div>
          ) : (
            <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
              {jobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    padding: 12,
                    borderTop: "1px solid #eee",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{j.title || "(untitled job)"}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    job_id: {j.id} · owner_user_id: {j.owner_user_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
