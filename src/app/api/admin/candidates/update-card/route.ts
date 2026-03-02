import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const candidate_id = s(form.get("candidate_id"));
    if (!candidate_id) {
      return NextResponse.json({ error: "Missing candidate_id" }, { status: 400 });
    }

    const payload = {
      candidate_id,
      headline: s(form.get("headline")) || null,
      summary: s(form.get("summary")) || null,
      skills: s(form.get("skills")) || null,
      location_blurb: s(form.get("location_blurb")) || null,
      work_mode: s(form.get("work_mode")) || null,
      availability: s(form.get("availability")) || null,
      comp_band: s(form.get("comp_band")) || null,
      languages: s(form.get("languages")) || null,
      target_roles: s(form.get("target_roles")) || null,
    };

    // Upsert 1 card per candidate_id
    const { error } = await supabaseAdmin
      .from("candidate_cards")
      .upsert(payload, { onConflict: "candidate_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL(`/admin/candidates/${candidate_id}`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}