import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { jobId, candidateId, note } = await req.json();

    if (!jobId || !candidateId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    // Update the record where this candidate meets this job
    const { error } = await supabaseAdmin
      .from("job_tank_items")
      .update({ client_note: note })
      .match({ job_id: jobId, candidate_id: candidateId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}