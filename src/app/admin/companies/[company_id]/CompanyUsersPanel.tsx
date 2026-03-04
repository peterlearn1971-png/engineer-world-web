"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CompanyUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  active: boolean | null;
  title: string | null;
  region_scope: string | null;
  auth_user_id: string | null;
  created_at: string | null;
};

const ROLE_OPTIONS = ["company_owner", "company_vp", "company_rep"] as const;

function asText(v: any) {
  return (v === null || v === undefined ? "" : String(v)).trim();
}

function normEmail(v: any) {
  return asText(v).toLowerCase();
}

export default function CompanyUsersPanel({
  companyId,
  initialUsers,
}: {
  companyId: string;
  initialUsers: CompanyUserRow[];
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]>("company_rep");
  const [title, setTitle] = useState("");
  const [regionScope, setRegionScope] = useState("");
  const [active, setActive] = useState(true);

  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);
  // Track which user is currently having a link generated
  const [generatingLinkFor, setGeneratingLinkFor] = useState<string | null>(null);

  const users = useMemo(() => initialUsers || [], [initialUsers]);

  const existingEmailSet = useMemo(() => {
    const s = new Set<string>();
    for (const u of users) {
      const e = normEmail(u.email);
      if (e) s.add(e);
    }
    return s;
  }, [users]);

  function canSubmit() {
    if (busy) return false;
    if (!companyId) return false;
    const e = normEmail(email);
    if (!e) return false;
    if (existingEmailSet.has(e)) return false;
    return true;
  }

  async function createUser() {
    setMsg("");

    const normalizedEmail = normEmail(email);
    if (!normalizedEmail) {
      setMsg("Email is required.");
      return;
    }

    if (existingEmailSet.has(normalizedEmail)) {
      setMsg("That email already exists for this company.");
      return;
    }

    setBusy(true);

    const payload = {
      company_id: companyId,
      email: normalizedEmail,
      name: asText(name) || null,
      role,
      title: asText(title) || null,
      region_scope: asText(regionScope) || null,
      active,
    };

    const res = await fetch("/api/admin/company-users/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      setMsg(json?.error || `Create failed (HTTP ${res.status})`);
      setBusy(false);
      return;
    }

    setEmail("");
    setName("");
    setTitle("");
    setRegionScope("");
    setActive(true);
    setRole("company_rep");

    setMsg("Created user successfully.");
    setBusy(false);

    router.refresh();
  }

  async function copyLoginLink(user: CompanyUserRow) {
    setMsg("");
    setGeneratingLinkFor(user.id);
    
    try {
        // NOTE: This assumes you have an endpoint that generates magic links.
        // If this 404s, we need to create this route.
        const res = await fetch("/api/admin/company-users/generate-link", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: user.email, user_id: user.id }),
        });

        if (!res.ok) {
            throw new Error(`Failed to generate link: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.link) {
            await navigator.clipboard.writeText(data.link);
            setMsg(`✅ Copied magic link for ${user.email} to clipboard!`);
        } else {
            setMsg("❌ API returned no link.");
        }
    } catch (e: any) {
        console.error(e);
        setMsg(`❌ Error: ${e.message}`);
    } finally {
        setGeneratingLinkFor(null);
    }
  }

  const normalizedEmailPreview = normEmail(email);
  const duplicateEmail = normalizedEmailPreview && existingEmailSet.has(normalizedEmailPreview);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 750 }}>Company users</div>
          <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
            Manage internal company users and their access.
          </div>
        </div>

        <div style={{ color: "#666", fontSize: 13 }}>
          Company ID: <code>{companyId}</code>
        </div>
      </div>

      {msg ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid #ddd", background: "#f7f7f7" }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, border: "1px solid #efefef", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #efefef", fontWeight: 650 }}>
          Existing users ({users.length})
        </div>

        {users.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>No users yet.</div>
        ) : (
          <div style={{ display: "grid" }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 120px 1fr 140px",
                  gap: 10,
                  padding: 12,
                  borderTop: "1px solid #f0f0f0",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 650 }}>{u.name || "(no name)"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{u.email}</div>
                </div>

                <div style={{ fontSize: 12 }}>
                  <div style={{ color: "#666" }}>Role</div>
                  <div style={{ fontWeight: 650 }}>{u.role || "—"}</div>
                </div>

                <div style={{ fontSize: 12, color: "#333" }}>
                  <div style={{ color: "#666" }}>Title / Region</div>
                  <div>
                    {u.title || "—"} <span style={{ color: "#999" }}>|</span> {u.region_scope || "—"}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                   <button 
                     onClick={() => copyLoginLink(u)}
                     disabled={!!generatingLinkFor}
                     style={{
                        fontSize: 12, 
                        padding: "6px 10px", 
                        background: "black", 
                        color: "white", 
                        border: "none", 
                        borderRadius: 6, 
                        cursor: "pointer",
                        opacity: generatingLinkFor ? 0.5 : 1
                     }}
                   >
                     {generatingLinkFor === u.id ? "Generating..." : "Copy Login Link"}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, borderTop: "1px solid #efefef", paddingTop: 14 }}>
        <div style={{ fontWeight: 650, marginBottom: 10 }}>Add user</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Email (required)</div>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMsg("");
              }}
              placeholder="jeff@company.com"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: duplicateEmail ? "1px solid #c00" : "1px solid #ddd",
              }}
            />
            {duplicateEmail ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "#c00" }}>Email already exists.</div>
            ) : null}
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jeff"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", background: "white" }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Active</div>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>User active</span>
            </label>
          </div>
          
           <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Title</div>
             <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Director"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
           </div>
           
           <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Region</div>
             <input
              value={regionScope}
              onChange={(e) => setRegionScope(e.target.value)}
              placeholder="Region"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
           </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={createUser}
            disabled={!canSubmit()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #000",
              background: !canSubmit() ? "#eee" : "black",
              color: !canSubmit() ? "#666" : "white",
              cursor: !canSubmit() ? "default" : "pointer",
            }}
          >
            {busy ? "Creating…" : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}