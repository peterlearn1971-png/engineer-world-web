// src/app/api/invites/consume/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const invite_token = s(body.invite_token);
    const auth_user_id = s(body.auth_user_id);

    if (!invite_token) return NextResponse.json({ error: "Missing invite_token" }, { status: 400 });
    if (!auth_user_id) return NextResponse.json({ error: "Missing auth_user_id" }, { status: 400 });

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("company_user_invites")
      .select("id, token, email, expires_at, used_at, revoked_at, company_user_id")
      .eq("token", invite_token)
      .maybeSingle();

    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const now = new Date();
    const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;

    if (invite.used_at) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    if (invite.revoked_at) return NextResponse.json({ error: "Invite revoked" }, { status: 400 });
    if (expiresAt && expiresAt.getTime() < now.getTime()) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    // Link auth_user_id to company_users row
    const { data: cu, error: linkErr } = await supabaseAdmin
      .from("company_users")
      .update({
        auth_user_id,
        active: true,
      })
      .eq("id", invite.company_user_id)
      .select("id, company_id, role")
      .single();

    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });

    // Mark invite used
    const { error: usedErr } = await supabaseAdmin
      .from("company_user_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (usedErr) return NextResponse.json({ error: usedErr.message }, { status: 500 });

    // Decide landing page
    const landing = "/app";

    return NextResponse.json({ ok: true, company_user: cu, landing });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
