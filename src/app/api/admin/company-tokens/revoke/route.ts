// src/app/api/admin/company-tokens/revoke/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const company_id = String(formData.get("company_id") || "").trim();
    const token = String(formData.get("token") || "").trim();

    if (!company_id || !token) {
      return NextResponse.redirect(new URL("/admin/companies?error=missing_fields", req.url));
    }

    const { error } = await supabase
      .from("company_portal_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("company_id", company_id)
      .eq("token", token);

    if (error) {
      console.error("company_portal_tokens revoke error:", error);
      return NextResponse.redirect(
        new URL(`/admin/companies/${company_id}?error=token_revoke_failed`, req.url)
      );
    }

    return NextResponse.redirect(new URL(`/admin/companies/${company_id}`, req.url));
  } catch (err) {
    console.error("company-tokens/revoke fatal:", err);
    return NextResponse.redirect(new URL(`/admin/companies?error=server_error`, req.url));
  }
}