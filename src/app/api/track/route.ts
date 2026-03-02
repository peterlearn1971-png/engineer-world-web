import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const event_type = String(searchParams.get("event") || "");
    const company_id = String(searchParams.get("company_id") || "");
    const candidate_id = searchParams.get("candidate_id");
    const token = searchParams.get("token");
    const view = searchParams.get("view");

    if (!event_type || !company_id) {
      return new NextResponse(null, { status: 204 });
    }

    const meta: any = {};
    if (view) meta.view = view;

    await supabase.from("portal_events").insert([
      {
        event_type,
        company_id,
        candidate_id: candidate_id || null,
        token: token || null,
        meta: Object.keys(meta).length ? meta : null,
      },
    ]);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}