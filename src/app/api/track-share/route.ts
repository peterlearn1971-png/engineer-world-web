import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // 1. Get the tracking data
  const company_id = searchParams.get("coid");
  const job_id = searchParams.get("jid");
  const candidate_id = searchParams.get("cid");
  
  // 2. Get the actual destination (the mailto link)
  const target = searchParams.get("target");

  // 3. Log the "Share" event in the background (fire and forget)
  // We use supabaseAdmin so RLS doesn't block us
  if (job_id && candidate_id) {
    // Only insert if we have a valid job_id to prevent UUID errors
    try {
        await supabaseAdmin.from("resume_shares").insert({
          company_id: company_id || null,
          job_id: job_id,
          candidate_id: candidate_id
        });
    } catch (error) {
        console.error("Tracking Error:", error);
    }
  }

  // 4. Redirect the user to their email app
  // If no target was provided, fallback to home to prevent errors
  if (!target) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.redirect(target);
}