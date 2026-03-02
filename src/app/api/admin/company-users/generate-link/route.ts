import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, email } = body;

    // 1. Get the current domain automatically (e.g. localhost:3000 or your-app.vercel.app)
    const origin = new URL(req.url).origin;

    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    // 2. Get the user info
    const { data: userRow } = await supabaseAdmin
      .from("company_users")
      .select("company_id, auth_user_id")
      .eq("id", user_id)
      .single();

    if (!userRow) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 3. Logic: If they have a real Supabase Auth ID, try to make a real magic link
    if (userRow.auth_user_id) {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: {
            redirectTo: `${origin}/dashboard` // Send them back to the right place
        }
      });

      if (!linkErr && linkData?.properties?.action_link) {
        return NextResponse.json({ link: linkData.properties.action_link });
      }
    }

    // 4. Fallback: Use the Company Portal Token
    const { data: tokens } = await supabaseAdmin
      .from("company_portal_tokens")
      .select("token")
      .eq("company_id", userRow.company_id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const activeToken = tokens?.[0]?.token;

    if (activeToken) {
      // Use the 'origin' variable we captured at the top
      const magicLink = `${origin}/c/${activeToken}?u=${encodeURIComponent(email)}`;
      return NextResponse.json({ link: magicLink });
    }

    return NextResponse.json({ error: "No active portal links found. Create one above first!" }, { status: 400 });

  } catch (error: any) {
    console.error("Generate link error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}