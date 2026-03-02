"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

// --- DATA: AUDIT CHECKLIST ---
const HABITATIONAL_CHECKS = [
  { id: 'h1', task: "Confirm year of roof update", risk: "Older roofs may be restricted to ACV (Actual Cash Value) or excluded for wind/hail." },
  { id: 'h2', task: "Verify plumbing type (Copper, PEX, Galvanized, PolyB)", risk: "Non-standard plumbing can trigger massive deductibles or total water exclusion." },
  { id: 'h3', task: "Advise on Sump Pump / Sewer Back-up limits", risk: "Top source of P&C E&O claims. Ensure client understands the dollar-limit cap." },
  { id: 'h4', task: "Confirm any home-based business activities", risk: "Commercial activity without an endorsement can void the entire property contract." },
  { id: 'h5', task: "Verify existence of any wood-burning heat sources", risk: "Unreported secondary heat sources are a primary reason for fire claim denials." },
  { id: 'h6', task: "Discuss overland water vs. sewer back-up", risk: "Failure to distinguish between these coverages often leads to client litigation." },
];

export default function DutyOfCarePage() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";

  const toggle = (id: string) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const progress = Math.round((checked.length / HABITATIONAL_CHECKS.length) * 100);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* BACK BUTTON */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => router.push('/pro-tools')}
            style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              fontWeight: 800, 
              color: '#64748b', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = indigo}
            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
          >
            ← Back to Tools Hub
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>Duty of Care Checklist</h1>
          <p style={{ color: '#64748b' }}>A defensible audit trail for New Business Habitational risks.</p>
        </div>

        {/* PROGRESS BAR */}
        <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '999px', marginBottom: '40px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: indigo, transition: 'width 0.4s ease' }}></div>
        </div>

        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow, overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', color: '#94a3b8', letterSpacing: '0.5px' }}>Module: Habitational (Personal Lines)</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: indigo }}>{checked.length} / {HABITATIONAL_CHECKS.length} Secured</span>
          </div>

          <div style={{ padding: '20px' }}>
            {HABITATIONAL_CHECKS.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggle(item.id)}
                style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  marginBottom: '12px', 
                  border: '2px solid',
                  borderColor: checked.includes(item.id) ? indigo : '#f1f5f9',
                  background: checked.includes(item.id) ? '#f5f3ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ 
                    minWidth: '24px', height: '24px', borderRadius: '6px', border: '2px solid', 
                    borderColor: checked.includes(item.id) ? indigo : '#cbd5e1',
                    background: checked.includes(item.id) ? indigo : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '14px'
                  }}>
                    {checked.includes(item.id) && '✓'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', color: checked.includes(item.id) ? '#4338ca' : '#0f172a' }}>
                      {item.task}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                      <strong style={{ color: '#ef4444', textTransform: 'uppercase', fontSize: '10px' }}>E&O Risk:</strong> {item.risk}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <button 
              onClick={() => window.print()} 
              style={{ background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '14px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '15px' }}
            >
              Export to PDF for Client File
            </button>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
              Note: Printing this checklist creates a timestamped record of your professional due diligence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}