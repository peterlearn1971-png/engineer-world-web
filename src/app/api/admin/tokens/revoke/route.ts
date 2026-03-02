// src/app/api/admin/tokens/revoke/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const token_id = String(form.get("token_id") || "");
    const return_to = String(form.get("return_to") || "/admin/companies");

    if (!token_id) {
      return NextResponse.json({ error: "Missing token_id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("company_portal_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", token_id);

    if (error) throw new Error(error.message);

    const target = return_to.startsWith("/") ? return_to : "/admin/companies";
    return NextResponse.redirect(new URL(target, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}