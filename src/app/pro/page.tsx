"use client";

import React from 'react';
import Link from 'next/link'; // <-- This is the magic line that fixes the error
import WorthCalculator from "@/components/WorthCalculator";

export default function ProPortalPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', margin: 0, background: '#ffffff', overflowX: 'hidden', position: 'relative', minHeight: '100vh' }}>
      
      {/* THE INDIGO GLOW EFFECT */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', 
        maxWidth: '1200px',
        height: '600px',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* NAVIGATION - Updated for the Invisible Funnel */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px clamp(20px, 5vw, 80px)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em' }}>
          INSURE<span style={{ color: '#6366f1' }}>WORLD</span><span style={{ fontSize: '12px', verticalAlign: 'top', marginLeft: '4px', color: '#64748b' }}>PRO</span>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/join" style={{ color: '#64748b', fontWeight: 700, textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>
            Join
          </Link>
          <Link href="/lounge" style={{ color: '#64748b', fontWeight: 700, textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>
            The Lounge
          </Link>
          <button 
            onClick={() => window.location.href = '/login'} 
            style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT SPLIT */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: THE VISION */}
        <div style={{ paddingTop: '20px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', background: '#e0e7ff', color: '#4338ca', borderRadius: '999px', fontSize: '14px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confidential. Vetted. Professional.
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px', color: '#1e293b' }}>
            Your Career <br/>
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Command Center.
            </span>
          </h1>

          <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.6, marginBottom: '48px', maxWidth: '500px' }}>
            Stop guessing your market value. Join a private network designed for the engine of the Canadian insurance industry.
          </p>

          <div style={{ display: 'grid', gap: '32px' }}>
            {[
              { 
                emoji: '🛡️', 
                title: 'Total Confidentiality', 
                text: "Your career move is your business. Your confidentiality is ours. We're your silent partner, ensuring your activity is never visible to your current firm." 
              },
              { 
                emoji: '📈', 
                title: 'Worth Benchmarking', 
                text: 'Real-time 2026 data based on your specific licenses (RIBO, LLQP, OTL, Underwriter) and your geographic region.' 
              },
              { 
                emoji: '🥃', 
                title: 'Industry Alpha', 
                text: 'Access a vetted feed for the "inside track" on carrier capacity shifts, commission splits, and market movements.' 
              }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ fontSize: '24px', background: '#f8fafc', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  {item.emoji}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontWeight: 800, fontSize: '18px' }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: THE TOOL */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <WorthCalculator />
          
          <div style={{ textAlign: 'center', marginTop: '32px', padding: '24px', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', fontWeight: 600 }}>Just want to join the community?</p>
            <Link 
              href="/join" 
              style={{ color: '#6366f1', fontWeight: 800, textDecoration: 'none', fontSize: '16px', borderBottom: '2px solid #6366f1', paddingBottom: '2px' }}
            >
              Skip to Profile Creation →
            </Link>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: '100px', padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
        © 2026 Insure World. Connecting Excellence.
        <div style={{ marginTop: '8px' }}>
          <Link href="/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}