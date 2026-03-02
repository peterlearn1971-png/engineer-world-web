// src/app/api/shortlists/toggle/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const company_id = String(form.get("company_id") || "");
    const candidate_id = String(form.get("candidate_id") || "");
    const return_to = String(form.get("return_to") || "");

    // Optional: when called from /c/[token] pages
    const token = String(form.get("token") || "");

    if (!company_id || !candidate_id) {
      return NextResponse.json(
        { error: "Missing company_id or candidate_id" },
        { status: 400 }
      );
    }

    // 1) Find existing shortlist for this company
    const { data: existingShortlists, error: shortlistFindErr } = await supabase
      .from("shortlists")
      .select("id, company_id, title")
      .eq("company_id", company_id)
      .eq("title", "Default")
      .limit(1);

    if (shortlistFindErr) throw new Error(shortlistFindErr.message);

    let shortlist_id: string | null = existingShortlists?.[0]?.id ?? null;

    // 2) Create one if none exists
    if (!shortlist_id) {
      const { data: created, error: shortlistCreateErr } = await supabase
        .from("shortlists")
        .insert([{ company_id, title: "Default" }])
        .select("id")
        .limit(1);

      if (shortlistCreateErr) throw new Error(shortlistCreateErr.message);

      shortlist_id = created?.[0]?.id ?? null;
    }

    if (!shortlist_id) {
      return NextResponse.json(
        { error: "Could not resolve shortlist_id" },
        { status: 500 }
      );
    }

    // 3) Check if candidate is already on shortlist
    const { data: existingItem, error: itemFindErr } = await supabase
      .from("shortlist_items")
      .select("id")
      .eq("shortlist_id", shortlist_id)
      .eq("candidate_id", candidate_id)
      .limit(1);

    if (itemFindErr) throw new Error(itemFindErr.message);

    const alreadySaved = (existingItem?.length ?? 0) > 0;

    // 4) Toggle
    if (alreadySaved) {
      // Remove
      const { error: delErr } = await supabase
        .from("shortlist_items")
        .delete()
        .eq("shortlist_id", shortlist_id)
        .eq("candidate_id", candidate_id);

      if (delErr) throw new Error(delErr.message);

      // Track remove
      await supabase.from("portal_events").insert([
        {
          event_type: "shortlist_remove",
          company_id,
          candidate_id,
          token: token || null,
          meta: { shortlist_id },
        },
      ]);
    } else {
      // Add
      const { error: insErr } = await supabase.from("shortlist_items").insert([
        {
          shortlist_id,
          candidate_id,
        },
      ]);

      if (insErr) throw new Error(insErr.message);

      // Track add
      await supabase.from("portal_events").insert([
        {
          event_type: "shortlist_add",
          company_id,
          candidate_id,
          token: token || null,
          meta: { shortlist_id },
        },
      ]);
    }

    // 5) Redirect back
    return new Response(null, {
      status: 303,
      headers: { Location: return_to || `/client/${company_id}` },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}