import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const candidate_id = String(form.get("candidate_id") || "").trim();
    const file = form.get("resume_file");

    if (!candidate_id) return new NextResponse("Missing candidate_id", { status: 400 });
    if (!file || !(file instanceof File)) return new NextResponse("Missing resume_file", { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const safeName = (file.name || "resume.pdf").replace(/[^\w.\-]+/g, "_");
    const path = `${candidate_id}/${Date.now()}_${safeName}`;

    // CHANGED: Now using the correct "candidate-resumes" bucket we created yesterday
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("candidate-resumes") 
      .upload(path, buffer, {
        contentType: file.type || "application/pdf",
        upsert: true,
      });

    if (uploadErr) return new NextResponse(uploadErr.message, { status: 500 });

    // CHANGED: Fetching the public URL from the correct bucket
    const { data: pub } = supabaseAdmin.storage.from("candidate-resumes").getPublicUrl(path);
    const resume_url = pub?.publicUrl || null;

    const { error: updErr } = await supabaseAdmin
      .from("candidates")
      .update({ resume_url })
      .eq("id", candidate_id);

    if (updErr) return new NextResponse(updErr.message, { status: 500 });

    return NextResponse.redirect(new URL(`/admin/candidates/${candidate_id}`, req.url), 303);
  } catch (e: any) {
    return new NextResponse(e?.message || "Resume upload failed", { status: 500 });
  }
}