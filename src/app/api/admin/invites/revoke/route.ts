// src/app/api/admin/invites/revoke/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const token = s(body.token);
    const revoked_by_company_user_id = s(body.revoked_by_company_user_id) || null;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("company_user_invites")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by_company_user_id,
      })
      .eq("token", token)
      .is("used_at", null)
      .is("revoked_at", null)
      .select("id, token, revoked_at")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Invite not found or already used/revoked" }, { status: 404 });

    return NextResponse.json({ ok: true, invite: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
