import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const candidate_id = String(form.get("candidate_id") || "");
    const job_id = String(form.get("job_id") || "");
    const company_id = String(form.get("company_id") || "");
    const return_to = String(form.get("return_to") || "");

    if (!candidate_id || !company_id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("intro_requests").insert([
      {
        candidate_id,
        job_id: job_id || null,
        company_id,
        status: "new",
      },
    ]);

    // CHECK FOR THE DUPLICATE ERROR
    if (error) {
      if (error.code === "23505") {
        // This is the "Duplicate" error code. Just send them back as a success!
        const url = new URL(return_to, req.url);
        url.searchParams.set("success", "true");
        url.searchParams.set("already_exists", "true");
        return NextResponse.redirect(url, 303);
      }
      throw error;
    }

    const url = new URL(return_to, req.url);
    url.searchParams.set("success", "true");
    return NextResponse.redirect(url, 303);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}