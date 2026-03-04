import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Company = { id: string; name: string };

type JobRow = {
  id: string;
  created_at: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  comp_band: string | null;
  status: string;
};

function shortRef(id: string) {
  const v = String(id || "").trim();
  if (!v) return "—";
  return `${v.slice(0, 7)}…`;
}

export default async function AdminCompanyJobsPage({
  params,
}: {
  params: Promise<{ company_id: string }>;
}) {
  const { company_id } = await params;

  const page: React.CSSProperties = {
    padding: 24,
    fontFamily: "system-ui, Arial",
    maxWidth: 1050,
    margin: "0 auto",
  };

  const box: React.CSSProperties = {
    marginTop: 16,
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const label: React.CSSProperties = { fontSize: 12, color: "#666", marginBottom: 6 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    color: "#111",
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    border: "1px solid black",
    background: "black",
    color: "white",
  };

  const chip: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #eee",
    background: "#fafafa",
    fontSize: 12,
    color: "#555",
  };

  const idInput: React.CSSProperties = {
    width: 360,
    maxWidth: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "#fafafa",
    fontSize: 12,
  };

  // Company name
  const { data: companyRows, error: companyErr } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", company_id)
    .limit(1);

  if (companyErr) {
    return (
      <main style={page}>
        <Link href="/admin/companies">← Back to companies</Link>
        <h1 style={{ marginTop: 14 }}>Jobs</h1>
        <div style={{ color: "crimson" }}>Error: {companyErr.message}</div>
      </main>
    );
  }

  const company = (companyRows?.[0] as Company | undefined) ?? null;

  if (!company) {
    return (
      <main style={page}>
        <Link href="/admin/companies">← Back to companies</Link>
        <h1 style={{ marginTop: 14 }}>Company not found</h1>
        <div style={{ color: "#666" }}>
          No company row exists with id: <code>{company_id}</code>
        </div>
      </main>
    );
  }

  // Jobs list
  const { data: jobs, error: jobsErr } = await supabase
    .from("jobs")
    .select("id, created_at, title, location, work_mode, comp_band, status")
    .eq("company_id", company_id)
    .order("created_at", { ascending: false });

  if (jobsErr) {
    return (
      <main style={page}>
        <Link href={`/admin/companies/${company_id}`}>← Back to company hub</Link>
        <h1 style={{ marginTop: 14 }}>Jobs</h1>
        <div style={{ color: "crimson" }}>Error: {jobsErr.message}</div>
      </main>
    );
  }

  const jobIds = (jobs || []).map((j: any) => j.id).filter(Boolean);

  // Tank counts per job (how many candidates in job_candidates)
  const counts = new Map<string, number>();
  if (jobIds.length > 0) {
    const { data: jcRows, error: jcErr } = await supabase
      .from("job_candidates")
      .select("job_id")
      .in("job_id", jobIds);

    if (jcErr) {
      return (
        <main style={page}>
          <Link href={`/admin/companies/${company_id}`}>← Back to company hub</Link>
          <h1 style={{ marginTop: 14 }}>Jobs</h1>
          <div style={{ color: "crimson" }}>Error: {jcErr.message}</div>
        </main>
      );
    }

    for (const r of jcRows || []) {
      const jid = (r as any).job_id as string;
      counts.set(jid, (counts.get(jid) ?? 0) + 1);
    }
  }

  return (
    <main style={page}>
      <div style={{ marginBottom: 12 }}>
        <Link href={`/admin/companies/${company_id}`} style={{ textDecoration: "none" }}>
          ← Back to company hub
        </Link>
      </div>

      <h1 style={{ margin: 0, fontSize: 22 }}>{company.name}</h1>
      <div style={{ color: "#666", marginTop: 6 }}>
        Jobs list (admin). Open a job to manage its tank.
      </div>

      {/* Create Job */}
      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Create job</div>

        <form action="/api/admin/jobs/create" method="post">
          <input type="hidden" name="company_id" value={company_id} />

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={label}>Title</div>
              <input name="title" style={input} placeholder="Claims Adjuster" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={label}>Location</div>
                <input name="location" style={input} placeholder="Montreal / Laval" />
              </div>
              <div>
                <div style={label}>Work mode</div>
                <input name="work_mode" style={input} placeholder="Hybrid / Remote / Onsite" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={label}>Comp band</div>
                <input name="comp_band" style={input} placeholder="$70–85k" />
              </div>
              <div>
                <div style={label}>Status</div>
                <input name="status" style={input} defaultValue="active" />
              </div>
            </div>

            <button type="submit" style={btnPrimary}>
              Create job
            </button>
          </div>
        </form>
      </div>

      {/* Jobs list */}
      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Jobs</div>

        {(jobs || []).length === 0 ? (
          <div style={{ color: "#666" }}>No jobs yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {(jobs as JobRow[]).map((j) => {
              const count = counts.get(j.id) ?? 0;

              return (
                <div
                  key={j.id}
                  style={{
                    border: "1px solid #efefef",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                    background: "white",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 850 }}>{j.title}</div>

                    <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
                      {(j.location || "—") + "  •  " + (j.work_mode || "—") + "  •  " + (j.comp_band || "—")}
                    </div>

                    <div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
                      Status: {j.status} | Tank: {count}
                    </div>

                    {/* Short ID + expandable full ID */}
                    <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={chip} title={j.id}>
                        job_id: {shortRef(j.id)}
                      </span>

                      <details>
                        <summary style={{ cursor: "pointer", color: "#666", fontSize: 12 }}>
                          Show ID
                        </summary>
                        <div style={{ marginTop: 8 }}>
                          <input readOnly value={j.id} style={idInput} />
                          <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                            Click the box, then copy.
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <Link href={`/admin/jobs/${j.id}`} style={btn}>
                      Open tank
                    </Link>
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
