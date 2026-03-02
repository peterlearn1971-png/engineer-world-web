// src/app/client/[company_id]/page.tsx

import { supabase } from "@/lib/supabaseClient";
import { shortUuidRef } from "@/lib/refs";

type TankRow = {
  job_id: string;
  candidate_id: string;
  tier: string | null;
  blocked: boolean;
  created_at?: string;
};

type Candidate = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  current_employer: string | null;
};

type CandidateCard = {
  candidate_id: string;
  headline: string | null;
  summary: string | null;
  skills: string[] | null;
  languages: string[] | null;
  target_roles: string[] | null;
  availability: string | null;
  work_mode: string | null;
  comp_band: string | null;
  location_blurb: string | null;
  comp_range: string | null;
  start_date: string | null;
  license_certification: string | null;
  willingness_to_relocate: string | null;
};

type IntroRequest = {
  candidate_id: string;
  status: string;
};

function norm(s: string | null | undefined) {
  return (s ?? "").trim();
}

function normLower(s: string | null | undefined) {
  return norm(s).toLowerCase();
}

function uniqSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildQuery(filters: { view?: string; location?: string; work_mode?: string; skill?: string }) {
  const p = new URLSearchParams();
  if (filters.view) p.set("view", filters.view);
  if (filters.location) p.set("location", filters.location);
  if (filters.work_mode) p.set("work_mode", filters.work_mode);
  if (filters.skill) p.set("skill", filters.skill);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

function buildReturnTo(companyId: string, filters: { view?: string; location?: string; work_mode?: string; skill?: string }) {
  const qs = buildQuery(filters);
  return `/client/${companyId}${qs}`;
}

function displayDate(s: string | null | undefined) {
  const v = norm(s);
  if (!v) return "";
  return v;
}

function line(label: string, value: any) {
  if (Array.isArray(value)) {
    const v = value.map((x) => norm(String(x))).filter(Boolean).join(", ");
    if (!v) return null;
    return (
      <div>
        <b>{label}:</b> {v}
      </div>
    );
  }

  const v = norm(String(value ?? ""));
  if (!v) return null;

  return (
    <div>
      <b>{label}:</b> {v}
    </div>
  );
}


export async function renderCompanyPortal(args: {
  company_id: string;
  searchParams: { view?: string; location?: string; work_mode?: string; skill?: string; debug?: string };
  accessLabel?: string | null;
}) {
  const { company_id, searchParams, accessLabel } = args;

  const sp = searchParams;
  const view = norm(sp.view).toLowerCase() === "saved" ? "saved" : "all";
  const selectedLocation = norm(sp.location);
  const selectedWorkMode = norm(sp.work_mode);
  const selectedSkill = norm(sp.skill);
  const debug = norm(sp.debug) === "1";

  const anyFilterActive = Boolean(selectedLocation || selectedWorkMode || selectedSkill);
  const baseUrl = `/client/${company_id}`;

  const { data: companyRow, error: companyErr } = await supabase
    .from("companies")
    .select("name")
    .eq("id", company_id)
    .limit(1);

  if (companyErr) throw new Error(companyErr.message);

  const companyName = companyRow?.[0]?.name ?? "Company";

  const { data: jobs, error: jobsErr } = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", company_id)
    .eq("status", "open")
    .limit(500);

  if (jobsErr) throw new Error(jobsErr.message);

  const jobIds = (jobs ?? []).map((j: any) => j.id);

  if (jobIds.length === 0) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
        <h1 style={{ marginBottom: 6 }}>{companyName} Candidate Portal</h1>
        <div style={{ color: "#666" }}>No open jobs found for this company.</div>
      </div>
    );
  }

  const { data: tank, error: tankErr } = await supabase
    .from("job_tank_items")
    .select("job_id, candidate_id, tier, blocked, created_at")
    .in("job_id", jobIds)
    .eq("blocked", false);

  if (tankErr) throw new Error(tankErr.message);

  const tankRows = (tank ?? []) as any as TankRow[];
  const candidateIds = Array.from(new Set(tankRows.map((t) => t.candidate_id)));

  if (candidateIds.length === 0) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
        <h1 style={{ marginBottom: 6 }}>{companyName} Candidate Portal</h1>
        <div style={{ color: "#666" }}>No candidates are visible for this company yet.</div>
      </div>
    );
  }

  const bestJobByCandidate = new Map<string, { job_id: string; created_at: string }>();
  for (const r of tankRows) {
    const created = (r.created_at || "").toString();
    const cur = bestJobByCandidate.get(r.candidate_id);
    if (!cur) {
      bestJobByCandidate.set(r.candidate_id, { job_id: r.job_id, created_at: created });
    } else {
      if (created && (!cur.created_at || created > cur.created_at)) {
        bestJobByCandidate.set(r.candidate_id, { job_id: r.job_id, created_at: created });
      }
    }
  }

  const { data: cards, error: cardError } = await supabase
    .from("candidate_cards")
    .select("*")
    .in("candidate_id", candidateIds);

  if (cardError) throw new Error(cardError.message);

  const { data: candidates, error: candError } = await supabase
    .from("candidates")
    .select("id, full_name, email, phone, city, region, current_employer")
    .in("id", candidateIds);

  if (candError) throw new Error(candError.message);

  const { data: requests, error: reqError } = await supabase
    .from("intro_requests")
    .select("candidate_id, status")
    .eq("company_id", company_id)
    .in("candidate_id", candidateIds);

  if (reqError) throw new Error(reqError.message);

  const cardMap = new Map((cards ?? []).map((c: any) => [c.candidate_id, c as CandidateCard]));
  const candidateMap = new Map((candidates ?? []).map((c: any) => [c.id, c as Candidate]));
  const requestMap = new Map((requests ?? []).map((r: any) => [r.candidate_id, r as IntroRequest]));

  const { data: shortlistRows, error: shortlistErr } = await supabase
    .from("shortlists")
    .select("id")
    .eq("company_id", company_id)
    .eq("title", "Default")
    .limit(1);

  if (shortlistErr) throw new Error(shortlistErr.message);

  const shortlistId = shortlistRows?.[0]?.id ?? null;

  let savedSet = new Set<string>();
  if (shortlistId) {
    const { data: items, error: itemsErr } = await supabase
      .from("shortlist_items")
      .select("candidate_id")
      .eq("shortlist_id", shortlistId);

    if (itemsErr) throw new Error(itemsErr.message);

    savedSet = new Set((items ?? []).map((i: any) => i.candidate_id));
  }

  const savedCount = savedSet.size;

  const allLocations = uniqSorted(
    (cards ?? []).map((c: any) => norm(c.location_blurb)).filter(Boolean) as string[]
  );

  const allWorkModes = uniqSorted(
    (cards ?? []).map((c: any) => norm(c.work_mode)).filter(Boolean) as string[]
  );

  const allSkills = uniqSorted(
    (cards ?? [])
      .flatMap((c: any) => (Array.isArray(c.skills) ? c.skills : []))
      .map((s: any) => norm(s))
      .filter(Boolean) as string[]
  );

  const tierRank = (t: string | null) => {
    const x = normLower(t);
    if (x === "c") return 3;
    if (x === "b") return 2;
    if (x === "a") return 1;
    return 0;
  };

  const bestTierByCandidate = new Map<string, { candidate_id: string; tier: string | null }>();
  for (const r of tankRows) {
    const cur = bestTierByCandidate.get(r.candidate_id);
    if (!cur) bestTierByCandidate.set(r.candidate_id, { candidate_id: r.candidate_id, tier: r.tier });
    else if (tierRank(r.tier) > tierRank(cur.tier)) bestTierByCandidate.set(r.candidate_id, { candidate_id: r.candidate_id, tier: r.tier });
  }

  const visibility = Array.from(bestTierByCandidate.values());

  let filtered = visibility.filter((v) => {
    const card = cardMap.get(v.candidate_id);
    if (!card) return false;

    if (selectedLocation && norm(card.location_blurb) !== selectedLocation) return false;
    if (selectedWorkMode && norm(card.work_mode) !== selectedWorkMode) return false;

    if (selectedSkill) {
      const skills = Array.isArray(card.skills) ? card.skills.map((s) => normLower(s)) : [];
      if (!skills.includes(normLower(selectedSkill))) return false;
    }

    return true;
  });

  if (view === "saved") filtered = filtered.filter((v) => savedSet.has(v.candidate_id));

  const totalVisible = visibility.length;

  const urlAll = buildReturnTo(company_id, {
    view: "all",
    location: selectedLocation || undefined,
    work_mode: selectedWorkMode || undefined,
    skill: selectedSkill || undefined,
  });

  const urlSaved = buildReturnTo(company_id, {
    view: "saved",
    location: selectedLocation || undefined,
    work_mode: selectedWorkMode || undefined,
    skill: selectedSkill || undefined,
  });

  const urlClearFilters = buildReturnTo(company_id, { view });

  const return_to = buildReturnTo(company_id, {
    view,
    location: selectedLocation || undefined,
    work_mode: selectedWorkMode || undefined,
    skill: selectedSkill || undefined,
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 6 }}>{companyName} Candidate Portal</h1>

      <div style={{ color: "#555", marginBottom: 10 }}>
        <div>
          Company: <b>{companyName}</b>
        </div>
        <div style={{ fontSize: 13, color: "#777" }}>
          Company Ref: <b>{shortUuidRef(company_id, "co")}</b>
          {accessLabel ? (
            <>
              {" "}
              | Access: <b>{accessLabel}</b>
            </>
          ) : null}
        </div>
      </div>

      {debug ? (
        <pre style={{ marginBottom: 12, fontSize: 12, background: "#f7f7f7", padding: 12, borderRadius: 10 }}>
{JSON.stringify(
  {
    company_id,
    jobs_found: jobIds.length,
    tank_rows_found: tankRows.length,
    unique_candidates_found: candidateIds.length,
    source: "job_tank_items(blocked=false) via jobs(status=open)",
  },
  null,
  2
)}
        </pre>
      ) : null}

      <div style={{ color: "#555", marginBottom: 14 }}>
        Shortlist: <b>Default</b> ({savedCount} saved)
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <a
          href={urlAll}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            textDecoration: "none",
            border: "1px solid #ddd",
            background: view === "all" ? "#111" : "#fff",
            color: view === "all" ? "#fff" : "#111",
          }}
        >
          All ({totalVisible})
        </a>

        <a
          href={urlSaved}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            textDecoration: "none",
            border: "1px solid #ddd",
            background: view === "saved" ? "#111" : "#fff",
            color: view === "saved" ? "#fff" : "#111",
          }}
        >
          Saved ({savedCount})
        </a>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <form action={baseUrl} method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <input type="hidden" name="view" value={view} />

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <span>Location</span>
            <select name="location" defaultValue={selectedLocation} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
              <option value="">All</option>
              {allLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <span>Work mode</span>
            <select name="work_mode" defaultValue={selectedWorkMode} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
              <option value="">All</option>
              {allWorkModes.map((wm) => (
                <option key={wm} value={wm}>
                  {wm}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <span>Skill</span>
            <select name="skill" defaultValue={selectedSkill} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", minWidth: 220 }}>
              <option value="">All</option>
              {allSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Apply
          </button>

          <a
            href={urlClearFilters}
            style={{
              marginLeft: 6,
              fontSize: 14,
              textDecoration: "none",
              color: anyFilterActive ? "#555" : "#aaa",
              pointerEvents: anyFilterActive ? "auto" : "none",
            }}
            aria-disabled={!anyFilterActive}
          >
            Clear filters
          </a>

          <div style={{ marginLeft: "auto", color: "#555", fontSize: 14 }}>
            Showing <b>{filtered.length}</b>
          </div>
        </form>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
          {view === "saved" ? "No saved candidates match those filters." : "No candidates match those filters."}
        </div>
      ) : (
        filtered.map((v) => {
          const card = cardMap.get(v.candidate_id);
          const person = candidateMap.get(v.candidate_id);
          const request = requestMap.get(v.candidate_id);

          const isTierC = normLower(v.tier) === "c";
          const isSaved = savedSet.has(v.candidate_id);

          const bestJob = bestJobByCandidate.get(v.candidate_id)?.job_id || "";

          return (
            <div
              key={v.candidate_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                marginBottom: 14,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 720 }}>
<h2 style={{ margin: 0 }}>{card?.headline ?? "Candidate"}</h2>

<div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
  <div style={{ fontWeight: 700, marginBottom: 6 }}>Client Snapshot</div>
  <div style={{ fontSize: 14, display: "grid", gap: 6 }}>
    {line("Compensation", card?.comp_range || card?.comp_band)}
    {line("Availability", card?.availability)}
    {line("Start date", displayDate(card?.start_date))}
    {line("Work mode", card?.work_mode)}
    {line("Location", card?.location_blurb)}
    {line("License / Certification", card?.license_certification)}
    {line("Willing to relocate", card?.willingness_to_relocate)}
    {line("Languages", card?.languages)}
  </div>
</div>

{norm(card?.summary) ? (
  <p style={{ marginTop: 10, color: "#555" }}>{card?.summary}</p>
) : null}

<p style={{ fontSize: 13, color: "#777" }}>Tier: {v.tier ?? "?"}</p>

                </div>

                {isTierC && person ? (
                  <div style={{ minWidth: 260 }}>
                    <div><b>{person.full_name}</b></div>
                    <div style={{ fontSize: 13 }}>
                      {person.city ? person.city : ""}
                      {person.city && person.region ? ", " : ""}
                      {person.region ? person.region : ""}
                    </div>
                    {person.email && <div style={{ fontSize: 13 }}>{person.email}</div>}
                    {person.phone && <div style={{ fontSize: 13 }}>{person.phone}</div>}
                    {person.current_employer && <div style={{ fontSize: 13, color: "#555" }}>Current: {person.current_employer}</div>}
                  </div>
                ) : (
                  <div style={{ minWidth: 260, color: "#777", fontSize: 13 }}>Identity hidden (Tier A / B)</div>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 14, display: "grid", gap: 6 }}>
  {line("Skills", card?.skills)}
  {line("Target roles", card?.target_roles)}

</div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {request ? (
                  <span style={{ color: "#777" }}>Intro already requested ({request.status})</span>
                ) : (
                  <form action="/api/request-intro" method="post">
                    <input type="hidden" name="company_id" value={company_id} />
                    <input type="hidden" name="candidate_id" value={v.candidate_id} />
                    <input type="hidden" name="job_id" value={bestJob} />
                    <input type="hidden" name="return_to" value={return_to} />
                    <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}>
                      Request intro
                    </button>
                  </form>
                )}

                <form action="/api/shortlists/toggle" method="post">
                  <input type="hidden" name="company_id" value={company_id} />
                  <input type="hidden" name="candidate_id" value={v.candidate_id} />
                  <input type="hidden" name="return_to" value={return_to} />
                  <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: isSaved ? "#fff" : "#f5f5f5", cursor: "pointer" }}>
                    {isSaved ? "Remove from shortlist" : "Save to shortlist"}
                  </button>
                </form>

                {isSaved ? <span style={{ color: "#555", fontSize: 14 }}>Saved</span> : null}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default async function ClientCompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ company_id: string }>;
  searchParams: Promise<{ view?: string; location?: string; work_mode?: string; skill?: string; debug?: string }>;
}) {
  const { company_id } = await params;
  const sp = await searchParams;

  return renderCompanyPortal({
    company_id,
    searchParams: sp,
    accessLabel: null,
  });
}
