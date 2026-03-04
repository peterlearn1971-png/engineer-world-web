// src/app/api/admin/reset-demo/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const reset_key = s(form.get("reset_key"));

    if (!process.env.ADMIN_RESET_KEY) {
      return NextResponse.json(
        { error: "ADMIN_RESET_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    if (reset_key !== process.env.ADMIN_RESET_KEY) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete in dependency order
    // UUID columns must compare against a UUID value (use ZERO_UUID).
    // Text columns can use "__never__".
    const steps: Array<{ table: string; whereCol: string; whereVal: string }> = [
      { table: "portal_events", whereCol: "id", whereVal: ZERO_UUID },
      { table: "intro_requests", whereCol: "id", whereVal: ZERO_UUID },
      { table: "job_tank_items", whereCol: "id", whereVal: ZERO_UUID },
      { table: "shortlist_items", whereCol: "id", whereVal: ZERO_UUID },
      { table: "shortlists", whereCol: "id", whereVal: ZERO_UUID },

      // token is TEXT
      { table: "company_portal_tokens", whereCol: "token", whereVal: "__never__" },

      { table: "jobs", whereCol: "id", whereVal: ZERO_UUID },
      { table: "candidate_cards", whereCol: "candidate_id", whereVal: ZERO_UUID },
      { table: "candidates", whereCol: "id", whereVal: ZERO_UUID },
      { table: "companies", whereCol: "id", whereVal: ZERO_UUID },
    ];

    for (const step of steps) {
      const { error } = await supabaseAdmin
        .from(step.table)
        .delete()
        .neq(step.whereCol, step.whereVal);

      // Ignore missing tables
      if (error && String(error.message).toLowerCase().includes("does not exist")) continue;

      if (error) {
        return NextResponse.json(
          { error: `Failed clearing ${step.table}: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}