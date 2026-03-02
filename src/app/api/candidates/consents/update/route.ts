import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getUser(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  if (!token) return { error: "Missing Authorization bearer token." };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: error?.message || "Invalid auth token." };

  return { user: data.user };
}

async function getBooleanFields() {
  const { data, error } = await supabaseAdmin
    .from("information_schema.columns")
    .select("column_name, data_type")
    .eq("table_schema", "public")
    .eq("table_name", "candidate_consents");

  if (error) throw new Error(error.message);

  return (data || [])
    .filter((c: any) => c.data_type === "boolean")
    .map((c: any) => c.column_name);
}

export async function POST(req: Request) {
  try {
    const auth = await getUser(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });
    const user = auth.user;

    const body = await req.json().catch(() => ({}));
    const updates = (body?.updates && typeof body.updates === "object") ? body.updates : null;
    if (!updates) return NextResponse.json({ error: "Missing updates object." }, { status: 400 });

    const allowed = new Set(await getBooleanFields());
    const safe: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (!allowed.has(k)) continue;
      safe[k] = Boolean(v);
    }

    if (Object.keys(safe).length === 0) {
      return NextResponse.json({ error: "No valid boolean consent fields in updates." }, { status: 400 });
    }

    // Update by auth_user_id
    const { data, error } = await supabaseAdmin
      .from("candidate_consents")
      .update(safe)
      .eq("auth_user_id", user.id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ status: "ok", consents: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
