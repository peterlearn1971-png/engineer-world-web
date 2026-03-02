// src/app/api/admin/job-tank/add/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function asBool(v: FormDataEntryValue | null) {
  const x = String(v ?? "").trim().toLowerCase();
  return x === "1" || x === "true" || x === "on" || x === "yes";
}

function safeReturnUrl(return_to: string, requestUrl: string) {
  try {
    const base = new URL(requestUrl);
    const raw = String(return_to || "").trim();

    // absolute -> force to same origin
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

export async function POST(request: Request) {
  const form = await request.formData();

  const job_id = s(form.get("job_id"));
  const candidate_id = s(form.get("candidate_id"));
  const tier = s(form.get("tier")) || null;
  const notes = s(form.get("notes")) || null;
  const visible_to_client = asBool(form.get("visible_to_client"));
  const blocked = asBool(form.get("blocked"));
  const return_to = s(form.get("return_to")) || `/admin/jobs/${job_id}`;

  // Always redirect back (no dead POST screen)
  const back = safeReturnUrl(return_to, request.url);

  if (!job_id || !candidate_id) {
    back.searchParams.set("tank_saved", "0");
    back.searchParams.set("tank_error", "missing_fields");
    return NextResponse.redirect(back, 303);
  }

  // Dedupe: if already in tank, treat as success
  const { data: existing, error: existErr } = await supabaseAdmin
    .from("job_tank_items")
    .select("id")
    .eq("job_id", job_id)
    .eq("candidate_id", candidate_id)
    .limit(1);

  if (existErr) {
    back.searchParams.set("tank_saved", "0");
    back.searchParams.set("tank_error", "dedupe_failed");
    return NextResponse.redirect(back, 303);
  }

  if ((existing || []).length > 0) {
    back.searchParams.set("tank_saved", "1");
    return NextResponse.redirect(back, 303);
  }

  const { error: insErr } = await supabaseAdmin.from("job_tank_items").insert({
    job_id,
    candidate_id,
    tier,
    notes,
    visible_to_client,
    blocked,
  });

  if (insErr) {
    back.searchParams.set("tank_saved", "0");
    back.searchParams.set("tank_error", "insert_failed");
    return NextResponse.redirect(back, 303);
  }

  back.searchParams.set("tank_saved", "1");
  return NextResponse.redirect(back, 303);
}
