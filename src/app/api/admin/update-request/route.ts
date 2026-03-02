import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const formData = await request.formData();

  const request_id = String(formData.get("request_id") || "");
  const status = String(formData.get("status") || "pending");
  const internal_notes = String(formData.get("internal_notes") || "");

  if (!request_id) {
    return new Response("Missing request_id", { status: 400 });
  }

  const { error } = await supabase
    .from("intro_requests")
    .update({ status, internal_notes })
    .eq("id", request_id);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(null, {
    status: 303,
    headers: { Location: "/admin/requests" },
  });
}