// src/app/api/auth/send-magic-link/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: unknown) {
  return String(v ?? "").trim();
}

function addApiKeyProperly(actionLink: string, anonKey: string) {
  if (!actionLink) return actionLink;
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY on server");

  // Use URL parsing so apikey lands in the querystring (before any #hash)
  const u = new URL(actionLink);
  if (!u.searchParams.get("apikey")) {
    u.searchParams.set("apikey", anonKey);
  }
  return u.toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = s(body.token);

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    // Validate invite (service role)
    const { data: invite, error: invErr } = await supabaseAdmin
      .from("company_user_invites")
      .select("token, email, expires_at, used_at, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    if (invite.used_at) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    if (invite.revoked_at) return NextResponse.json({ error: "Invite revoked" }, { status: 400 });

    const now = new Date();
    const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
    if (expiresAt && expiresAt.getTime() < now.getTime()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback?invite_token=${encodeURIComponent(token)}`;

    // Generate magic link without email
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: invite.email,
      options: { redirectTo },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let action_link = data?.properties?.action_link || "";
    if (!action_link) return NextResponse.json({ error: "No action_link returned" }, { status: 500 });

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    action_link = addApiKeyProperly(action_link, anonKey);

    // sanity check: apikey must be in the querystring (before any #hash)
    const u = new URL(action_link);
    if (!u.searchParams.get("apikey")) {
      return NextResponse.json({ error: "Failed to attach apikey to action_link" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action_link });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
