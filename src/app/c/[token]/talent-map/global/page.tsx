// src/app/c/[token]/talent-map/global/page.tsx
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function norm(v: any) {
  return String(v ?? "").trim();
}
function includesLoose(haystack: string, needle: string) {
  const h = norm(haystack).toLowerCase();
  const n = norm(needle).toLowerCase();
  if (!n) return true;
  return h.includes(n);
}
function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (norm(v)) return v;
  }
  return null;
}
function pillStyle(kind: "neutral" | "good" | "warn") {
  if (kind === "good") return { border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1e3a8a" };
  if (kind === "warn") return { border: "1px solid #fed7aa", background: "#fff7ed", color: "#7c2d12" };
  return { border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" };
}
function normStatus(s: any) {
  const v = norm(s).toLowerCase();
  return v || "new";
}
function isApproved(status: string) {
  return status === "completed";
}
function clientLabelForIntroStatus(status: string) {
  if (status === "completed") return "Approved";
  if (status === "declined") return "Declined";
  if (status === "new" || status === "contacted") return "Intro requested";
  return "Intro requested";
}

type CandidateRow = {
  id: string;
  full_name: string | null;
  city: string | null;
  region: string | null;
  resume_url?: string | null;
};

export default async function GlobalTalentMapPage(props: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{
    q?: string;
    city?: string;
    region?: string;
    desig?: string; // designation keyword
  }>;
}) {
  const { token } = await props.params;
  const sp = (await props.searchParams) || {};

  const q = norm(sp.q);
  const city = norm(sp.city);
  const region = norm(sp.region);
  const desig = norm(sp.desig);

  const page: React.CSSProperties = { padding: 24, maxWidth: 1050, margin: "0 auto", fontFamily: "system-ui, Arial" };
  const hero: React.CSSProperties = { border: "1px solid #eee", borderRadius: 16, padding: 16, background: "white" };
  const card: React.CSSProperties = { marginTop: 14, border: "1px solid #eee", borderRadius: 16, padding: 14, background: "white" };

  const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontSize: 13,
    color: "#111",
  };
  const btnPrimary: React.CSSProperties = { ...btn, background: "black", color: "white", border: "1px solid black" };

  const pillBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    whiteSpace: "nowrap",
  };

  // 1) Resolve token -> company
  const { data: companyRow, error: companyErr } = await supabaseAdmin
    .from("company_portal_tokens")
    .select("token, company_id, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (companyErr || !companyRow?.company_id) {
    return (
      <main style={page}>
        <h1 style={{ margin: 0 }}>Global Talent Map</h1>
        <div style={{ marginTop: 10, color: "crimson" }}>Invalid portal link.</div>
      </main>
    );
  }
  if ((companyRow as any).revoked_at) {
    return (
      <main style={page}>
        <h1 style={{ margin: 0 }}>Global Talent Map</h1>
        <div style={{ marginTop: 10, color: "crimson" }}>This link has been revoked.</div>
      </main>
    );
  }

  const company_id = String(companyRow.company_id);

  // 2) Load global candidates (city/region live on candidates)
  // We intentionally keep this simple and fast.
  let candQuery = supabaseAdmin.from("candidates").select("id, full_name, city, region, resume_url").order("created_at", {
    ascending: false,
  });

  if (region) candQuery = candQuery.ilike("region", `%${region}%`);
  if (city) candQuery = candQuery.ilike("city", `%${city}%`);

  const { data: candidates, error: candErr } = await candQuery.limit(500);

  if (candErr) {
    return (
      <main style={page}>
        <h1 style={{ margin: 0 }}>Global Talent Map</h1>
        <div style={{ marginTop: 10, color: "crimson" }}>Error loading candidates: {candErr.message}</div>
        <div style={{ marginTop: 10 }}>
          <Link href={`/c/${token}`} style={btn}>
            Back to jobs
          </Link>
        </div>
      </main>
    );
  }

  const rowsAll = (candidates || []) as CandidateRow[];

  // Stable labels for anonymity until approved
  const labelByCandidateId = new Map<string, string>();
  {
    let idx = 1;
    for (const r of rowsAll) {
      const cid = String(r.id || "");
      if (!cid) continue;
      labelByCandidateId.set(cid, `Candidate G${idx}`);
      idx += 1;
    }
  }

  const candidateIds = rowsAll.map((r) => String(r.id)).filter(Boolean);

  // 3) Load candidate cards for extra searchable info (designation, headline, summary)
  const cardByCandidateId = new Map<string, any>();
  if (candidateIds.length) {
    const { data: cardRows } = await supabaseAdmin.from("candidate_cards").select("*").in("candidate_id", candidateIds).limit(2000);
    for (const cr of cardRows || []) {
      const cid = String((cr as any)?.candidate_id || "");
      if (cid) cardByCandidateId.set(cid, cr);
    }
  }

  // 4) Intro status for this company across all jobs
  const introByCandidate = new Map<string, any>();
  if (candidateIds.length) {
    const { data: introRows } = await supabaseAdmin
      .from("intro_requests")
      .select("id, status, candidate_id, job_id, created_at")
      .eq("company_id", company_id)
      .in("candidate_id", candidateIds)
      .limit(2000);

    for (const r of introRows || []) {
      const cid = String((r as any).candidate_id || "");
      if (!cid) continue;

      const prev = introByCandidate.get(cid);
      const st = normStatus((r as any).status);
      const prevSt = prev ? normStatus(prev.status) : "";
      const score = (x: string) => (x === "completed" ? 3 : x === "declined" ? 2 : x ? 1 : 0);

      if (!prev || score(st) > score(prevSt)) introByCandidate.set(cid, r);
    }
  }

  // 5) Apply search filtering in-memory (simple + reliable)
  const rows = rowsAll.filter((r) => {
    const cid = String(r.id);
    const cc = cardByCandidateId.get(cid) || null;

    if (desig) {
      const d = norm(pick(cc, ["license_certification", "license"]));
      if (!includesLoose(d, desig)) return false;
    }

    if (!q) return true;

    const anon = labelByCandidateId.get(cid) || "Candidate";
    const hay = [
      anon,
      norm(r.city),
      norm(r.region),
      norm(pick(cc, ["headline"])),
      norm(pick(cc, ["summary"])),
      norm(pick(cc, ["license_certification", "license"])),
      norm(pick(cc, ["languages"])),
      norm(pick(cc, ["work_mode", "work_mode_pref"])),
      norm(pick(cc, ["comp_range_text", "comp_range", "comp_band"])),
      norm(pick(cc, ["availability"])),
      norm(pick(cc, ["target_roles"])),
      norm(pick(cc, ["skills"])),
    ]
      .filter(Boolean)
      .join(" ");

    return includesLoose(hay, q);
  });

  return (
    <main style={page}>
      <div style={hero}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 360, flex: 1 }}>
            <div style={{ color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>Talent Map</div>
            <h1 style={{ margin: "6px 0 0 0" }}>Global candidate pool</h1>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ ...pillBase, ...pillStyle("neutral") }}>
                Results: <b style={{ color: "#111" }}>{rows.length}</b> <span style={{ color: "#777" }}>/ {rowsAll.length} loaded</span>
              </span>
              <span style={{ ...pillBase, ...pillStyle("neutral") }}>Search by city, region, designation, or keywords</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href={`/c/${token}`} style={btn}>
              Back to jobs
            </Link>
            <Link href={`/c/${token}/talent-map`} style={btn}>
              Shared candidates
            </Link>
          </div>
        </div>

        <form method="get" action={`/c/${token}/talent-map/global`} style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            name="region"
            defaultValue={region}
            placeholder="Region (ex: QC, ON)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d9d9d9", minWidth: 180, fontSize: 13 }}
          />
          <input
            name="city"
            defaultValue={city}
            placeholder="City (ex: Sudbury)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d9d9d9", minWidth: 180, fontSize: 13 }}
          />
          <input
            name="desig"
            defaultValue={desig}
            placeholder="Designation keyword (ex: P.Eng)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d9d9d9", minWidth: 220, fontSize: 13 }}
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Keywords (headline, summary, skills, languages...)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d9d9d9", minWidth: 260, fontSize: 13, flex: 1 }}
          />
          <button type="submit" style={btnPrimary}>
            Search
          </button>
          {(q || city || region || desig) ? (
            <Link href={`/c/${token}/talent-map/global`} style={btn}>
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      <div style={card}>
        {rows.length === 0 ? (
          <div style={{ color: "#666", fontSize: 13 }}>{rowsAll.length ? "No matches." : "No candidates exist yet."}</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((r) => {
              const cid = String(r.id);
              const cc = cardByCandidateId.get(cid) || null;

              const intro = introByCandidate.get(cid) || null;
              const status = intro ? normStatus(intro.status) : null;
              const hasAnyIntro = !!status;
              const approved = status ? isApproved(status) : false;

              const label = hasAnyIntro ? clientLabelForIntroStatus(status!) : "Available";

              const anon = labelByCandidateId.get(cid) || "Candidate";
              const realName = norm(r.full_name);
              const displayName = approved && realName ? realName : anon;

              const headline = pick(cc, ["headline"]);
              const summary = pick(cc, ["summary"]);
              const des = pick(cc, ["license_certification", "license"]);
              const location = [norm(r.city), norm(r.region)].filter(Boolean).join(", ");

              return (
                <div key={cid} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 320, flex: 1 }}>
                      <div style={{ fontWeight: 750 }}>{displayName}</div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{location || "—"}</div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                        {norm(des) ? (
                          <span style={{ ...pillBase, ...pillStyle("neutral") }}>
                            Designation: <b style={{ color: "#111" }}>{String(des)}</b>
                          </span>
                        ) : null}

                        <span
                          style={{
                            ...pillBase,
                            ...pillStyle(label === "Approved" ? "good" : label === "Intro requested" ? "warn" : "neutral"),
                          }}
                        >
                          {label}
                        </span>
                      </div>

                      {cc ? (
                        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                          {norm(headline) ? <div style={{ fontSize: 13, color: "#111", fontWeight: 650 }}>{String(headline)}</div> : null}
                          {norm(summary) ? <div style={{ fontSize: 13, color: "#444", lineHeight: 1.35 }}>{String(summary)}</div> : null}
                        </div>
                      ) : (
                        <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>Candidate details not posted yet.</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {!hasAnyIntro ? (
                        <form action="/api/request-intro" method="post">
                          <input type="hidden" name="candidate_id" value={cid} />
                          <input type="hidden" name="token" value={token} />
                          <input type="hidden" name="job_id" value="" />
                          <input
                            type="hidden"
                            name="return_to"
                            value={`/c/${token}/talent-map/global?${new URLSearchParams({
                              ...(region ? { region } : {}),
                              ...(city ? { city } : {}),
                              ...(desig ? { desig } : {}),
                              ...(q ? { q } : {}),
                            }).toString()}`}
                          />
                          <button type="submit" style={{ ...btnPrimary, whiteSpace: "nowrap" }}>
                            Request intro
                          </button>
                        </form>
                      ) : (
                        <span style={{ color: "#666", fontSize: 12 }}>Intro already requested</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
        Geographic sorting by distance needs lat/lng later. This version uses city and region.
      </div>
    </main>
  );
}
