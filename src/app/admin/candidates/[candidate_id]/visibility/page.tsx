import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string; // job_tank_items.id
  created_at: string;
  job_id: string;
  candidate_id: string;
  tier: string | null;
  blocked: boolean | null;
  visible_to_client: boolean | null;
  notes: string | null;
  jobs?: {
    id: string;
    title: string | null;
    company_id: string;
    companies?: { id: string; name: string | null } | null;
  } | null;
};

function norm(v: any) {
  return String(v ?? "").trim();
}

function yn(v: any) {
  return v ? "true" : "false";
}

export default async function CandidateVisibilityPage({
  params,
}: {
  params: Promise<{ candidate_id: string }>;
}) {
  const { candidate_id } = await params;

  const page: React.CSSProperties = {
    padding: 24,
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily: "system-ui, Arial",
  };

  const btn: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontSize: 13,
    color: "#111",
  };

  const card: React.CSSProperties = {
    marginTop: 16,
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 14,
    background: "white",
  };

  // Candidate name (optional)
  const { data: cand } = await supabaseAdmin
    .from("candidates")
    .select("id, full_name")
    .eq("id", candidate_id)
    .maybeSingle();

  const candName = norm(cand?.full_name) || "Candidate";

  // All tank memberships for this candidate, with job + company
  const { data, error } = await supabaseAdmin
    .from("job_tank_items")
    .select(
      `
      id,
      created_at,
      job_id,
      candidate_id,
      tier,
      blocked,
      visible_to_client,
      notes,
      jobs (
        id,
        title,
        company_id,
        companies ( id, name )
      )
    `
    )
    .eq("candidate_id", candidate_id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main style={page}>
        <h1 style={{ margin: 0 }}>Candidate visibility</h1>
        <div style={{ marginTop: 10, color: "crimson" }}>Error: {error.message}</div>
        <div style={{ marginTop: 12 }}>
          <Link href={`/admin/candidates/${candidate_id}`} style={btn}>
            Back to candidate
          </Link>
        </div>
      </main>
    );
  }

  // --- THE FIX IS HERE ---
  // We cast to 'unknown' first to stop TypeScript from complaining about the structure mismatch
  const rows = (data || []) as unknown as Row[];

  return (
    <main style={page}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Visibility</h1>
          <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
            {candName} across company job tanks.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/candidates" style={btn}>
            Candidates
          </Link>
          <Link href={`/admin/candidates/${candidate_id}`} style={btn}>
            Back to candidate
          </Link>
        </div>
      </div>

      <div style={card}>
        {rows.length === 0 ? (
          <div style={{ color: "#666" }}>This candidate is not in any job tanks yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((r) => {
              const companyName = norm(r.jobs?.companies?.name) || "Company";
              const jobTitle = norm(r.jobs?.title) || "Job";
              const tier = norm(r.tier) || "C";
              const blocked = !!r.blocked;
              const visible = !!r.visible_to_client;

              return (
                <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 750 }}>{companyName}</div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{jobTitle}</div>

                      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13 }}>
                        <span style={{ color: "#666" }}>
                          Visible to client: <b>{yn(visible)}</b>
                        </span>
                        <span style={{ color: "#666" }}>
                          Blocked: <b>{yn(blocked)}</b>
                        </span>
                        <span style={{ color: "#666" }}>
                          Tier: <b>{tier}</b>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Link href={`/admin/jobs/${r.job_id}`} style={btn}>
                        Open job tank
                      </Link>
                    </div>
                  </div>

                  <form
                    action="/api/admin/job-tank-items/update"
                    method="post"
                    style={{ marginTop: 12, display: "grid", gap: 10 }}
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="return_to" value={`/admin/candidates/${candidate_id}/visibility`} />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <label style={{ fontSize: 13, color: "#333" }}>
                        Tier
                        <select name="tier" defaultValue={tier} style={{ marginLeft: 8, padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </label>

                      <label style={{ fontSize: 13, color: "#333" }}>
                        Blocked
                        <select
                          name="blocked"
                          defaultValue={yn(blocked)}
                          style={{ marginLeft: 8, padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
                        >
                          <option value="false">false</option>
                          <option value="true">true</option>
                        </select>
                      </label>

                      <label style={{ fontSize: 13, color: "#333" }}>
                        Visible to client
                        <select
                          name="visible_to_client"
                          defaultValue={yn(visible)}
                          style={{ marginLeft: 8, padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
                        >
                          <option value="false">false</option>
                          <option value="true">true</option>
                        </select>
                      </label>
                    </div>

                    <label style={{ fontSize: 13, color: "#333" }}>
                      Notes (internal)
                      <textarea
                        name="notes"
                        defaultValue={r.notes || ""}
                        rows={3}
                        style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                      />
                    </label>

                    <div>
                      <button
                        type="submit"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid #111",
                          background: "#111",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Save visibility
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}