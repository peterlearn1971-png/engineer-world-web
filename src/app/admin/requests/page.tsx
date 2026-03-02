// src/app/admin/requests/page.tsx
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Status = "pending" | "contacted" | "completed" | "declined";

type IntroRequestRow = {
  id: string;
  company_id: string;
  job_id: string | null;
  candidate_id: string;
  status: Status | string | null;
  note: string | null;
  created_at: string;
};

type CompanyRow = { id: string; name: string | null };
type JobRow = { id: string; title: string | null };
type CandidateRow = {
  id: string;
  full_name: string | null;
  city: string | null;
  region: string | null;
};

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function normalizeStatus(s: string | null | undefined): Status {
  const raw = String(s || "pending").trim().toLowerCase();

  const v =
    raw === "closed"
      ? "completed"
      : raw === "done"
      ? "completed"
      : raw === "complete"
      ? "completed"
      : raw === "decline"
      ? "declined"
      : raw === "reject"
      ? "declined"
      : raw === "rejected"
      ? "declined"
      : raw === "contact"
      ? "contacted"
      : raw === "in_progress"
      ? "contacted"
      : raw === "in progress"
      ? "contacted"
      : raw === "pending" || raw === "contacted" || raw === "completed" || raw === "declined"
      ? raw
      : "pending";

  return v as Status;
}

function statusPill(s: string | null | undefined) {
  const v = normalizeStatus(s);

  const colors =
    v === "contacted"
      ? { bg: "#eff6ff", bd: "#bfdbfe" }
      : v === "completed"
      ? { bg: "#ecfdf5", bd: "#a7f3d0" }
      : v === "declined"
      ? { bg: "#fff1f2", bd: "#fecdd3" }
      : { bg: "#fafafa", bd: "#e6e6e6" };

  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid ${colors.bd}`,
    background: colors.bg,
    fontSize: 12,
    lineHeight: "16px",
    color: "#111",
    whiteSpace: "nowrap",
    textTransform: "lowercase",
  };

  return <span style={style}>{v}</span>;
}

export default async function AdminRequestsPage() {
  const card: React.CSSProperties = {
    border: "1px solid #e8e8e8",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const row: React.CSSProperties = {
    border: "1px solid #efefef",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "220px 1fr 180px",
    gap: 12,
    alignItems: "start",
    background: "white",
  };

  const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    textDecoration: "none",
    color: "#111",
    display: "inline-block",
    cursor: "pointer",
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: "black",
    color: "white",
    border: "1px solid black",
  };

  const label: React.CSSProperties = { fontSize: 12, color: "#666", marginBottom: 6 };
  const select: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  };
  const textarea: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    minHeight: 70,
  };

  const { data: reqRows, error: reqErr } = await supabaseAdmin
    .from("intro_requests")
    .select("id, company_id, job_id, candidate_id, status, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (reqErr) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, Arial", maxWidth: 1100 }}>
        <h1 style={{ margin: 0 }}>Intro requests</h1>
        <p style={{ color: "crimson" }}>Error: {reqErr.message}</p>
      </main>
    );
  }

  const requests = (reqRows || []) as IntroRequestRow[];

  const companyIds = Array.from(new Set(requests.map((r) => r.company_id).filter(Boolean)));
  const jobIds = Array.from(new Set(requests.map((r) => r.job_id).filter(Boolean))) as string[];
  const candidateIds = Array.from(new Set(requests.map((r) => r.candidate_id).filter(Boolean)));

  const companyNameById = new Map<string, string>();
  const jobTitleById = new Map<string, string>();
  const candidateById = new Map<string, { name: string; location: string }>();

  if (companyIds.length) {
    const { data: companyRows } = await supabaseAdmin
      .from("companies")
      .select("id, name")
      .in("id", companyIds);

    for (const c of (companyRows || []) as CompanyRow[]) {
      const name = (c.name || "").trim() || c.id.slice(0, 8);
      companyNameById.set(c.id, name);
    }
  }

  if (jobIds.length) {
    const { data: jobRows } = await supabaseAdmin.from("jobs").select("id, title").in("id", jobIds);
    for (const j of (jobRows || []) as JobRow[]) {
      const title = (j.title || "").trim() || "(untitled job)";
      jobTitleById.set(j.id, title);
    }
  }

  if (candidateIds.length) {
    const { data: candRows } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, city, region")
      .in("id", candidateIds);

    for (const c of (candRows || []) as CandidateRow[]) {
      const name = (c.full_name || "").trim() || `Candidate ${c.id.slice(0, 8)}`;
      const locParts = [c.city || "", c.region || ""].map((s) => (s || "").trim()).filter(Boolean);
      const location = locParts.length ? locParts.join(", ") : "—";
      candidateById.set(c.id, { name, location });
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial", maxWidth: 1100 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Intro requests</h1>
          <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
            Newest first. Status + note are editable.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/jobs" style={btn}>
            Admin jobs
          </Link>
          <Link href="/admin/companies" style={btn}>
            Admin companies
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 16, ...card }}>
        {requests.length === 0 ? (
          <div style={{ color: "#666" }}>
            No intro requests yet. When a client clicks “Request intro” from a job tank, it will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {requests.map((r) => {
              const companyName = companyNameById.get(r.company_id) || r.company_id.slice(0, 8);
              const jobTitle = r.job_id ? jobTitleById.get(r.job_id) || "(unknown job)" : "(no job)";
              const cand = candidateById.get(r.candidate_id);
              const candidateName = cand?.name || `Candidate ${r.candidate_id.slice(0, 8)}`;
              const candidateLoc = cand?.location || "—";
              const currentStatus = normalizeStatus(r.status);

              return (
                <div key={r.id} style={row}>
                  <div style={{ color: "#666", fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{fmt(r.created_at)}</div>
                    <div style={{ marginTop: 8 }}>{statusPill(currentStatus)}</div>
                    <div style={{ marginTop: 10, fontSize: 12 }}>
                      request_id: <code>{r.id}</code>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 750 }}>
                      {companyName} • {jobTitle}
                    </div>

                    <div style={{ color: "#333", marginTop: 6 }}>
                      Candidate: <span style={{ fontWeight: 650 }}>{candidateName}</span>{" "}
                      <span style={{ color: "#666" }}>({candidateLoc})</span>
                    </div>

                    <div
                      style={{
                        color: "#666",
                        fontSize: 12,
                        marginTop: 6,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        company_id: <code>{r.company_id}</code>
                      </span>
                      <span>
                        job_id: <code>{r.job_id || "—"}</code>
                      </span>
                      <span>
                        candidate_id: <code>{r.candidate_id}</code>
                      </span>
                    </div>
                  </div>

                  <div>
                    <form action="/api/admin/requests/update" method="post" style={{ display: "grid", gap: 10 }}>
                      <input type="hidden" name="id" value={r.id} />

                      <div>
                        <div style={label}>Status</div>
                        <select name="status" style={select} defaultValue={currentStatus}>
                          <option value="pending">pending</option>
                          <option value="contacted">contacted</option>
                          <option value="completed">completed</option>
                          <option value="declined">declined</option>
                        </select>
                      </div>

                      <div>
                        <div style={label}>Note (optional)</div>
                        <textarea
                          name="note"
                          style={textarea}
                          defaultValue={r.note || ""}
                          placeholder="Internal note..."
                        />
                      </div>

                      <button type="submit" style={btnPrimary}>
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
