// src/app/admin/companies/new/page.tsx

import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminCompanyNewPage() {
  const page: React.CSSProperties = {
    padding: 28,
    maxWidth: 820,
    margin: "0 auto",
    fontFamily: "system-ui, Arial",
  };

  const card: React.CSSProperties = {
    marginTop: 16,
    border: "1px solid #e8e8e8",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const label: React.CSSProperties = { fontSize: 12, color: "#666", marginBottom: 6 };

  const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  };

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 90,
  };

  const btnPrimary: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "black",
    color: "white",
    cursor: "pointer",
  };

  const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    background: "white",
    color: "#111",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <main style={page}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/companies" style={{ textDecoration: "none" }}>
          ← Back to companies
        </Link>
      </div>

      <h1 style={{ margin: 0 }}>New company</h1>
      <div style={{ marginTop: 6, color: "#666" }}>
        Create the client record. You can edit these details later.
      </div>

      <div style={card}>
        <form action="/api/admin/companies/create" method="post" style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={label}>Company name</div>
            <input name="name" placeholder="Test Insurance Co" style={input} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Contact name</div>
              <input name="contact_name" placeholder="Test Person" style={input} />
            </div>
            <div>
              <div style={label}>Contact email</div>
              <input name="contact_email" placeholder="name@company.com" style={input} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Contact phone</div>
              <input name="contact_phone" placeholder="+1 514 ..." style={input} />
            </div>
            <div>
              <div style={label}>Country</div>
              <input name="country" placeholder="Canada" style={input} />
            </div>
          </div>

          <div>
            <div style={label}>Address line 1</div>
            <input name="address_line1" placeholder="123 Main St" style={input} />
          </div>

          <div>
            <div style={label}>Address line 2</div>
            <input name="address_line2" placeholder="Suite 400" style={input} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>City</div>
              <input name="city" placeholder="Montreal" style={input} />
            </div>
            <div>
              <div style={label}>Region</div>
              <input name="region" placeholder="QC" style={input} />
            </div>
            <div>
              <div style={label}>Postal code</div>
              <input name="postal_code" placeholder="H2X ..." style={input} />
            </div>
          </div>

          <div>
            <div style={label}>Notes (internal)</div>
            <textarea name="notes" placeholder="Anything you want your team to see." style={textarea} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            <button type="submit" style={btnPrimary}>
              Create company
            </button>
            <Link href="/admin/companies" style={btn}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
