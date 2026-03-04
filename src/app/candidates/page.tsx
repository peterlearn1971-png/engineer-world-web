"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CandidateCard = {
  headline: string | null;
  summary: string | null;
  skills: string[] | null;
  target_roles: string[] | null;
  location_blurb: string | null;
  availability: string | null;
  visibility: Record<string, boolean> | null;
};

type PrivateProfile = {
  notes: string | null;
  career_goals: string | null;
  constraints: string | null;
};

export default function CandidatesPage() {
  const router = useRouter();

  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [card, setCard] = useState<CandidateCard | null>(null);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);

  const visibility = useMemo(() => {
    return (
      card?.visibility || {
        headline: true,
        summary: true,
        skills: true,
        location: true,
        availability: true,
      }
    );
  }, [card]);

  async function loadCandidateData(uid: string) {
    const { data: cardData, error: cardErr } = await supabase
      .from("candidate_cards")
      .select("*")
      .eq("candidate_id", uid)
      .maybeSingle();

    if (cardErr) throw new Error(cardErr.message);
    setCard((cardData as any) ?? null);

    const { data: privateData, error: privErr } = await supabase
      .from("candidate_private_profiles")
      .select("*")
      .eq("candidate_id", uid)
      .maybeSingle();

    if (privErr) throw new Error(privErr.message);
    setPrivateProfile((privateData as any) ?? null);
  }

  useEffect(() => {
    let alive = true;

    async function boot() {
      try {
        setMessage("");

        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);

        const u = data.session?.user ?? null;

        if (!alive) return;

        if (!u) {
          setUserId(null);
          setUserEmail(null);
          setCard(null);
          setPrivateProfile(null);
          setBooted(true);
          router.replace("/candidates/login");
          return;
        }

        setUserId(u.id);
        setUserEmail(u.email ?? null);

        await loadCandidateData(u.id);

        if (!alive) return;
        setBooted(true);
      } catch (e: any) {
        if (!alive) return;

        setMessage(e?.message || "Unable to load candidate portal.");
        setUserId(null);
        setUserEmail(null);
        setCard(null);
        setPrivateProfile(null);
        setBooted(true);

        router.replace("/candidates/login");
      }
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!alive) return;

      try {
        setMessage("");

        const u = session?.user ?? null;

        if (!u) {
          setUserId(null);
          setUserEmail(null);
          setCard(null);
          setPrivateProfile(null);
          router.replace("/candidates/login");
          return;
        }

        setUserId(u.id);
        setUserEmail(u.email ?? null);
        await loadCandidateData(u.id);
      } catch (e: any) {
        setMessage(e?.message || "Unable to refresh session.");
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setMessage("");
    setBusy(true);

    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);

    setUserId(null);
    setUserEmail(null);
    setCard(null);
    setPrivateProfile(null);

    setBusy(false);
    router.replace("/candidates/login");
  }

  async function savePublic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    setMessage("");
    setBusy(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      candidate_id: userId,
      headline: form.get("headline")?.toString() || null,
      summary: form.get("summary")?.toString() || null,
      location_blurb: form.get("location_blurb")?.toString() || null,
      availability: form.get("availability")?.toString() || null,
      skills: (form.get("skills")?.toString() || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      target_roles: (form.get("roles")?.toString() || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      visibility: {
        headline: form.get("vis_headline") === "on",
        summary: form.get("vis_summary") === "on",
        skills: form.get("vis_skills") === "on",
        location: form.get("vis_location") === "on",
        availability: form.get("vis_availability") === "on",
      },
    };

    const { error } = await supabase.from("candidate_cards").upsert(payload, { onConflict: "candidate_id" });

    if (error) setMessage(error.message);
    else setMessage("Saved.");

    setBusy(false);
  }

  async function savePrivate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    setMessage("");
    setBusy(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      candidate_id: userId,
      notes: form.get("notes")?.toString() || null,
      career_goals: form.get("career_goals")?.toString() || null,
      constraints: form.get("constraints")?.toString() || null,
      last_conversation_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("candidate_private_profiles")
      .upsert(payload, { onConflict: "candidate_id" });

    if (error) setMessage(error.message);
    else setMessage("Saved.");

    setBusy(false);
  }

  if (!booted) {
    return (
      <div className="p-6 max-w-md space-y-3">
        <div>Loading…</div>
        {message ? <div className="border p-2 rounded text-sm">{message}</div> : null}
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-6 max-w-md space-y-3">
        <div>Redirecting…</div>
        {message ? <div className="border p-2 rounded text-sm">{message}</div> : null}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Your candidate profile</h1>
        <div className="flex items-center gap-3">
          {userEmail ? <div className="text-xs text-gray-600">{userEmail}</div> : null}
          <button type="button" onClick={handleLogout} disabled={busy} className="border px-3 py-2 rounded text-sm">
            Log out
          </button>
        </div>
      </div>

      {message ? <div className="border p-2 rounded text-sm">{message}</div> : null}

      <div className="border rounded p-4 space-y-4">
        <div className="font-semibold">Public card (what companies can see)</div>

        <form onSubmit={savePublic} className="space-y-4">
          <div>
            <label className="text-sm">Headline</label>
            <input name="headline" defaultValue={card?.headline ?? ""} className="border w-full p-2 rounded" />
            <label className="text-sm block mt-1">
              <input type="checkbox" name="vis_headline" defaultChecked={visibility.headline} /> visible to companies
            </label>
          </div>

          <div>
            <label className="text-sm">Summary</label>
            <textarea name="summary" defaultValue={card?.summary ?? ""} className="border w-full p-2 rounded" rows={3} />
            <label className="text-sm block mt-1">
              <input type="checkbox" name="vis_summary" defaultChecked={visibility.summary} /> visible to companies
            </label>
          </div>

          <div>
            <label className="text-sm">Roles (comma separated)</label>
            <input name="roles" defaultValue={(card?.target_roles || []).join(", ")} className="border w-full p-2 rounded" />
          </div>

          <div>
            <label className="text-sm">Skills (comma separated)</label>
            <textarea name="skills" defaultValue={(card?.skills || []).join(", ")} className="border w-full p-2 rounded" rows={3} />
            <label className="text-sm block mt-1">
              <input type="checkbox" name="vis_skills" defaultChecked={visibility.skills} /> visible to companies
            </label>
          </div>

          <div>
            <label className="text-sm">Location blurb</label>
            <input name="location_blurb" defaultValue={card?.location_blurb ?? ""} className="border w-full p-2 rounded" />
            <label className="text-sm block mt-1">
              <input type="checkbox" name="vis_location" defaultChecked={visibility.location} /> visible to companies
            </label>
          </div>

          <div>
            <label className="text-sm">Availability</label>
            <input name="availability" defaultValue={card?.availability ?? ""} className="border w-full p-2 rounded" />
            <label className="text-sm block mt-1">
              <input type="checkbox" name="vis_availability" defaultChecked={visibility.availability} /> visible to companies
            </label>
          </div>

          <button type="submit" disabled={busy} className="bg-black text-white px-4 py-2 rounded">
            Save public card
          </button>
        </form>
      </div>

      <div className="border rounded p-4 space-y-4">
        <div className="font-semibold">Private notes (only you and the InsureWorld team)</div>

        <form onSubmit={savePrivate} className="space-y-4">
          <div>
            <label className="text-sm">Conversation notes</label>
            <textarea name="notes" defaultValue={privateProfile?.notes ?? ""} className="border w-full p-2 rounded" rows={4} />
          </div>

          <div>
            <label className="text-sm">Career goals</label>
            <textarea name="career_goals" defaultValue={privateProfile?.career_goals ?? ""} className="border w-full p-2 rounded" rows={3} />
          </div>

          <div>
            <label className="text-sm">Constraints / deal breakers</label>
            <textarea name="constraints" defaultValue={privateProfile?.constraints ?? ""} className="border w-full p-2 rounded" rows={3} />
          </div>

          <button type="submit" disabled={busy} className="bg-black text-white px-4 py-2 rounded">
            Save private notes
          </button>
        </form>
      </div>
    </div>
  );
}
