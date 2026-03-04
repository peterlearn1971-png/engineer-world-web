// src/app/api/admin/invites/create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const company_user_id = s(body.company_user_id);
    const created_by_company_user_id = s(body.created_by_company_user_id) || null;

    if (!company_user_id) {
      return NextResponse.json({ error: "Missing company_user_id" }, { status: 400 });
    }

    // Load company user (email lives here)
    const { data: cu, error: cuErr } = await supabaseAdmin
      .from("company_users")
      .select("id, email, active")
      .eq("id", company_user_id)
      .maybeSingle();

    if (cuErr) return NextResponse.json({ error: cuErr.message }, { status: 500 });
    if (!cu) return NextResponse.json({ error: "company_user not found" }, { status: 404 });
    if (!cu.email) return NextResponse.json({ error: "company_user.email is empty" }, { status: 400 });
    if (cu.active === false) return NextResponse.json({ error: "company_user is inactive" }, { status: 400 });

    // Revoke any open invites for this company_user_id
    await supabaseAdmin
      .from("company_user_invites")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by_company_user_id: created_by_company_user_id,
      })
      .eq("company_user_id", company_user_id)
      .is("used_at", null)
      .is("revoked_at", null);

    // Create fresh invite (30-day default is in DB)
    const { data: invite, error: invErr } = await supabaseAdmin
      .from("company_user_invites")
      .insert({
        company_user_id,
        email: cu.email,
        created_by_company_user_id,
      })
      .select("id, token, expires_at, email, created_at")
      .single();

    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const invite_url = `${baseUrl.replace(/\/$/, "")}/accept-invite/${invite.token}`;

    return NextResponse.json({
      invite,
      invite_url,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
