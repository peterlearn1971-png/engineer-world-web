"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

// 1. Static Data Definitions (Multipliers used as fallback)
const REGIONS = [
  { id: 'tier1', label: 'Major Hub (GTA, GVA, MTL)', multiplier: 1.15 },
  { id: 'tier2', label: 'Urban Hub (Ottawa, Calgary, KW)', multiplier: 1.05 },
  { id: 'tier3', label: 'Regional City / Suburb (London, Halifax, etc.)', multiplier: 1.0 },
  { id: 'tier4', label: 'Rural / Remote', multiplier: 0.92 }
];

const POSITIONS = [
  { id: 'csr', label: 'CSR / Account Technician', multiplier: 1.0 },
  { id: 'am', label: 'Account Manager', multiplier: 1.25 },
  { id: 'underwriter', label: 'Underwriter (Personal/Commercial)', multiplier: 1.30 },
  { id: 'producer', label: 'Producer / Sales', multiplier: 1.35 },
  { id: 'marketing', label: 'Marketing / Underwriting', multiplier: 1.15 },
  { id: 'mgmt', label: 'Management / Leadership', multiplier: 1.50 }
];

const LICENSES = [
  { id: 'ribo1', label: 'RIBO Level 1' },
  { id: 'ribo2', label: 'RIBO Level 2' },
  { id: 'otl', label: 'OTL' },
  { id: 'llqp', label: 'LLQP (Life License)' },
  { id: 'aic', label: 'AIC (Adjuster)' }
];

export default function WorthCalculator() {
  const [step, setStep] = useState(1);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    years: 2,
    position: 'csr',
    region: 'tier3',
    licenses: [] as string[]
  });

  // Load Real Salary Benchmarks from Supabase on page load
  useEffect(() => {
    const fetchSalaries = async () => {
      const { data } = await supabase.from('salary_benchmarks').select('*');
      if (data) setBenchmarks(data);
    };
    fetchSalaries();
  }, []);

  const calculateWorth = () => {
    const currentPosLabel = POSITIONS.find(p => p.id === formData.position)?.label || "";
    
    // 1. Try to find a real match in your new Supabase table
    const match = benchmarks.find(b => 
      b.position_title.toLowerCase().includes(currentPosLabel.toLowerCase()) &&
      formData.years >= b.years_exp_min &&
      formData.years <= b.years_exp_max
    );

    // 2. If we found a real match in the database, use it!
    if (match) {
      let licenseBonus = formData.licenses.length * 5000; 
      return {
        min: match.base_salary_low + licenseBonus,
        max: match.base_salary_high + licenseBonus,
        isVerified: true
      };
    }

    // 3. Fallback: Use original multiplier math
    const pos = POSITIONS.find(p => p.id === formData.position) || POSITIONS[0];
    const reg = REGIONS.find(r => r.id === formData.region) || REGIONS[2];
    
    let base = 54000; 
    let multiplier = (1 + (formData.years * 0.045)) * pos.multiplier * reg.multiplier;
    let licenseBonus = formData.licenses.length * 4800;
    
    const total = (base * multiplier) + licenseBonus;
    return { 
      min: Math.floor(total * 0.94 / 1000) * 1000, 
      max: Math.ceil(total * 1.06 / 1000) * 1000,
      isVerified: false
    };
  };

  const handleClaimProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const posLabel = POSITIONS.find(p => p.id === formData.position)?.label;
    const regLabel = REGIONS.find(r => r.id === formData.region)?.label;

    const { error } = await supabase
      .from('candidates')
      .insert([{
        full_name: formData.name,
        email: formData.email,
        experience_years: formData.years,
        licenses: formData.licenses,
        notes: `Position: ${posLabel} | Region: ${regLabel}`,
        status: 'pending_verification',
        source: 'PRO_CALCULATOR' 
      }]);

    if (!error) {
      localStorage.setItem('insure_world_user', formData.name);
      setStep(3);
    }
  };

  const worth = calculateWorth();

  return (
    <div style={{ maxWidth: '550px', margin: '0 auto', padding: '40px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', fontFamily: 'sans-serif' }}>
      
      {step === 1 && (
        <>
          <h2 style={{ fontWeight: 900, fontSize: '32px', marginBottom: '8px', letterSpacing: '-0.04em' }}>Know Your Worth</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Professional benchmark for the 2026 market.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Position</label>
              <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
                {POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Region</label>
              <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
                {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
             <label style={{ fontWeight: 800, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Years Experience</label>
             <span style={{ fontWeight: 900, fontSize: '16px', color: '#6366f1' }}>{formData.years} Years</span>
          </div>
          <input type="range" min="0" max="25" value={formData.years} onChange={(e) => setFormData({...formData, years: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#6366f1', marginBottom: '32px' }} />
          
          <label style={{ display: 'block', fontWeight: 800, fontSize: '11px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Active Licenses</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
            {LICENSES.map(l => (
              <button key={l.id} type="button" onClick={() => setFormData({...formData, licenses: formData.licenses.includes(l.id) ? formData.licenses.filter(x => x !== l.id) : [...formData.licenses, l.id]})}
                style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid', borderColor: formData.licenses.includes(l.id) ? '#6366f1' : '#e2e8f0', background: formData.licenses.includes(l.id) ? '#f5f3ff' : 'white', color: formData.licenses.includes(l.id) ? '#6366f1' : '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{ width: '100%', background: '#6366f1', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>Calculate Market Value</button>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleClaimProfile}>
          <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '12px' }}>Calculation Ready!</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Where should we send your confidential 2026 market report?</p>
          
          <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', outline: 'none' }} />
          <input required type="email" placeholder="Professional Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', outline: 'none' }} />
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-start' }}>
            <input required type="checkbox" id="consent" style={{ marginTop: '4px', cursor: 'pointer' }} />
            <label htmlFor="consent" style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', cursor: 'pointer' }}>
              I agree to create a **confidential** profile as per the <a href="/privacy" target="_blank" style={{ color: '#6366f1', textDecoration: 'underline' }}>Privacy Policy</a> to access the Lounge.
            </label>
          </div>

          <button type="submit" style={{ width: '100%', background: '#0f172a', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
            Create Profile & Get My Report
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>
            🔒 **100% Confidential.** We never alert your current employer.
          </p>
        </form>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          {/* Dynamic Trust Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', background: worth.isVerified ? '#dcfce7' : '#f1f5f9', marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: worth.isVerified ? '#166534' : '#64748b', textTransform: 'uppercase' }}>
              {worth.isVerified ? '✓ 2026 Market Verified' : 'Standard Industry Estimate'}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>
            Range for {POSITIONS.find(p => p.id === formData.position)?.label} in {REGIONS.find(r => r.id === formData.region)?.label}
          </div>
          <div style={{ fontSize: '42px', fontWeight: 900, color: '#6366f1', marginBottom: '32px' }}>
            ${worth.min.toLocaleString()} - ${worth.max.toLocaleString()}
          </div>
          
          <div style={{ position: 'relative', height: '40px', background: '#f1f5f9', borderRadius: '20px', marginBottom: '48px' }}>
            <div style={{ position: 'absolute', left: '20%', right: '20%', height: '100%', background: '#e0e7ff', borderRadius: '20px', border: '2px solid #6366f1' }} />
            <div style={{ position: 'absolute', left: '58%', transform: 'translateX(-50%)', top: '-10px', bottom: '-10px', width: '4px', background: '#0f172a', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 900 }}>YOU ARE HERE</div>
            </div>
            <div style={{ position: 'absolute', bottom: '-22px', left: '0', fontSize: '10px', fontWeight: 700, color: '#cbd5e1' }}>$45k</div>
            <div style={{ position: 'absolute', bottom: '-22px', right: '0', fontSize: '10px', fontWeight: 700, color: '#cbd5e1' }}>$165k+</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>Welcome, {formData.name.split(' ')[0]}!</p>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              Your profile is now active. Ready to see the latest Industry Alpha in the Lounge?
            </p>
            <button onClick={() => window.location.href = '/lounge'} style={{ width: '100%', background: '#6366f1', color: 'white', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
              Enter the Insurance Lounge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}