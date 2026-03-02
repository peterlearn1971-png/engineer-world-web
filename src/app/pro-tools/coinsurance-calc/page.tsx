"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

export default function CoInsuranceCalcPage() {
  const router = useRouter();
  
  // Inputs
  const [buildingValue, setBuildingValue] = useState<number>(1000000);
  const [coInsurancePercent, setCoInsurancePercent] = useState<number>(80);
  const [insuranceCarried, setInsuranceCarried] = useState<number>(500000);
  const [lossAmount, setLossAmount] = useState<number>(100000);

  // Results
  const [results, setResults] = useState({
    requiredAmount: 0,
    paymentAmount: 0,
    penaltyAmount: 0,
    isPenalty: false
  });

  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";

  useEffect(() => {
    const required = buildingValue * (coInsurancePercent / 100);
    let payment = 0;

    if (insuranceCarried >= required) {
      payment = Math.min(lossAmount, insuranceCarried);
    } else {
      payment = (insuranceCarried / required) * lossAmount;
    }

    setResults({
      requiredAmount: required,
      paymentAmount: payment,
      penaltyAmount: lossAmount - payment,
      isPenalty: insuranceCarried < required
    });
  }, [buildingValue, coInsurancePercent, insuranceCarried, lossAmount]);

  const format = (num: number) => 
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(num);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
        
        {/* BACK BUTTON */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => router.push('/pro-tools')}
            style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          >
            ← Back to Tools Hub
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>Co-Insurance Penalty Tool</h1>
          <p style={{ color: '#64748b' }}>Calculate the impact of under-insuring commercial property.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* INPUTS */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Replacement Value of Building</label>
              <input type="number" value={buildingValue} onChange={(e) => setBuildingValue(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700 }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Co-Insurance Clause (%)</label>
              <select value={coInsurancePercent} onChange={(e) => setCoInsurancePercent(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                <option value={80}>80% Clause</option>
                <option value={90}>90% Clause</option>
                <option value={100}>100% Clause</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Amount of Insurance Carried</label>
              <input type="number" value={insuranceCarried} onChange={(e) => setInsuranceCarried(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700, color: results.isPenalty ? '#ef4444' : '#10b981' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Amount of Loss (The Claim)</label>
              <input type="number" value={lossAmount} onChange={(e) => setLossAmount(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700 }} />
            </div>
          </div>

          {/* DYNAMIC OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Required Insurance to avoid penalty</div>
               <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>{format(results.requiredAmount)}</div>
            </div>

            <div style={{ background: results.isPenalty ? '#fef2f2' : '#f0fdf4', padding: '32px', borderRadius: '24px', border: '1px solid', borderColor: results.isPenalty ? '#fecaca' : '#bbf7d0', boxShadow: softBlueShadow }}>
               <div style={{ fontSize: '12px', fontWeight: 800, color: results.isPenalty ? '#ef4444' : '#10b981', textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Claim Payment</div>
               <div style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a' }}>{format(results.paymentAmount)}</div>
               
               {results.isPenalty && (
                 <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', borderRadius: '12px', color: '#991b1b', fontSize: '13px', fontWeight: 700 }}>
                   ⚠️ Penalty Applied: The client is responsible for {format(results.penaltyAmount)} of this loss.
                 </div>
               )}
            </div>

            <div style={{ padding: '0 12px', fontSize: '14px', lineHeight: 1.6, color: '#64748b' }}>
               This tool uses the <strong>"Did/Should"</strong> rule: (Carried ÷ Required) × Loss = Payment. This is the primary reason why accurate Building Valuations are critical.
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}