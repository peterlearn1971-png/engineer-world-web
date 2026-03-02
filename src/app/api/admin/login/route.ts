// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const key = String(form.get("key") ?? "").trim();
  
  // THE SURGERY: We change this fallback from "/admin/intro-requests" to "/admin"
  const next = String(form.get("next") ?? "/admin").trim();

  // Your verified secret
  const secret = "PeterRyan1974!!"; 

  if (!key || key !== secret) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  // This will now send you to the Command Center (/admin)
  const res = NextResponse.redirect(new URL(next, req.url), 303);

  res.cookies.set("admin_key", secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", 
    path: "/",
    maxAge: 60 * 60 * 24 * 7, 
  });

  return res;
}