"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";
import TopNav from '@/components/TopNav';

// Dropdowns to prevent typing errors
const YEARS = Array.from({ length: 41 }, (_, i) => i);
const MODES = ["Full Time", "Hybrid", "Remote", "Contract"];
const AVAIL = ["Immediately", "1 Week Notice", "2 Weeks Notice", "4 Weeks Notice", "Currently Employed"];

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [formData, setFormData] = useState({
    candidate_id: '',
    full_name: '',
    email: '',
    phone: '',
    city: '',
    stealth_mode: false,
    excluded_companies: '',
    target_roles: '', 
    target_companies: '',
    // Portfolio Data
    current_role: '',
    current_company: '',
    years_experience: 0,
    location_blurb: '',
    languages: '',
    skills: '',
    salary_expectation: '',
    availability: '2 Weeks Notice',
    work_mode: 'Full Time',
    license_certification: '',
    linkedin_url: '',
    summary: '',
    resume_url: ''
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      let candidateData = null;

      // 1. Try to find candidate by Auth ID
      const { data: authCand } = await supabase.from('candidates').select('*, candidate_cards(*)').eq('auth_user_id', user.id).maybeSingle();

      if (authCand) {
        candidateData = authCand;
      } else if (user.email) {
        // 2. Try to find candidate by Email (Now allowed by SQL RLS policy)
        const { data: emailCand } = await supabase.from('candidates').select('*, candidate_cards(*)').eq('email', user.email).maybeSingle();
        
        if (emailCand) {
          candidateData = emailCand;
          // Claim the record
          await supabase.from('candidates').update({ auth_user_id: user.id }).eq('id', emailCand.id);
        }
      }

      if (candidateData) {
        const card = candidateData.candidate_cards?.[0] || {};
        setFormData({
          candidate_id: candidateData.id,
          full_name: candidateData.full_name || '',
          email: candidateData.email || user.email || '',
          phone: candidateData.phone || '',
          city: candidateData.city || '',
          stealth_mode: candidateData.stealth_mode || false,
          excluded_companies: candidateData.excluded_companies || '',
          target_roles: Array.isArray(candidateData.target_roles) ? candidateData.target_roles.join(', ') : '',
          target_companies: Array.isArray(candidateData.target_companies) ? candidateData.target_companies.join(', ') : '',
          current_role: card.target_role || '',
          current_company: card.current_company || '',
          years_experience: card.years_experience || 0,
          location_blurb: card.location_blurb || '',
          languages: Array.isArray(card.languages) ? card.languages.join(', ') : '',
          skills: Array.isArray(card.skills) ? card.skills.join(', ') : '',
          salary_expectation: card.salary_expectation || '',
          availability: card.availability || '2 Weeks Notice',
          work_mode: card.work_mode || 'Full Time',
          license_certification: card.license_certification || '',
          linkedin_url: card.linkedin_url || '',
          summary: card.summary || '',
          resume_url: candidateData.resume_url || ''
        });
      } else {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('Locking in Data...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Authentication lost. Please log in again.");

      let internalId = formData.candidate_id;
      let uploadedResumeUrl = formData.resume_url;

      if (resumeFile) {
        const fileName = `${userId}-${Date.now()}.${resumeFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('candidate-resumes').upload(fileName, resumeFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('candidate-resumes').getPublicUrl(fileName);
          uploadedResumeUrl = publicUrl;
          try {
            await fetch('/api/candidates/resumes/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
              body: JSON.stringify({
                storage_bucket: 'candidate-resumes', storage_path: fileName, original_name: resumeFile.name,
                mime_type: resumeFile.type, size_bytes: resumeFile.size
              })
            });
          } catch (e) { console.warn("Resume API logic skipped", e); }
        }
      }

      // Ensure Identity Record Exists
      if (!internalId) {
        const { data: newCand, error: newCandErr } = await supabase.from('candidates').insert({
          auth_user_id: userId, email: formData.email || session.user.email, full_name: formData.full_name,
          phone: formData.phone, city: formData.city, stealth_mode: formData.stealth_mode, resume_url: uploadedResumeUrl
        }).select('id').single();

        if (newCandErr) throw new Error(`Creation Failed: ${newCandErr.message}`);
        internalId = newCand.id;
        setFormData(prev => ({ ...prev, candidate_id: internalId })); 
      } else {
        const { error: err1 } = await supabase.from('candidates').update({
          phone: formData.phone, city: formData.city, stealth_mode: formData.stealth_mode,
          excluded_companies: formData.excluded_companies,
          target_roles: formData.target_roles.split(',').map(s => s.trim()).filter(Boolean),
          target_companies: formData.target_companies.split(',').map(s => s.trim()).filter(Boolean),
          resume_url: uploadedResumeUrl
        }).eq('id', internalId);
        
        if (err1) throw new Error(`Candidates Update Failed: ${err1.message}`);
      }

      // Upsert Portfolio Card
      const cardPayload = {
        candidate_id: internalId, target_role: formData.current_role, current_company: formData.current_company,
        years_experience: formData.years_experience, location_blurb: formData.location_blurb,
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        salary_expectation: formData.salary_expectation, availability: formData.availability,
        work_mode: formData.work_mode, license_certification: formData.license_certification,
        linkedin_url: formData.linkedin_url, summary: formData.summary
      };

      const { data: existingCard } = await supabase.from('candidate_cards').select('id').eq('candidate_id', internalId).maybeSingle();

      if (existingCard) {
        const { error: err2 } = await supabase.from('candidate_cards').update(cardPayload).eq('candidate_id', internalId);
        if (err2) throw new Error(`Card Update Failed: ${err2.message}`);
      } else {
        const { error: err3 } = await supabase.from('candidate_cards').insert(cardPayload);
        if (err3) throw new Error(`Card Insert Failed: ${err3.message}`);
      }

      setSaveMessage("Profile Saved Successfully ✓");
    } catch (err: any) {
      setSaveMessage(`Save Failed: ${err.message || 'Unknown Error'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Syncing Career Portal...</div>;

  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, marginBottom: '8px' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white' };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a', fontFamily: 'sans-serif' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', paddingBottom: '100px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '40px' }}>My Career Profile</h1>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Identity */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={labelStyle}>Full Name</label><input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email</label><input value={formData.email} disabled style={{ ...inputStyle, background: '#f1f5f9' }} /></div>
              <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label style={labelStyle}>City</label><input style={inputStyle} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            </section>

            {/* Portfolio */}
            <section>
              <h3 style={{ fontSize: '14px', color: '#6366f1', marginBottom: '20px', fontWeight: 800 }}>PROFESSIONAL PORTFOLIO</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={labelStyle}>Current Role</label><input style={inputStyle} value={formData.current_role} onChange={e => setFormData({...formData, current_role: e.target.value})} /></div>
                <div><label style={labelStyle}>Current Company</label><input style={inputStyle} value={formData.current_company} onChange={e => setFormData({...formData, current_company: e.target.value})} /></div>
                
                {/* RE-ADDED FIELDS */}
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Skills (Comma Separated)</label><input style={inputStyle} value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. Project Management, B2B Sales, Salesforce" /></div>
                <div><label style={labelStyle}>Languages</label><input style={inputStyle} value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} placeholder="e.g. English, French" /></div>
                <div><label style={labelStyle}>Licenses & Certifications</label><input style={inputStyle} value={formData.license_certification} onChange={e => setFormData({...formData, license_certification: e.target.value})} placeholder="e.g. PMP, Series 7" /></div>
                <div><label style={labelStyle}>Target Location / Region</label><input style={inputStyle} value={formData.location_blurb} onChange={e => setFormData({...formData, location_blurb: e.target.value})} placeholder="e.g. Toronto, ON" /></div>
                
                <div>
                  <label style={labelStyle}>Experience</label>
                  <select style={inputStyle} value={formData.years_experience} onChange={e => setFormData({...formData, years_experience: parseInt(e.target.value)})}>
                    {YEARS.map(y => <option key={y} value={y}>{y} Years</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Salary Expectation</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}>$</span>
                    <input style={{ ...inputStyle, paddingLeft: '24px' }} placeholder="e.g. 95,000" value={formData.salary_expectation} onChange={e => setFormData({...formData, salary_expectation: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Work Mode</label>
                  <select style={inputStyle} value={formData.work_mode} onChange={e => setFormData({...formData, work_mode: e.target.value})}>
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <select style={inputStyle} value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                    {AVAIL.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input style={{ ...inputStyle, marginBottom: '20px' }} value={formData.linkedin_url} onChange={e => setFormData({...formData, linkedin_url: e.target.value})} />
              <label style={labelStyle}>Professional Summary</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'none' }} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
            </section>

            {/* Stealth Compass */}
            <section style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.stealth_mode ? '20px' : '0' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Stealth Job Match</h3>
                <input 
                  type="checkbox" 
                  checked={formData.stealth_mode} 
                  onChange={e => setFormData({...formData, stealth_mode: e.target.checked})} 
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#6366f1' }} 
                />
              </div>

              {formData.stealth_mode && (
                <div style={{ display: 'grid', gap: '20px', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={{ ...labelStyle, color: '#64748b' }}>Target Roles</label><input placeholder="e.g. Senior Underwriter" style={{ ...inputStyle, background: '#1e293b', color: 'white', border: 'none' }} value={formData.target_roles} onChange={e => setFormData({...formData, target_roles: e.target.value})} /></div>
                    <div>
                      <label style={{ ...labelStyle, color: '#64748b' }}>Target Salary</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>$</span>
                        <input style={{ ...inputStyle, background: '#1e293b', color: 'white', border: 'none', paddingLeft: '24px' }} value={formData.salary_expectation} onChange={e => setFormData({...formData, salary_expectation: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div><label style={{ ...labelStyle, color: '#64748b' }}>Target Organizations</label><input placeholder="Enter desired companies" style={{ ...inputStyle, background: '#1e293b', color: 'white', border: 'none' }} value={formData.target_companies} onChange={e => setFormData({...formData, target_companies: e.target.value})} /></div>
                  <div><label style={{ ...labelStyle, color: '#64748b' }}>Confidential Avoid List</label><input placeholder="Employers to avoid" style={{ ...inputStyle, background: '#1e293b', color: 'white', border: 'none' }} value={formData.excluded_companies} onChange={e => setFormData({...formData, excluded_companies: e.target.value})} /></div>
                </div>
              )}
            </section>

            <div style={{ marginTop: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
              <label style={{ fontWeight: 800, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Resume Update</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} style={{ fontSize: '13px' }} />
              {formData.resume_url && <div style={{ marginTop: '10px' }}><a href={formData.resume_url} target="_blank" style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>View Active Resume ✓</a></div>}
            </div>

            <button disabled={isSaving} type="submit" style={{ padding: '20px', background: '#6366f1', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}>
              {isSaving ? 'Locking in Data...' : 'Update Career Profile'}
            </button>
            {saveMessage && <div style={{ textAlign: 'center', fontWeight: 700, color: saveMessage.includes('Failed') ? '#ef4444' : '#10b981' }}>{saveMessage}</div>}
          </form>
        </div>
      </main>
    </div>
  );
}