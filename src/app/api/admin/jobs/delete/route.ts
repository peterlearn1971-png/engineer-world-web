// src/app/api/admin/jobs/delete/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function safeReturnUrl(return_to: string, requestUrl: string) {
  try {
    const base = new URL(requestUrl);
    const raw = String(return_to || "").trim();

    // absolute -> force same origin
    try {
      const abs = new URL(raw);
      return new URL(abs.pathname + abs.search + abs.hash, base.origin);
    } catch {
      // ignore
    }

    if (raw.startsWith("/")) return new URL(raw, base.origin);
    return new URL("/admin/jobs", base.origin);
  } catch {
    return new URL("http://localhost:3000/admin/jobs");
  }
}

export async function POST(req: Request) {
  const form = await req.formData();

  const job_id = s(form.get("job_id"));
  const confirm = s(form.get("confirm"));
  const return_to = s(form.get("return_to")) || "/admin/jobs";

  const back = safeReturnUrl(return_to, req.url);

  if (!job_id) {
    back.searchParams.set("job_deleted", "0");
    back.searchParams.set("job_error", "missing_job_id");
    return NextResponse.redirect(back, 303);
  }

  if (confirm !== "DELETE") {
    back.searchParams.set("job_deleted", "0");
    back.searchParams.set("job_error", "confirm_required");
    return NextResponse.redirect(back, 303);
  }

  // 1) delete tank items first (avoids FK problems)
  const { error: tankErr } = await supabaseAdmin.from("job_tank_items").delete().eq("job_id", job_id);

  if (tankErr) {
    back.searchParams.set("job_deleted", "0");
    back.searchParams.set("job_error", "tank_delete_failed");
    return NextResponse.redirect(back, 303);
  }

  // 2) delete intro requests for this job, if your schema has them
  // If your table name differs, tell me the name and I’ll adjust.
  const { error: introErr } = await supabaseAdmin.from("intro_requests").delete().eq("job_id", job_id);

  // If intro_requests table doesn’t exist, ignore that error pattern
  if (introErr && !String(introErr.message || "").toLowerCase().includes("relation") && !String(introErr.message || "").toLowerCase().includes("does not exist")) {
    back.searchParams.set("job_deleted", "0");
    back.searchParams.set("job_error", "intro_delete_failed");
    return NextResponse.redirect(back, 303);
  }

  // 3) delete job
  const { error: jobErr } = await supabaseAdmin.from("jobs").delete().eq("id", job_id);

  if (jobErr) {
    back.searchParams.set("job_deleted", "0");
    back.searchParams.set("job_error", "job_delete_failed");
    return NextResponse.redirect(back, 303);
  }

  back.searchParams.set("job_deleted", "1");
  return NextResponse.redirect(back, 303);
}
