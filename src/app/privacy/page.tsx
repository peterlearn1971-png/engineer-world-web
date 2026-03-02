"use client";

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '80px auto', padding: '40px', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#334155' }}>
      <h1 style={{ fontWeight: 900, fontSize: '36px', color: '#0f172a', marginBottom: '24px' }}>Privacy Policy</h1>
      <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>Last Updated: February 2026</p>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#0f172a' }}>1. Our Confidentiality Guarantee</h2>
        <p>
          At Insure World, we understand that for insurance professionals, discretion is paramount. We collect your data (including license status like RIBO, OTL, or LLQP) specifically to provide you with market insights and career opportunities. <strong>We will never contact your current employer or disclose your search status without your explicit permission.</strong>
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#0f172a' }}>2. Information We Collect</h2>
        <ul>
          <li><strong>Identity Data:</strong> Name and contact information.</li>
          <li><strong>Professional Data:</strong> Years of experience, current position, and geographic region.</li>
          <li><strong>Licensing Data:</strong> Current active licenses (RIBO, LLQP, etc.) used to verify your professional status for the Insurance Lounge.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#0f172a' }}>3. How We Use Your Data</h2>
        <p>
          Your data is used to:
        </p>
        <ul>
          <li>Calculate your estimated market value based on current 2026 industry benchmarks.</li>
          <li>Verify your identity for access to the "Insurance Lounge" community.</li>
          <li>Alert you to "Ideal Position" matches that fit your specific career goals.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontWeight: 800, fontSize: '20px', color: '#6366f1' }}>4. Data Security</h2>
        <p>
          Your information is stored securely using industry-standard encryption. We use Supabase for database management, ensuring your professional profile remains private and protected.
        </p>
      </section>

      <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
        <button 
          onClick={() => window.history.back()}
          style={{ background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Back to Calculator
        </button>
      </div>
    </div>
  );
}