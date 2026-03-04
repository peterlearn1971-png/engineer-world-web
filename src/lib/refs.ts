// src/lib/refs.ts
// Display-only short refs for UUIDs / tokens.
// No schema changes. No DB changes. No infra changes.

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62Encode(n: bigint) {
  if (n === 0n) return "0";
  let out = "";
  while (n > 0n) {
    const r = Number(n % 62n);
    out = BASE62[r] + out;
    n = n / 62n;
  }
  return out;
}

function base62Decode(s: string) {
  let n = 0n;
  for (const ch of s) {
    const i = BASE62.indexOf(ch);
    if (i === -1) throw new Error("Invalid base62 char");
    n = n * 62n + BigInt(i);
  }
  return n;
}

function uuidToHex(uuid: string) {
  return String(uuid || "").replace(/-/g, "").toLowerCase();
}

function hexToUuid(hex32: string) {
  const h = String(hex32 || "").toLowerCase().padStart(32, "0").slice(-32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Human-readable refs for UI (your preferred style)
 * Examples:
 *   humanRef("JOB", uuid) -> "JOB-BDD367F9"
 *   humanRef("CAN", uuid) -> "CAN-91F4A2C1"
 *
 * Uses the LAST 8 hex chars of the UUID (stable + looks like your example).
 * If it's not a UUID, it falls back gracefully.
 */
export function humanRef(prefix: string, id: string, takeLast = 8) {
  const p = String(prefix || "").trim().toUpperCase();
  const raw = String(id || "").trim();

  if (!raw) return p ? `${p}-—` : "—";

  const hex = uuidToHex(raw);
  if (/^[0-9a-f]{32}$/.test(hex)) {
    const tail = hex.slice(-takeLast).toUpperCase();
    return p ? `${p}-${tail}` : tail;
  }

  // Non-UUID fallback (tokens etc.)
  const clean = raw.replace(/[^a-zA-Z0-9]/g, "");
  const tail = (clean.length >= takeLast ? clean.slice(-takeLast) : clean).toUpperCase();
  return p ? `${p}-${tail}` : tail;
}

/**
 * Base62 version (already in your file)
 * Example:
 *   shortUuidRef(uuid, "JOB") -> "JOB_g9Qk..."
 * This is nice for compact URLs, but less “read out loud” than humanRef().
 */
export function shortUuidRef(uuid: string, prefix = "") {
  const hex = uuidToHex(uuid);
  if (!/^[0-9a-f]{32}$/.test(hex)) return prefix ? `${prefix}_${String(uuid || "").slice(0, 8)}` : String(uuid || "").slice(0, 8);
  const n = BigInt("0x" + hex);
  const b62 = base62Encode(n);
  return prefix ? `${prefix}_${b62}` : b62;
}

// If you ever want to decode a base62 UUID ref back to a UUID (not required for display-only)
export function uuidFromShortRef(ref: string) {
  const cleaned = ref.includes("_") ? ref.split("_").slice(1).join("_") : ref;
  const n = base62Decode(cleaned);
  const hex = n.toString(16).padStart(32, "0");
  return hexToUuid(hex);
}

export function shortToken(token: string) {
  const t = String(token || "").trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

export function shortUuid(uuid: string) {
  return String(uuid || "").slice(0, 8);
}

/**
 * Compact display of any long id:
 * "bdd367f9…18e6"
 */
export function compactId(id: string, head = 8, tail = 4) {
  const v = String(id || "").trim();
  if (!v) return "—";
  if (v.length <= head + tail + 1) return v;
  return `${v.slice(0, head)}…${v.slice(-tail)}`;
}
