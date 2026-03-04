import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function toArray(v: string) {
  if (!v) return [];
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();

  const headline = s(form.get("headline"));
  const role = s(form.get("role"));
  const sector = s(form.get("sector"));
  const skillsRaw = s(form.get("skills"));
  const region = s(form.get("region"));
  const availability = s(form.get("availability"));

  const payload = {
    candidate_id: user.id,
    headline: headline || null,
    summary: sector || null,
    skills: toArray(skillsRaw),
    target_roles: role ? [role] : [],
    location_blurb: region || null,
    availability: availability || null,
  };

  const { error } = await supabase
    .from("candidate_cards")
    .upsert(payload, { onConflict: "candidate_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/candidates", req.url), 303);
}
