import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const form = await request.formData();

  const job_id = String(form.get("job_id") || "").trim();
  const title = String(form.get("title") || "").trim();
  const location = String(form.get("location") || "").trim();
  const work_mode = String(form.get("work_mode") || "").trim();
  const comp_band = String(form.get("comp_band") || "").trim();
  const languages = String(form.get("languages") || "").trim();
  const status = String(form.get("status") || "open").trim();
  const client_notes = String(form.get("client_notes") || "").trim();

  const return_to = `/admin/jobs/${job_id}`;
  const back = new URL(return_to, request.url);

  if (!job_id) {
    back.searchParams.set("job_error", "missing_id");
    return NextResponse.redirect(back, 303);
  }

  const { error } = await supabaseAdmin
    .from("jobs")
    .update({
      title,
      location,
      work_mode,
      comp_band,
      languages,
      status,
      client_notes
    })
    .eq("id", job_id);

  if (error) {
    back.searchParams.set("job_error", "update_failed");
    return NextResponse.redirect(back, 303);
  }

  back.searchParams.set("job_saved", "1");
  return NextResponse.redirect(back, 303);
}