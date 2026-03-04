// src/app/api/admin/set-request-status/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const request_id = String(form.get("request_id") || "");
    const status = String(form.get("status") || "");
    const return_to = String(form.get("return_to") || "/admin/requests");

    if (!request_id || !status) {
      return NextResponse.json({ error: "Missing request_id or status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("intro_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", request_id);

    if (error) throw new Error(error.message);

    const target = return_to.startsWith("/") ? return_to : "/admin/requests";
    return NextResponse.redirect(new URL(target, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}