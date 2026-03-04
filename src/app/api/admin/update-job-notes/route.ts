// src/app/api/admin/update-job-notes/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const job_id = s(form.get("job_id"));
    const client_notes = s(form.get("client_notes"));

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("jobs").update({ client_notes }).eq("id", job_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL(`/admin/jobs/${job_id}?saved=1`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
