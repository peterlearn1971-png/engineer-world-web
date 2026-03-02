"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';

// --- DATA: 2026 BENCHMARKS (NATIONAL AVG) ---
const SALARY_DATA = [
  { role: "Personal Lines Broker", jr: 48000, mid: 62000, sr: 78000 },
  { role: "Commercial Lines Broker", jr: 55000, mid: 75000, sr: 95000 },
  { role: "Personal Lines Underwriter", jr: 52000, mid: 68000, sr: 85000 },
  { role: "Commercial Underwriter", jr: 62000, mid: 88000, sr: 115000 },
  { role: "Claims Adjuster", jr: 50000, mid: 72000, sr: 92000 },
  { role: "Account Executive (Sales)", jr: 70000, mid: 105000, sr: 165000 },
];

export default function SalaryGuidePage() {
  const [region, setRegion] = useState(1.0); 
  const indigo = "#6366f1";
  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';

  const format = (num: number) => 
    new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD', 
      maximumFractionDigits: 0 
    }).format(num * region);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Link href="/lounge" style={{ textDecoration: 'none', color: indigo, fontWeight: 800, fontSize: '15px' }}>
            ← Back to Lounge
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '12px', background: '#e0e7ff', color: indigo, padding: '6px 16px', borderRadius: '999px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
            2026 Market Intelligence
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: 900, marginTop: '20px', marginBottom: '16px' }}>Salary Guide</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Real-time compensation benchmarks for the Canadian Insurance Market.</p>
        </div>

        {/* --- REGIONAL SELECTOR --- */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: softBlueShadow }}>
          <span style={{ fontWeight: 800, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase' }}>Select Your Market Region</span>
          <select 
            onChange={(e) => setRegion(parseFloat(e.target.value))}
            style={{ width: '100%', maxWidth: '400px', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '16px', outline: 'none', cursor: 'pointer', appearance: 'none', background: '#f8fafc' }}
          >
            <option value="1.0">National Average (Standard)</option>
            <option value="1.15">Greater Toronto Area (+15%)</option>
            <option value="1.12">Vancouver / BC (+12%)</option>
            <option value="1.05">Calgary / Edmonton (+5%)</option>
            <option value="0.92">Atlantic Canada (-8%)</option>
          </select>
        </div>

        {/* --- MAIN SALARY TABLE --- */}
        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: softBlueShadow }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '24px', fontWeight: 900, color: '#64748b', fontSize: '13px' }}>ROLE</th>
                <th style={{ padding: '24px', fontWeight: 900, color: indigo, fontSize: '13px' }}>JUNIOR (0-2Y)</th>
                <th style={{ padding: '24px', fontWeight: 900, color: indigo, fontSize: '13px' }}>INTERMEDIATE (3-5Y)</th>
                <th style={{ padding: '24px', fontWeight: 900, color: indigo, fontSize: '13px' }}>SENIOR (6Y+)</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: i === SALARY_DATA.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '24px', fontWeight: 800, color: '#0f172a' }}>{row.role}</td>
                  <td style={{ padding: '24px', color: '#475569', fontWeight: 600 }}>{format(row.jr)}</td>
                  <td style={{ padding: '24px', color: '#475569', fontWeight: 600 }}>{format(row.mid)}</td>
                  <td style={{ padding: '24px', color: '#475569', fontWeight: 600 }}>{format(row.sr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- DESIGNATION DIVIDEND SECTION --- */}
        <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '40px', borderRadius: '32px', color: 'white', boxShadow: softBlueShadow }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Leveling Up: The Designation Dividend</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '32px', lineHeight: 1.6 }}>
                In the 2026 talent landscape, professional designations are the primary driver for "Out-of-Cycle" raises. Holding a recognized certification typically adds a premium to the base salaries listed above.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>CIP / CAIB</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>+5% to 8% Premium</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>CRM</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>+7% to 10% Premium</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>FCIP / CRM+</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>+12% to 15% Premium</div>
                </div>
            </div>
        </div>

        <p style={{ marginTop: '40px', textAlign: 'center', fontSize: '13px', color: '#94a3b8', lineHeight: 1.8 }}>
          * Salaries shown are estimated base pay only. Performance bonuses and commissions vary significantly by brokerage.<br/>
          Data source: 2026 Insurance World Market Intelligence Report.
        </p>

      </main>
    </div>
  );
}