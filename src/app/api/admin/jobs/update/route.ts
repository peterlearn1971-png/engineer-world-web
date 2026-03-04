// src/app/api/admin/jobs/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

const ALLOWED = new Set(["open", "paused", "closed"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const job_id = s(form.get("job_id"));
    const rawStatus = s(form.get("status"));
    const status = rawStatus.toLowerCase();
    const return_to = s(form.get("return_to"));

    if (!job_id) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    if (!ALLOWED.has(status)) return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });

    const { error } = await supabaseAdmin.from("jobs").update({ status }).eq("id", job_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (return_to) {
      return NextResponse.redirect(new URL(return_to, req.url), 303);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
