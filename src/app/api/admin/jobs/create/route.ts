import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function safeReturnUrl(return_to: string, requestUrl: string) {
  try {
    const base = new URL(requestUrl);
    const raw = String(return_to || "").trim();

    // absolute -> force to same origin
    try {
      const abs = new URL(raw);
      return new URL(abs.pathname + abs.search + abs.hash, base.origin);
    } catch {
      // ignore
    }

    if (raw.startsWith("/")) return new URL(raw, base.origin);
    return new URL("/admin/jobs", base.origin);
  } catch {
    return new URL("http://localhost:3000/admin/jobs");
  }
}

function isUuid(v: string) {
  return /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(v);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const company_id = s(form.get("company_id"));
    const owner_user_id = s(form.get("owner_user_id"));
    const title = s(form.get("title"));
    const city = s(form.get("city"));
    const work_mode = s(form.get("work_mode"));
    const salary_min = s(form.get("salary_min"));
    const salary_max = s(form.get("salary_max"));
    const status = s(form.get("status")) || "open";
    const return_to = s(form.get("return_to")) || "/admin/jobs";

    if (!company_id || !title || !owner_user_id) {
      const receivedKeys: string[] = [];
      for (const [k] of form.entries()) receivedKeys.push(k);

      return NextResponse.json(
        {
          error: "Missing required field(s)",
          missing: {
            company_id: !company_id,
            title: !title,
            owner_user_id: !owner_user_id,
          },
          receivedKeys,
          receivedSample: {
            company_id,
            owner_user_id: owner_user_id ? owner_user_id.slice(0, 8) + "…" : "",
            title,
          },
        },
        { status: 400 }
      );
    }

    if (!isUuid(company_id) || !isUuid(owner_user_id)) {
      return NextResponse.json(
        { error: "Invalid company_id or owner_user_id." },
        { status: 400 }
      );
    }

    // Guard: owner must belong to the selected company (prevents FK crash)
    const { data: ownerRow, error: ownerErr } = await supabaseAdmin
      .from("company_users")
      .select("id, company_id")
      .eq("id", owner_user_id)
      .eq("company_id", company_id)
      .limit(1);

    if (ownerErr) {
      return NextResponse.json({ error: ownerErr.message }, { status: 500 });
    }

    if (!ownerRow || ownerRow.length === 0) {
      return NextResponse.json(
        {
          error: "Selected job owner does not belong to the selected company.",
          details: { company_id, owner_user_id },
        },
        { status: 400 }
      );
    }

    // Match your DB columns (location + comp_band)
    const location = city || null;
    const comp_band = salary_min || salary_max ? `${salary_min || "?"}-${salary_max || "?"}k` : null;

    const payload = {
      company_id,
      owner_user_id,
      title,
      location,
      work_mode: work_mode || null,
      comp_band,
      status,
    };

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert(payload)
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message, payload }, { status: 500 });
    }

    const id = data?.[0]?.id;
    if (!id) return NextResponse.json({ error: "Job created but no id returned" }, { status: 500 });

    return NextResponse.redirect(new URL(`/admin/jobs/${id}`, req.url), 303);
  } catch (e: any) {
    const back = safeReturnUrl("/admin/jobs", req.url);
    back.searchParams.set("job_saved", "0");
    back.searchParams.set("job_error", "server_error");
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
