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

    // We only save data that exists in the 'candidates' table
    const payload: any = {
      full_name: s(form.get("full_name")) || null,
      city: s(form.get("city")) || null,
      region: s(form.get("region")) || null,
      email: s(form.get("email")) || null,
      phone: s(form.get("phone")) || null,
      current_employer: s(form.get("current_employer")) || null,
    };

    const { error } = await supabaseAdmin.from("candidates").update(payload).eq("id", candidate_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL(`/admin/candidates/${candidate_id}?success=true`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}