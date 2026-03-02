import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // <--- CHANGED THIS

function makeToken() {
  // Stable, URL-safe token
  // Example: 32 chars + a little extra entropy
  const a = crypto.randomUUID().replace(/-/g, "");
  const b = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${a}${b}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const company_id = String(formData.get("company_id") || "").trim();

    if (!company_id) {
      return NextResponse.redirect(new URL("/admin/companies?error=missing_company_id", req.url));
    }

    const token = makeToken();

    // Changed 'supabase' to 'supabaseAdmin' to bypass RLS permissions
    const { error } = await supabaseAdmin.from("company_portal_tokens").insert([
      {
        company_id,
        token,
        revoked_at: null,
      },
    ]);

    if (error) {
      console.error("company_portal_tokens insert error:", error);
      return NextResponse.redirect(
        new URL(`/admin/companies/${company_id}?error=token_create_failed`, req.url)
      );
    }

    // Success
    return NextResponse.redirect(new URL(`/admin/companies/${company_id}`, req.url));
  } catch (err) {
    console.error("company-tokens/create fatal:", err);
    return NextResponse.redirect(new URL(`/admin/companies?error=server_error`, req.url));
  }
}