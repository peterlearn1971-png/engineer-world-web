// src/app/api/admin/job-tank/toggle-block/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function toBool(v: string) {
  const x = v.trim().toLowerCase();
  return x === "true" || x === "1" || x === "yes" || x === "on";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const job_id = s(form.get("job_id"));
    const candidate_id = s(form.get("candidate_id"));
    const current_visible_to_client = s(form.get("current_visible_to_client"));
    const return_to = s(form.get("return_to")) || `/admin/jobs/${job_id}`;

    if (!job_id || !candidate_id) {
      return NextResponse.json({ error: "Missing job_id or candidate_id" }, { status: 400 });
    }

    const nextVisible = !toBool(current_visible_to_client);

    const { error } = await supabaseAdmin
      .from("job_tank_items")
      .update({ visible_to_client: nextVisible })
      .eq("job_id", job_id)
      .eq("candidate_id", candidate_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
