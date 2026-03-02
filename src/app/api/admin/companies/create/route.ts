// src/app/api/admin/companies/create/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

function nullIfEmpty(v: string) {
  const t = (v || "").trim();
  return t ? t : null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = s(form.get("name"));
    if (!name) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const payload = {
      name,
      contact_name: nullIfEmpty(s(form.get("contact_name"))),
      contact_email: nullIfEmpty(s(form.get("contact_email"))),
      contact_phone: nullIfEmpty(s(form.get("contact_phone"))),
      address_line1: nullIfEmpty(s(form.get("address_line1"))),
      address_line2: nullIfEmpty(s(form.get("address_line2"))),
      city: nullIfEmpty(s(form.get("city"))),
      region: nullIfEmpty(s(form.get("region"))),
      postal_code: nullIfEmpty(s(form.get("postal_code"))),
      country: nullIfEmpty(s(form.get("country"))),
      notes: nullIfEmpty(s(form.get("notes"))),
    };

    const { data, error } = await supabaseAdmin
      .from("companies")
      .insert(payload)
      .select("id")
      .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const id = data?.[0]?.id;
    if (!id) return NextResponse.json({ error: "Created, but id not returned." }, { status: 500 });

    return NextResponse.redirect(new URL(`/admin/companies/${id}`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
