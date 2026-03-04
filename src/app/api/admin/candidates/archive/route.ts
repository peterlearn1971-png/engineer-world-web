import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const candidate_id = s(form.get("candidate_id"));
    const return_to = s(form.get("return_to")) || "/admin/candidates";

    if (!candidate_id) {
      return NextResponse.json({ error: "Missing candidate_id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("candidates")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", candidate_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
// remove candidate from all job tanks so clients stop seeing them
await supabaseAdmin
  .from("job_tank_items")
  .delete()
  .eq("candidate_id", candidate_id);


    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}