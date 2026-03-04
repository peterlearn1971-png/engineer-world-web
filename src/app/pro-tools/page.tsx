"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

export default function ProToolsPage() {
  const router = useRouter();
  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';

  const tools = [
    { title: "Duty of Care Checklist", desc: "A defensible audit trail for new business and renewals.", path: "/pro-tools/duty-of-care" },
    { title: "Pro-Rata Calculator", desc: "Instantly calculate mid-term cancellation refunds.", path: "/pro-tools/cancellation-calc" },
    { title: "Co-Insurance Penalty Tool", desc: "Show clients the real cost of under-insurance.", path: "/pro-tools/coinsurance-calc" },
{ title: "Termination Timer", desc: "Calculate legal expiry dates based on Stat Conditions.", path: "/pro-tools/termination-timer" },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 900 }}>Pro-Tools Hub</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Essential utilities for the modern insurance professional.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {tools.map((tool, i) => (
            <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '12px' }}>{tool.title}</h3>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>{tool.desc}</p>
              </div>
              <button 
                onClick={() => router.push(tool.path)}
                style={{ width: '100%', background: '#6366f1', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Open Tool
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}