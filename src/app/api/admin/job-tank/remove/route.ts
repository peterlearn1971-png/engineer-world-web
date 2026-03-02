import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const candidate_id = String(form.get("candidate_id") || "");

    // We only need the candidate_id to reset their status
    if (!candidate_id || candidate_id === "undefined" || candidate_id === "") {
      return NextResponse.json({ error: "Missing candidate_id" }, { status: 400 });
    }

    // 1. Remove from the job tank
    const { error: tankError } = await supabaseAdmin
      .from("job_tank_items")
      .delete()
      .eq("candidate_id", candidate_id);

    if (tankError) throw tankError;

    // 2. Clear any intro requests so the "Request Intro" button resets for the client
    await supabaseAdmin
      .from("intro_requests")
      .delete()
      .eq("candidate_id", candidate_id);

    // 3. Refresh the cache so the admin and client views update immediately
    revalidatePath(`/admin/candidates/${candidate_id}`);
    revalidatePath(`/admin/candidates`);

    return NextResponse.redirect(new URL(`/admin/candidates/${candidate_id}?success=removed`, req.url), 303);
  } catch (e: any) {
    console.error("Remove Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}