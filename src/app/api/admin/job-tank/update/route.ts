// src/app/api/admin/job-tank/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

function tierNormalize(v: string) {
  const t = v.trim().toUpperCase();
  if (t === "A" || t === "B" || t === "C") return t;
  return "C";
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
    const tier = tierNormalize(s(form.get("tier")));
    const blocked = toBool(s(form.get("blocked")));
    const visible_to_client = toBool(s(form.get("visible_to_client")));
    const notes = s(form.get("notes"));

    const return_to = s(form.get("return_to")) || `/admin/jobs/${job_id}`;

    if (!job_id || !candidate_id) {
      return NextResponse.json({ error: "Missing job_id or candidate_id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("job_tank_items")
      .update({
        tier: tier || "C",
        blocked,
        visible_to_client,
        notes: notes || null,
      })
      .eq("job_id", job_id)
      .eq("candidate_id", candidate_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
