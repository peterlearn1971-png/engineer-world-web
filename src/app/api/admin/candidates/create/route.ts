import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function s(v: FormDataEntryValue | null) {
  return String(v || "").trim();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const full_name = s(form.get("full_name"));
    const city = s(form.get("city"));
    const region = s(form.get("region"));
    const email = s(form.get("email"));
    const phone = s(form.get("phone"));

    if (!full_name || !email) {
      return NextResponse.json({ error: "Full name and Email are required" }, { status: 400 });
    }

    // STEP 1: Create the actual Login account (Auth) in Supabase
    // This gives them a "Key" to the building and auto-confirms them to bypass limits.
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: "TempPassword123!", // You can change this or have them reset it later
      email_confirm: true, // This bypasses the "2 emails per hour" limit
      user_metadata: { full_name, city, region, phone }
    });

    if (authError) {
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 500 });
    }

    // STEP 2: Link that new Auth ID to your Candidates table
    const payload: any = {
      auth_user_id: authUser.user.id, // THE MISSING LINK
      full_name,
      city: city || null,
      region: region || null,
      email: email || null,
      phone: phone || null,
    };

    const { data, error } = await supabaseAdmin
      .from("candidates")
      .insert([payload])
      .select("id")
      .limit(1);

    if (error) {
      // If the database insert fails, we should probably remove the auth user we just made
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 500 });
    }

    const newId = data?.[0]?.id;
    return NextResponse.redirect(new URL(`/admin/candidates/${newId}`, req.url), 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}