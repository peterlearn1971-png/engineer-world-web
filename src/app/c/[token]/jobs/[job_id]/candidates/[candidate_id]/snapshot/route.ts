import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function norm(v: any) {
  return String(v ?? "").trim();
}

// HELPER: Safely convert Array to comma-separated string for the text file
function normArray(v: any) {
  if (Array.isArray(v)) {
    return v.map((x: any) => norm(x)).filter(Boolean).join(", ");
  }
  return norm(v);
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string; job_id: string; candidate_id: string }> }
) {
  const { token, job_id, candidate_id } = await ctx.params;

  // token -> company
  const { data: tokenRow } = await supabaseAdmin
    .from("company_portal_tokens")
    .select("company_id, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow?.company_id || tokenRow.revoked_at) {
    return NextResponse.json({ error: "Invalid or revoked token" }, { status: 403 });
  }

  const company_id = tokenRow.company_id as string;

  // confirm job belongs to company
  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id, title")
    .eq("id", job_id)
    .eq("company_id", company_id)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // confirm candidate is visible in this job tank
  const { data: tankRow } = await supabaseAdmin
    .from("job_tank_items")
    .select("candidate_id, blocked")
    .eq("job_id", job_id)
    .eq("candidate_id", candidate_id)
    .maybeSingle();

  if (!tankRow || tankRow.blocked) {
    return NextResponse.json({ error: "Candidate not available for this job" }, { status: 404 });
  }

  // CHANGED: Re-mapped to exact columns from your SQL audit
  const { data: card } = await supabaseAdmin
    .from("candidate_cards")
    .select(
      [
        "candidate_id",
        "headline",
        "target_role",
        "current_company",
        "years_experience",
        "summary",
        "availability",
        "work_mode",
        "salary_expectation", 
        "location_blurb",
        "languages",
        "skills",
        "start_date",
        "license_certification",
        "relocate", 
      ].join(", ")
    )
    .eq("candidate_id", candidate_id)
    .maybeSingle();

  const lines: string[] = [];
  lines.push(`Job: ${norm(job.title) || norm(job.id)}`);
  
  // Display target_role if headline isn't set
  const roleTitle = norm((card as any)?.headline) || norm((card as any)?.target_role);
  lines.push(`Candidate: ${roleTitle || norm(candidate_id)}`);
  lines.push("");

  const comp = norm((card as any)?.salary_expectation);
  if (comp) lines.push(`Compensation: ${comp}`);

  const exp = norm((card as any)?.years_experience);
  if (exp) lines.push(`Experience: ${exp} years`);

  const availability = norm((card as any)?.availability);
  const startDate = norm((card as any)?.start_date);
  if (availability || startDate) {
    const parts = [
      availability ? `Availability: ${availability}` : "",
      startDate ? `Start: ${startDate}` : "",
    ].filter(Boolean);
    lines.push(`Timing: ${parts.join(" | ")}`);
  }

  const workMode = norm((card as any)?.work_mode);
  if (workMode) lines.push(`Work mode: ${workMode}`);

  const location = norm((card as any)?.location_blurb);
  if (location) lines.push(`Location: ${location}`);

  const license = norm((card as any)?.license_certification);
  if (license) lines.push(`License / cert: ${license}`);

  const relocate = norm((card as any)?.relocate);
  if (relocate) lines.push(`Willing to relocate: ${relocate}`);

  // ARRAY FIXES
  const skills = normArray((card as any)?.skills);
  if (skills) lines.push(`Skills: ${skills}`);

  const languages = normArray((card as any)?.languages);
  if (languages) lines.push(`Languages: ${languages}`);

  const summary = norm((card as any)?.summary);
  if (summary) {
    lines.push("");
    lines.push("Summary:");
    lines.push(summary);
  }

  const body = lines.join("\n") + "\n";

  const filename = `candidate_snapshot_${String(candidate_id).slice(0, 8)}.txt`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}