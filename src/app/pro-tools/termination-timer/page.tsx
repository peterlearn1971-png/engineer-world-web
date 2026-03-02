"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

export default function TerminationTimerPage() {
  const router = useRouter();
  
  const [mailDate, setMailDate] = useState<string>('');
  const [method, setMethod] = useState<'registered' | 'hand'>('registered');
  const [finalDate, setFinalDate] = useState<string | null>(null);

  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";

  useEffect(() => {
    if (mailDate) {
      const date = new Date(mailDate);
      const daysToAdd = method === 'registered' ? 15 : 5;
      
      // Statutory condition: Notice period starts the day AFTER delivery/mailing
      date.setDate(date.getDate() + daysToAdd);
      setFinalDate(date.toLocaleDateString('en-CA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
  }, [mailDate, method]);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        
        <button 
          onClick={() => router.push('/pro-tools')}
          style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, color: '#64748b', cursor: 'pointer', marginBottom: '32px' }}
        >
          ← Back to Tools Hub
        </button>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>Termination Timer</h1>
          <p style={{ color: '#64748b' }}>Calculate legal expiry dates based on Statutory Conditions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* INPUTS */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Delivery Method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setMethod('registered')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 800, border: '2px solid', borderColor: method === 'registered' ? indigo : '#f1f5f9', background: method === 'registered' ? '#f5f3ff' : 'white', cursor: 'pointer' }}
                >
                  Registered Mail
                </button>
                <button 
                  onClick={() => setMethod('hand')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 800, border: '2px solid', borderColor: method === 'hand' ? indigo : '#f1f5f9', background: method === 'hand' ? '#f5f3ff' : 'white', cursor: 'pointer' }}
                >
                  Personally Delivered
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                {method === 'registered' ? 'Date of Mailing' : 'Date of Delivery'}
              </label>
              <input 
                type="date" 
                onChange={(e) => setMailDate(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700 }} 
              />
            </div>
          </div>

          {/* DYNAMIC OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {finalDate ? (
              <div style={{ background: '#0f172a', color: 'white', padding: '40px', borderRadius: '32px', textAlign: 'center', boxShadow: softBlueShadow }}>
                <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', marginBottom: '16px' }}>Legal Policy Termination Date</div>
                <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.2 }}>{finalDate}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '8px', color: '#f87171' }}>at 12:01 AM Local Time</div>
                
                <div style={{ marginTop: '24px', fontSize: '13px', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  This incorporates the <strong>{method === 'registered' ? '15-day' : '5-day'}</strong> statutory notice period.
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '40px' }}>
                Enter the mailing or delivery date to see the legal termination timeline.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '24px', background: '#fefce8', borderRadius: '16px', border: '1px solid #fef08a', fontSize: '13px', color: '#854d0e', lineHeight: 1.6 }}>
            <strong>Legal Note:</strong> Statutory Condition 11 requires that the notice period begins the day *after* mailing/delivery. This tool automatically accounts for that day-zero exclusion.
        </div>
      </main>
    </div>
  );
}