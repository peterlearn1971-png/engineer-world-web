import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseKey) {
      return NextResponse.json({ error: "Server error: Missing Supabase Service Key" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    const candidate_id = String(formData.get("candidate_id"));
    // Change 1: Get 'recruiter_notes' from the form
    const recruiter_notes = String(formData.get("recruiter_notes"));

    // Change 2: Save to 'candidate_private_notes' table
    const { error } = await supabaseAdmin
      .from("candidate_private_notes")
      .upsert({ 
        candidate_id: candidate_id, 
        recruiter_notes: recruiter_notes 
      }, { onConflict: 'candidate_id' });

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Change 3: Add the success flag to the redirect
    const referer = request.headers.get("referer") || "/admin/candidates";
    const redirectUrl = new URL(referer);
    redirectUrl.searchParams.set('success', 'true');
    
    return NextResponse.redirect(redirectUrl.toString(), 303);

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}