// src/lib/uiIds.ts
export function shortId(id: string | null | undefined, chars = 8) {
  const v = String(id || "").trim();
  if (!v) return "—";
  if (v.length <= chars) return v;
  return `${v.slice(0, chars)}…`;
}
