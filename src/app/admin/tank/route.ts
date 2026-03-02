// src/app/api/admin/tank/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function safeReturnUrl(return_to: string, requestUrl: string) {
  try {
    const base = new URL(requestUrl);
    const raw = String(return_to || "").trim();

    // absolute -> force same-origin
    try {
      const abs = new URL(raw);
      return new URL(abs.pathname + abs.search + abs.hash, base.origin);
    } catch {
      // not absolute
    }

    if (raw.startsWith("/")) return new URL(raw, base.origin);
    return new URL("/admin/jobs", base.origin);
  } catch {
    return new URL("http://localhost:3000/admin/jobs");
  }
}

export async function POST(request: Request) {
  const form = await request.formData();

  const action = s(form.get("action")); // add | toggle_visible | toggle_block | update_notes
  const return_to = s(form.get("return_to"));
  const job_id = s(form.get("job_id"));
  const candidate_id = s(form.get("candidate_id"));
  const tank_item_id = s(form.get("tank_item_id"));

  const tier = s(form.get("tier")) || null;
  const notes = s(form.get("notes")) || null;

  const url = safeReturnUrl(return_to || "/admin/jobs", request.url);

  try {
    if (!action) {
      url.searchParams.set("tank_error", "missing_action");
      return NextResponse.redirect(url, 303);
    }

    if (action === "add") {
      if (!job_id || !candidate_id) {
        url.searchParams.set("tank_error", "missing_job_or_candidate");
        return NextResponse.redirect(url, 303);
      }

      // Dedup: don’t create duplicates for same job+candidate
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("job_tank_items")
        .select("id")
        .eq("job_id", job_id)
        .eq("candidate_id", candidate_id)
        .limit(1);

      if (exErr) {
        url.searchParams.set("tank_error", "dedupe_failed");
        return NextResponse.redirect(url, 303);
      }

      if ((existing || []).length > 0) {
        url.searchParams.set("tank_saved", "1");
        url.searchParams.set("tank_note", "already_in_tank");
        return NextResponse.redirect(url, 303);
      }

      const { error: insErr } = await supabaseAdmin.from("job_tank_items").insert({
        job_id,
        candidate_id,
        tier,
        notes,
        visible_to_client: true,
        blocked: false,
      });

      if (insErr) {
        url.searchParams.set("tank_error", "insert_failed");
        return NextResponse.redirect(url, 303);
      }

      url.searchParams.set("tank_saved", "1");
      url.searchParams.set("tank_note", "added");
      return NextResponse.redirect(url, 303);
    }

    if (!tank_item_id) {
      url.searchParams.set("tank_error", "missing_tank_item_id");
      return NextResponse.redirect(url, 303);
    }

    if (action === "toggle_visible") {
      const next = s(form.get("next_visible"));
      const visible = next === "1" || next.toLowerCase() === "true";

      const { error } = await supabaseAdmin.from("job_tank_items").update({ visible_to_client: visible }).eq("id", tank_item_id);
      if (error) {
        url.searchParams.set("tank_error", "update_visible_failed");
        return NextResponse.redirect(url, 303);
      }

      url.searchParams.set("tank_saved", "1");
      url.searchParams.set("tank_note", "visible_updated");
      return NextResponse.redirect(url, 303);
    }

    if (action === "toggle_block") {
      const next = s(form.get("next_blocked"));
      const blocked = next === "1" || next.toLowerCase() === "true";

      const { error } = await supabaseAdmin.from("job_tank_items").update({ blocked }).eq("id", tank_item_id);
      if (error) {
        url.searchParams.set("tank_error", "update_block_failed");
        return NextResponse.redirect(url, 303);
      }

      url.searchParams.set("tank_saved", "1");
      url.searchParams.set("tank_note", "blocked_updated");
      return NextResponse.redirect(url, 303);
    }

    if (action === "update_notes") {
      const { error } = await supabaseAdmin.from("job_tank_items").update({ tier, notes }).eq("id", tank_item_id);
      if (error) {
        url.searchParams.set("tank_error", "update_notes_failed");
        return NextResponse.redirect(url, 303);
      }

      url.searchParams.set("tank_saved", "1");
      url.searchParams.set("tank_note", "notes_updated");
      return NextResponse.redirect(url, 303);
    }

    url.searchParams.set("tank_error", "unknown_action");
    return NextResponse.redirect(url, 303);
  } catch {
    url.searchParams.set("tank_error", "server_exception");
    return NextResponse.redirect(url, 303);
  }
}
