import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const candidate_id = String(form.get("candidate_id") || "");
    const file = form.get("resume") as File | null;

    if (!candidate_id || !file) {
      return NextResponse.json({ error: "Missing candidate_id or file" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${candidate_id}-${Date.now()}.${ext}`;
    const path = `resumes/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("resumes").getPublicUrl(path);
    const resume_url = data.publicUrl;

    const { error: updateError } = await supabaseAdmin
      .from("candidates")
      .update({ resume_url })
      .eq("id", candidate_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.redirect(
      new URL(`/admin/candidates/${candidate_id}`, req.url),
      303
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}