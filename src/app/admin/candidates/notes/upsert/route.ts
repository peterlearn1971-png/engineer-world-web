// src/app/api/admin/candidates/notes/upsert/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const candidate_id = s(form.get("candidate_id"));
    const recruiter_notes = s(form.get("recruiter_notes"));

    if (!candidate_id) {
      return NextResponse.json({ error: "Missing candidate_id" }, { status: 400 });
    }

    const payload = {
      candidate_id,
      recruiter_notes: recruiter_notes ? recruiter_notes : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("candidate_private_notes")
      .upsert(payload, { onConflict: "candidate_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.redirect(new URL(`/admin/candidates/${candidate_id}`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
