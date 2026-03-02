import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getUser(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  if (!token) return { error: "Missing Authorization bearer token." };
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: error?.message || "Invalid auth token." };
  return { user: data.user };
}

export async function POST(req: Request) {
  try {
    const auth = await getUser(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });
    const user = auth.user;
    const body = await req.json();

    const { data: candidate } = await supabaseAdmin.from("candidates").select("id").eq("auth_user_id", user.id).maybeSingle();
    if (!candidate?.id) return NextResponse.json({ error: "No candidate record found." }, { status: 400 });

    const { data: ins, error: insErr } = await supabaseAdmin.from("candidate_resumes").insert({
      candidate_id: candidate.id,
      storage_bucket: body.storage_bucket,
      storage_path: body.storage_path,
      original_name: body.original_name,
      mime_type: body.mime_type,
      size_bytes: body.size_bytes,
      uploaded_at: new Date().toISOString(),
    }).select("*").single();

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    return NextResponse.json({ status: "ok", resume: ins });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}