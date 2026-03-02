// src/app/api/admin/candidate-cards/upsert/route.ts
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

    const headline = s(form.get("headline"));
    const summary = s(form.get("summary"));

    // Preferred: upsert on candidate_id
    // This requires candidate_cards.candidate_id to be UNIQUE or PRIMARY KEY.
    const { error } = await supabaseAdmin
      .from("candidate_cards")
      .upsert(
        {
          candidate_id,
          headline: headline || null,
          summary: summary || null,
        },
        { onConflict: "candidate_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional return_to support (you didn't include it in the form, so default)
    const return_to = s(form.get("return_to")) || `/admin/candidates/${candidate_id}`;
    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}