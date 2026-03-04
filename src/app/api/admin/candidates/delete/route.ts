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
    const confirm = s(form.get("confirm"));

    if (!candidate_id) return NextResponse.json({ error: "Missing candidate_id" }, { status: 400 });
    
    // Safety Check: Forces you to type DELETE
    if (confirm !== "DELETE") return NextResponse.json({ error: "Type DELETE to confirm." }, { status: 400 });

    // 1. THE SWEEPER: Clean up all linked records so Supabase doesn't block the delete
    await supabaseAdmin.from("job_tank_items").delete().eq("candidate_id", candidate_id);
    await supabaseAdmin.from("intro_requests").delete().eq("candidate_id", candidate_id);
    await supabaseAdmin.from("shortlist_items").delete().eq("candidate_id", candidate_id);
    await supabaseAdmin.from("portal_events").delete().eq("candidate_id", candidate_id);
    await supabaseAdmin.from("candidate_private_notes").delete().eq("candidate_id", candidate_id);
    await supabaseAdmin.from("candidate_cards").delete().eq("candidate_id", candidate_id);

    // 2. VAPORIZE: Delete the actual candidate
    const { error } = await supabaseAdmin.from("candidates").delete().eq("id", candidate_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 3. Kick you back to the candidate list
    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}