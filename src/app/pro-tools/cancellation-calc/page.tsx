"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

export default function CancellationCalcPage() {
  const router = useRouter();
  const [premium, setPremium] = useState<number>(1000);
  const [startDate, setStartDate] = useState<string>('');
  const [cancelDate, setCancelDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [results, setResults] = useState({
    totalDays: 0,
    daysUsed: 0,
    daysRemaining: 0,
    proRataRefund: 0,
    shortRateRefund: 0,
  });

  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";

  useEffect(() => {
    if (startDate && cancelDate && endDate) {
      const start = new Date(startDate);
      const cancel = new Date(cancelDate);
      const end = new Date(endDate);

      const totalTime = end.getTime() - start.getTime();
      const usedTime = cancel.getTime() - start.getTime();

      const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
      const daysUsed = Math.ceil(usedTime / (1000 * 60 * 60 * 24));
      const daysRemaining = totalDays - daysUsed;

      if (daysUsed > 0 && totalDays > 0) {
        const proRata = (daysRemaining / totalDays) * premium;
        // Standard Short-Rate estimate (90% of Pro-Rata)
        const shortRate = proRata * 0.9;

        setResults({
          totalDays,
          daysUsed,
          daysRemaining,
          proRataRefund: Math.max(0, proRata),
          shortRateRefund: Math.max(0, shortRate),
        });
      }
    }
  }, [premium, startDate, cancelDate, endDate]);

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(num);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        
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

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>Cancellation Calculator</h1>
          <p style={{ color: '#64748b' }}>Calculate mid-term unearned premium and cancellation penalties.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* INPUT SECTION */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Total Annual Premium</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', fontWeight: 700, color: '#94a3b8' }}>$</span>
                <input 
                  type="number" 
                  value={premium} 
                  onChange={(e) => setPremium(parseFloat(e.target.value))}
                  style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Policy Effective Date</label>
              <input type="date" onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#334155' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Cancellation Date</label>
              <input type="date" onChange={(e) => setCancelDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#334155' }} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Policy Expiry Date</label>
              <input type="date" onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#334155' }} />
            </div>
          </div>

          {/* RESULTS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: indigo, color: 'white', padding: '32px', borderRadius: '24px', boxShadow: softBlueShadow }}>
              <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px' }}>Pro-Rata Refund</div>
              <div style={{ fontSize: '32px', fontWeight: 900 }}>{formatCurrency(results.proRataRefund)}</div>
              <div style={{ fontSize: '13px', marginTop: '12px', opacity: 0.9 }}>
                Based on <strong>{results.daysRemaining}</strong> days remaining of {results.totalDays}.
              </div>
            </div>

            <div style={{ background: '#0f172a', color: 'white', padding: '32px', borderRadius: '24px', boxShadow: softBlueShadow }}>
              <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px' }}>Short-Rate Refund (Est.)</div>
              <div style={{ fontSize: '32px', fontWeight: 900 }}>{formatCurrency(results.shortRateRefund)}</div>
              <div style={{ fontSize: '13px', marginTop: '12px', opacity: 0.9 }}>
                Includes typical 10% cancellation penalty.
              </div>
            </div>

            <div style={{ padding: '8px 12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Days Used:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{results.daysUsed}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Daily Rate:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency(premium / (results.totalDays || 365))}</span>
               </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '40px', padding: '24px', background: '#fefce8', borderRadius: '16px', border: '1px solid #fef08a', fontSize: '13px', color: '#854d0e', lineHeight: 1.6 }}>
            <strong>Disclaimer:</strong> Short-rate tables vary by insurer. This calculation uses a standard 90% factor of the pro-rata amount. Always verify the final figures with the carrier's portal before committing to a client.
        </div>
      </main>
    </div>
  );
}