// src/app/api/invites/status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") || "").trim();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: invite, error } = await supabaseAdmin
    .from("company_user_invites")
    .select("id, token, email, expires_at, used_at, revoked_at, company_user_id")
    .eq("token", token)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!invite) return NextResponse.json({ status: "not_found" });

  const now = new Date();
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;

  if (invite.used_at) return NextResponse.json({ status: "used", invite });
  if (invite.revoked_at) return NextResponse.json({ status: "revoked", invite });
  if (expiresAt && expiresAt.getTime() < now.getTime()) return NextResponse.json({ status: "expired", invite });

  return NextResponse.json({ status: "ok", invite });
}
