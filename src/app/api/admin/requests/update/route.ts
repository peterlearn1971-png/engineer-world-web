import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

const ALLOWED = new Set(["pending", "contacted", "completed", "declined"]);

function normalizeStatus(raw: string) {
  const v = String(raw || "").trim().toLowerCase();

  if (v === "closed") return "completed";
  if (v === "done") return "completed";
  if (v === "complete") return "completed";
  if (v === "decline") return "declined";
  if (v === "reject") return "declined";
  if (v === "rejected") return "declined";
  if (v === "contact") return "contacted";
  if (v === "in_progress") return "contacted";
  if (v === "in progress") return "contacted";

  return v;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const id = s(form.get("id"));
    const statusRaw = s(form.get("status")) || "pending";
    const status = normalizeStatus(statusRaw);

    const noteRaw = form.get("note");
    const note = noteRaw === null ? null : String(noteRaw);

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    if (!ALLOWED.has(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const patch: any = { status };
    // Only update note if it was submitted (it is, from your form)
    patch.note = note;

    const { error } = await supabaseAdmin.from("intro_requests").update(patch).eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/admin/requests", req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
