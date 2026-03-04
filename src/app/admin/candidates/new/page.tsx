import Link from "next/link";

export default async function AdminCandidateNewPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <div style={{ marginBottom: 14 }}>
        <Link href="/admin/candidates">← Back to candidates</Link>
      </div>

      <h1 style={{ margin: 0 }}>New Candidate</h1>
      <p style={{ marginTop: 6, color: "#555" }}>
        Step 1: Create the base candidate record. Next we’ll add the card + resume upload.
      </p>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 14,
          maxWidth: 720,
        }}
      >
        <form action="/api/admin/candidates/create" method="post">
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Full name</div>
              <input
                name="full_name"
                placeholder="Test Person"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>City</div>
              <input
                name="city"
                placeholder="Toronto"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Region</div>
              <input
                name="region"
                placeholder="On"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Email (optional)</div>
              <input
                name="email"
                placeholder="name@email.com"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Phone (optional)</div>
              <input
                name="phone"
                placeholder="555-555-5555"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <button
              type="submit"
              style={{
                marginTop: 6,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #111",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Create candidate
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}