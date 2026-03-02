import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const form = await request.formData();
  
  const getStr = (name: string) => (form.get(name)?.toString() || "").trim();
  
  // Helper to turn "Skill 1, Skill 2" into ["Skill 1", "Skill 2"]
  const getArr = (name: string) => {
    const val = getStr(name);
    return val ? val.split(",").map(item => item.trim()).filter(Boolean) : [];
  };

  const candidate_id = getStr("candidate_id");
  
  if (!candidate_id || candidate_id === "undefined") {
    return NextResponse.redirect(new URL("/admin/candidates", request.url), 303);
  }

  const payload = {
    candidate_id,
    target_role: getStr("target_role"),
    // Update target_roles (ARRAY) as well for compatibility
    target_roles: getArr("target_role"), 
    current_company: getStr("current_company"),
    years_experience: parseInt(getStr("years_experience") || "0", 10) || 0,
    location_blurb: getStr("location_blurb"),
    // CRITICAL: Convert strings to ARRAY for your DB
    languages: getArr("languages"), 
    skills: getArr("skills"),       
    salary_expectation: getStr("salary_expectation"),
    availability: getStr("availability"),
    work_mode: getStr("work_mode"),
    license_certification: getStr("license_certification"),
    linkedin_url: getStr("linkedin_url"),
    summary: getStr("summary")
  };

  const { error } = await supabaseAdmin
    .from("candidate_cards")
    .upsert(payload, { onConflict: 'candidate_id' });

  const returnUrl = new URL(`/admin/candidates/${candidate_id}`, request.url);
  
  if (error) {
    returnUrl.searchParams.set("error", error.message);
  } else {
    returnUrl.searchParams.set("success", "true");
  }

  return NextResponse.redirect(returnUrl, 303);
}