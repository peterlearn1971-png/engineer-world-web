// src/app/api/admin/tokens/create/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

function makeToken() {
  // 12 hex chars, readable, demo-friendly
  return crypto.randomBytes(6).toString("hex");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const company_id = String(form.get("company_id") || "");
    const return_to = String(form.get("return_to") || "/admin/companies");

    if (!company_id) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
    }

    // Try a few times in case of rare token collision
    for (let i = 0; i < 5; i++) {
      const token = makeToken();

      const { error } = await supabase.from("company_portal_tokens").insert([
        {
          company_id,
          token,
        },
      ]);

      if (!error) {
        const target = return_to.startsWith("/") ? return_to : "/admin/companies";
        return NextResponse.redirect(new URL(target, req.url), 303);
      }

      // If unique token collision, loop; otherwise throw
      if (!String(error.message || "").toLowerCase().includes("unique")) {
        throw new Error(error.message);
      }
    }

    return NextResponse.json({ error: "Could not generate a unique token" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}