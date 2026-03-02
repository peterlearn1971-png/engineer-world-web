import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getUserFromRequest(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  if (!token) return { error: "Missing Authorization bearer token." };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: error?.message || "Invalid auth token." };

  return { user: data.user, token };
}

function inferBooleanFields(row: any) {
  if (!row || typeof row !== "object") return [];
  const ignore = new Set([
    "id",
    "auth_user_id",
    "candidate_id",
    "email",
    "created_at",
    "updated_at",
    "deleted_at",
    "is_deleted",
  ]);

  return Object.entries(row)
    .filter(([k, v]) => !ignore.has(k) && typeof v === "boolean")
    .map(([k]) => k)
    .sort();
}

// If we try inserting a column that doesn't exist (42703), retry with a smaller payload.
async function safeInsert(table: string, payload: Record<string, any>, fallbacks: Record<string, any>[]) {
  // try primary payload
  const first = await supabaseAdmin.from(table).insert(payload).select("*").single();
  if (!first.error) return first;

  const code = (first.error as any)?.code;
  if (code !== "42703") return first; // not "undefined column"

  for (const fb of fallbacks) {
    const attempt = await supabaseAdmin.from(table).insert(fb).select("*").single();
    if (!attempt.error) return attempt;
    const fbCode = (attempt.error as any)?.code;
    if (fbCode !== "42703") return attempt;
  }

  return first;
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFromRequest(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

    const user = auth.user;

    // ---- candidates ----
    const { data: existingCandidate, error: selErr } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    let candidate = existingCandidate;

    if (!candidate) {
      const meta: any = user.user_metadata || {};
      const candidatePayload: Record<string, any> = {
        auth_user_id: user.id,
        email: user.email || null,
        full_name: meta.full_name || meta.name || null,
        phone: meta.phone || null,
        city: meta.city || null,
        region: meta.region || null,
      };

      // fallbacks if your candidates table is skinnier than expected
      const fallbacks = [
        { auth_user_id: user.id, email: user.email || null },
        { auth_user_id: user.id },
      ];

      const ins = await safeInsert("candidates", candidatePayload, fallbacks);
      if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
      candidate = ins.data;
    }

    // ---- candidate_consents ----
const { data: existingConsents, error: cSelErr } = await supabaseAdmin
  .from("candidate_consents")
  .select("*")
  .eq("candidate_id", candidate.id)
  .maybeSingle();

if (cSelErr) return NextResponse.json({ error: cSelErr.message }, { status: 500 });

let consents = existingConsents;

if (!consents) {
  const baseConsentValues = {
    candidate_id: candidate.id,
    visible_to_recruiters: false,
    visible_to_companies: false,
    visible_in_public_directory: false,
  };

  const { data: insC, error: insCErr } = await supabaseAdmin
    .from("candidate_consents")
    .insert(baseConsentValues)
    .select("*")
    .single();

  if (insCErr) return NextResponse.json({ error: insCErr.message }, { status: 500 });
  consents = insC;
}


    const boolFields = inferBooleanFields(consents);

    return NextResponse.json({
      status: "ok",
      candidate,
      consents,
      consent_boolean_fields: boolFields,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
