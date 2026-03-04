// src/app/api/admin/intro-requests/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

const ALLOWED = new Set(["new", "contacted", "completed", "declined"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const id = s(form.get("id"));
    const rawStatus = s(form.get("status"));
    const status = rawStatus.toLowerCase();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (!ALLOWED.has(status)) {
      return NextResponse.json(
        {
          error: `Invalid status: ${status}`,
          debug: {
            route_version: "intro-requests/update v3",
            received_status_raw: rawStatus,
            received_status_normalized: status,
            allowed: Array.from(ALLOWED),
          },
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("intro_requests").update({ status }).eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const return_to = s(form.get("return_to"));
    if (return_to) {
      return NextResponse.redirect(new URL(return_to, req.url), 303);
    }

    return NextResponse.json({ ok: true, route_version: "intro-requests/update v3" });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error", route_version: "intro-requests/update v3" },
      { status: 500 }
    );
  }
}
