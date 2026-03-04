import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_ROLES = new Set(["company_owner", "company_vp", "company_rep"]);

function s(v: any) {
  return String(v || "").trim();
}

function isUuid(v: string) {
  return /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(v);
}

function normEmail(v: any) {
  return s(v).toLowerCase();
}

function isUniqueViolation(msg: string) {
  const m = String(msg || "");
  return m.includes("duplicate key value violates unique constraint") || m.includes("company_users_company_email_unique");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const company_id = s(body.company_id);
    const email = normEmail(body.email);
    const name = s(body.name) || null;
    const role = s(body.role) || "company_rep";
    const title = s(body.title) || null;
    const region_scope = s(body.region_scope) || null;
    const active = typeof body.active === "boolean" ? body.active : true;

    if (!company_id || !isUuid(company_id)) {
      return NextResponse.json({ error: "Missing or invalid company_id." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Missing email." }, { status: 400 });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${Array.from(ALLOWED_ROLES).join(", ")}` },
        { status: 400 }
      );
    }

    // Guardrail: company must exist
    const { data: company, error: companyErr } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("id", company_id)
      .maybeSingle();

    if (companyErr) return NextResponse.json({ error: companyErr.message }, { status: 500 });
    if (!company?.id) return NextResponse.json({ error: "Company not found." }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("company_users")
      .insert({
        company_id,
        email,
        name,
        role,
        title,
        region_scope,
        active,
      })
      .select("id, company_id, email, name, role, active, created_at, title, region_scope, auth_user_id")
      .single();

    if (error) {
      if (isUniqueViolation(error.message)) {
        return NextResponse.json(
          { error: "That email already exists for this company." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: "ok", user: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
