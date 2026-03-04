"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MarketIntel() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [intelFeed, setIntelFeed] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [role, setRole] = useState("CSR");
  const [exp, setExp] = useState("0-2 Years");
  const [region, setRegion] = useState("GTA");
  const [salary, setSalary] = useState("");
  const [bonus, setBonus] = useState("No Bonus");
  const [setup, setSetup] = useState("Fully Remote");
  const [vacation, setVacation] = useState("2 Weeks");
  const [vibe, setVibe] = useState("Passive (Open to offers)");

  useEffect(() => {
    fetchIntel();
  }, []);

  async function fetchIntel() {
    const { data, error } = await supabase
      .from('market_intel')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setIntelFeed(data);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format the salary to look pretty (e.g. 65000 -> $65,000)
    const formattedSalary = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(salary));

    const newIntel = {
      role: role,
      experience: exp,
      region: region,
      salary: formattedSalary,
      bonus: bonus,
      work_setup: setup,
      vacation: vacation,
      vibe: vibe
    };

    const { error } = await supabase.from('market_intel').insert([newIntel]);

    if (!error) {
      await fetchIntel(); // Refresh the feed with the new entry
      setHasSubmitted(true);
    } else {
      alert("Error submitting intel. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  const indigo = "#6366f1";
  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', maxWidth: '800px', margin: '0 auto' }}>
      
      {!hasSubmitted ? (
        /* --- 1. THE SUBMISSION FORM (GATED STATE) --- */
        <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* Sleek SVG Lock Icon replacing the emoji */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={indigo} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', display: 'block' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            
            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>Unlock Market Intel</h2>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto' }}>
              Trade your current stats to see real, anonymous compensation packages from other Ontario brokers. 
            </p>
            
            {/* TRUST MICROCOPY */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 20px', borderRadius: '12px', marginTop: '24px', fontSize: '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              100% Anonymous. Your identity and employer are never shared.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Row 1: The Persona */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Current Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>CSR</option>
                        <option>Account Manager</option>
                        <option>Producer / Sales</option>
                        <option>Marketer / Underwriter</option>
                        <option>Management</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Experience</label>
                    <select value={exp} onChange={(e) => setExp(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>0-2 Years</option>
                        <option>3-5 Years</option>
                        <option>6-10 Years</option>
                        <option>10+ Years</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Region</label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>GTA</option>
                        <option>Southwestern ON</option>
                        <option>Eastern ON</option>
                        <option>Northern ON</option>
                    </select>
                </div>
            </div>

            {/* Row 2: The Money */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Base Salary</label>
                    <input type="number" placeholder="e.g. 65000" required value={salary} onChange={(e) => setSalary(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Bonus Structure</label>
                    <select value={bonus} onChange={(e) => setBonus(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>No Bonus</option>
                        <option>Flat Annual Bonus</option>
                        <option>Profit Sharing / Contingent</option>
                        <option>% of Book / Commission</option>
                    </select>
                </div>
            </div>

            {/* Row 3: The Lifestyle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Work Setup</label>
                    <select value={setup} onChange={(e) => setSetup(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>Fully Remote</option>
                        <option>Hybrid (1-2 Days Office)</option>
                        <option>Hybrid (3-4 Days Office)</option>
                        <option>Fully In-Office</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Vacation Time</label>
                    <select value={vacation} onChange={(e) => setVacation(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#f8fafc', color: '#0f172a' }}>
                        <option>2 Weeks</option>
                        <option>3 Weeks</option>
                        <option>4 Weeks</option>
                        <option>5+ Weeks</option>
                        <option>Unlimited</option>
                    </select>
                </div>
            </div>

            {/* Row 4: The Vibe Check (Slick 3-Way Toggle) */}
            <div>
                 <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', color: '#64748b' }}>Current Status</label>
                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    
                    <label style={{ flex: 1, minWidth: '150px', padding: '14px', border: '1px solid', borderColor: vibe === "Active (Interviewing)" ? indigo : '#cbd5e1', borderRadius: '12px', background: vibe === "Active (Interviewing)" ? '#e0e7ff' : '#f8fafc', cursor: 'pointer', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: vibe === "Active (Interviewing)" ? indigo : '#475569', transition: 'all 0.2s' }}>
                        <input type="radio" name="vibe" value="Active (Interviewing)" checked={vibe === "Active (Interviewing)"} onChange={(e) => setVibe(e.target.value)} style={{ display: 'none' }} /> Active (Interviewing)
                    </label>

                    <label style={{ flex: 1, minWidth: '150px', padding: '14px', border: '1px solid', borderColor: vibe === "Passive (Open to offers)" ? indigo : '#cbd5e1', borderRadius: '12px', background: vibe === "Passive (Open to offers)" ? '#e0e7ff' : '#f8fafc', cursor: 'pointer', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: vibe === "Passive (Open to offers)" ? indigo : '#475569', transition: 'all 0.2s' }}>
                        <input type="radio" name="vibe" value="Passive (Open to offers)" checked={vibe === "Passive (Open to offers)"} onChange={(e) => setVibe(e.target.value)} style={{ display: 'none' }} /> Passive (Open to offers)
                    </label>

                    <label style={{ flex: 1, minWidth: '150px', padding: '14px', border: '1px solid', borderColor: vibe === "Locked In (Staying put)" ? indigo : '#cbd5e1', borderRadius: '12px', background: vibe === "Locked In (Staying put)" ? '#e0e7ff' : '#f8fafc', cursor: 'pointer', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: vibe === "Locked In (Staying put)" ? indigo : '#475569', transition: 'all 0.2s' }}>
                        <input type="radio" name="vibe" value="Locked In (Staying put)" checked={vibe === "Locked In (Staying put)"} onChange={(e) => setVibe(e.target.value)} style={{ display: 'none' }} /> Locked In (Staying put)
                    </label>

                 </div>
            </div>

            <button type="submit" disabled={isSubmitting} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '18px', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '12px', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Submitting...' : 'Submit & Unlock Feed'}
            </button>
          </form>
        </div>

      ) : (

        /* --- 2. THE LIVE FEED (UNLOCKED STATE) --- */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Live Market Intel</h2>
             <span style={{ background: '#e0e7ff', color: indigo, padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Unlocked</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {intelFeed.length > 0 ? intelFeed.map((intel, idx) => (
              <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                
                {/* Header: Role & Demographics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px', color: '#0f172a' }}>{intel.role}</h3>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                            {intel.region} &nbsp;•&nbsp; {intel.experience}
                        </p>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

                {/* Body: Compensation & Lifestyle - Clean Typography */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '20px' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Compensation</span>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a' }}>{intel.salary}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>+ {intel.bonus}</div>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Lifestyle Setup</span>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>{intel.work_setup}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{intel.vacation} Time Off</div>
                    </div>
                </div>

                {/* Footer: Status Indicator */}
                <div style={{ 
                    background: intel.vibe === 'Active (Interviewing)' ? '#fef2f2' : (intel.vibe === 'Passive (Open to offers)' ? '#f0fdfa' : '#f8fafc'), 
                    color: intel.vibe === 'Active (Interviewing)' ? '#ef4444' : (intel.vibe === 'Passive (Open to offers)' ? '#0d9488' : '#64748b'),
                    padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, display: 'inline-block' 
                }}>
                    Status: {intel.vibe}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                Loading market data...
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}