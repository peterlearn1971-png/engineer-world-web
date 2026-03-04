"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- NEW: Added Link import
import { supabase } from "@/lib/supabaseClient";

export default function JoinPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State to hold the file before upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Create the Auth Account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError || !authData.user) {
      alert(`Account Error: ${authError?.message}`);
      setIsSubmitting(false);
      return; 
    }

    let resumeUrl = null;

    // 2. Upload the Resume to your Bucket
    if (resumeFile) {
      // Create a unique name: UserID + Random Number + Extension
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${authData.user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-resumes')
        .upload(filePath, resumeFile);

      if (!uploadError) {
        // Get the link to the file so we can save it to the database
        const { data: publicUrl } = supabase.storage
          .from('candidate-resumes')
          .getPublicUrl(filePath);
        resumeUrl = publicUrl.publicUrl;
      } else {
        console.error("Upload error details:", uploadError.message);
      }
    }

    // 3. Save the Profile (including the Resume Link) to the Database
    const { error: dbError } = await supabase
      .from('candidates')
      .insert([{
        id: authData.user.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        city: formData.city,
        resume_url: resumeUrl, // This links the file to the candidate!
        source: 'PRO'
      }]);

    setIsSubmitting(false);

    if (!dbError) {
      localStorage.setItem('insure_world_user', formData.name);
      setSuccess(true);
      setTimeout(() => { router.push('/lounge'); }, 2000);
    } else {
      alert(`Database Error: ${dbError.message}`);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#ffffff', width: '100%', maxWidth: '540px', padding: '48px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {!success ? (
          <>
            {/* --- ESCAPE HATCH ADDED HERE --- */}
            <Link href="/pro" style={{ display: 'inline-block', marginBottom: '24px', color: '#6366f1', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
  ← Back to Pro
</Link>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>Join the Network.</h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>Create your secure professional profile.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Pro Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Password *</label>
                <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength={6} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>

              {/* RESUME UPLOAD SECTION */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Upload Resume (Optional)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={e => setResumeFile(e.target.files?.[0] || null)} 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: '#f8fafc', fontSize: '13px' }} 
                />
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>Supported: PDF, DOCX (Max 5MB)</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>City *</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" style={{ width: '100%', padding: '20px', background: '#0f172a', color: 'white', borderRadius: '16px', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer' }}>
                {isSubmitting ? 'Syncing Profile...' : 'Create Profile & Enter Lounge'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🥂</div>
            <h2 style={{ fontSize: '28px', fontWeight: 900 }}>Welcome!</h2>
            <p style={{ color: '#64748b' }}>Profile secure. Redirecting you to the Lounge...</p>
          </div>
        )}
      </div>
    </div>
  );
}