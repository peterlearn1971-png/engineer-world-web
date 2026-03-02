// src/app/admin/danger/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminDangerPage() {
  const card: React.CSSProperties = {
    border: "1px solid #e8e8e8",
    borderRadius: 14,
    padding: 18,
    background: "white",
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    cursor: "pointer",
  };

  const btnDanger: React.CSSProperties = {
    ...btn,
    background: "#111",
    color: "white",
    border: "1px solid #111",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          ← Back to admin
        </Link>
      </div>

      <h1 style={{ margin: 0 }}>Danger zone</h1>
      <div style={{ color: "#666", marginTop: 8 }}>
        Tools for resetting demo data and deleting records. Use carefully.
      </div>

      {/* Reset demo */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ fontWeight: 750 }}>Reset demo data</div>
        <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
          Clears companies, candidates, jobs, tokens, tanks, intro requests, and activity. Use for “fresh system” testing.
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <form action="/api/admin/reset-demo" method="post" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Type RESET to confirm</div>
            <input name="confirm" placeholder="RESET" style={input} required />
            <button type="submit" style={btnDanger}>
              Reset demo data
            </button>
          </form>

          <div style={{ color: "#888", fontSize: 12 }}>
            This only works in dev when ADMIN_RESET_KEY is set.
          </div>
        </div>
      </div>

      {/* Delete candidate */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ fontWeight: 750 }}>Delete a candidate</div>
        <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
          Removes the candidate and any related cards/tank items/intro requests tied to them.
        </div>

        <form action="/api/admin/delete-candidate" method="post" style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Candidate ID</div>
          <input name="candidate_id" placeholder="uuid…" style={input} required />
          <button type="submit" style={btn}>
            Delete candidate
          </button>
        </form>
      </div>

      {/* Delete company */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ fontWeight: 750 }}>Delete a company</div>
        <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
          Removes the company and everything under it: jobs, tokens, saved lists, intro requests, activity.
        </div>

        <form action="/api/admin/delete-company" method="post" style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Company ID</div>
          <input name="company_id" placeholder="uuid…" style={input} required />
          <button type="submit" style={btn}>
            Delete company
          </button>
        </form>
      </div>
    </main>
  );
}