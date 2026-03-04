// src/app/api/admin/job-tank-items/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

function b(v: string) {
  return v === "true";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const id = s(form.get("id"));
    const tier = s(form.get("tier")) || "C";
    const blocked = b(s(form.get("blocked")));
    const visible_to_client = b(s(form.get("visible_to_client")));
    const notes = s(form.get("notes"));
    const return_to = s(form.get("return_to")) || "/admin/candidates";

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("job_tank_items")
      .update({
        tier,
        blocked,
        visible_to_client,
        notes: notes || null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.redirect(new URL(return_to, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
