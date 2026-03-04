// src/app/api/request-intro/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

function safeReturnTo(v: string) {
  // Prevent open redirects: only allow relative paths
  const x = String(v || "").trim();
  if (!x.startsWith("/")) return "/";
  return x;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = s(formData.get("token"));
    const candidate_id = s(formData.get("candidate_id"));
    const job_id = s(formData.get("job_id")) || null;
    const return_to = safeReturnTo(s(formData.get("return_to")) || "/");

    if (!token || !candidate_id) {
      const url = new URL(return_to, request.url);
      url.searchParams.set("requested", "0");
      url.searchParams.set("error", "missing_token_or_candidate");
      return NextResponse.redirect(url);
    }

    // 1) Resolve token -> company_id (trust moat)
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("company_portal_tokens")
      .select("token, company_id, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenErr || !tokenRow?.company_id) {
      const url = new URL(return_to, request.url);
      url.searchParams.set("requested", "0");
      url.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(url);
    }

    if ((tokenRow as any).revoked_at) {
      const url = new URL(return_to, request.url);
      url.searchParams.set("requested", "0");
      url.searchParams.set("error", "revoked_token");
      return NextResponse.redirect(url);
    }

    const company_id = String(tokenRow.company_id);

    // 2) If job_id provided, ensure it belongs to this company
    if (job_id) {
      const { data: jobRow, error: jobErr } = await supabaseAdmin
        .from("jobs")
        .select("id, company_id")
        .eq("id", job_id)
        .maybeSingle();

      if (jobErr || !jobRow || String(jobRow.company_id) !== company_id) {
        const url = new URL(return_to, request.url);
        url.searchParams.set("requested", "0");
        url.searchParams.set("error", "job_not_found_or_not_allowed");
        return NextResponse.redirect(url);
      }
    }

    // 3) Avoid duplicates (same company + candidate + job)
    let existingQuery = supabaseAdmin
      .from("intro_requests")
      .select("id")
      .eq("company_id", company_id)
      .eq("candidate_id", candidate_id);

    if (job_id) existingQuery = existingQuery.eq("job_id", job_id);
    if (!job_id) existingQuery = existingQuery.is("job_id", null);

    const { data: existing, error: existErr } = await existingQuery.maybeSingle();

    if (!existErr && existing?.id) {
      const url = new URL(return_to, request.url);
      url.searchParams.set("requested", "1");
      url.searchParams.set("cid", candidate_id);
      url.searchParams.set("intro", "already");
      return NextResponse.redirect(url);
    }

    // 4) Create intro request (status aligned with your UI)
    const { error: insErr } = await supabaseAdmin.from("intro_requests").insert({
      company_id,
      candidate_id,
      job_id,
      status: "new",
      created_at: new Date().toISOString(),
    });

    if (insErr) {
      const url = new URL(return_to, request.url);
      url.searchParams.set("requested", "0");
      url.searchParams.set("error", insErr.message || "insert_failed");
      return NextResponse.redirect(url);
    }

    const url = new URL(return_to, request.url);
    url.searchParams.set("requested", "1");
    url.searchParams.set("cid", candidate_id);
    url.searchParams.set("intro", "sent");
    return NextResponse.redirect(url);
  } catch (e: any) {
    const url = new URL("/", request.url);
    url.searchParams.set("requested", "0");
    url.searchParams.set("error", String(e?.message || e || "unknown_error"));
    return NextResponse.redirect(url);
  }
}
