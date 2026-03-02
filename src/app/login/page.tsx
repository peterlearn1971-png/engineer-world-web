"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indigo = "#6366f1";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid login credentials. Please try again.");
      setLoading(false);
    } else {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('full_name')
        .eq('email', email)
        .single();

      if (candidate) {
        localStorage.setItem('insure_world_user', candidate.full_name);
      }
      router.push('/lounge');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      
      {/* HEADER AREA: Logo & Escape Hatch */}
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <Link href="/pro" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = indigo} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
          ← Back to Pro
        </Link>
        <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
          INSURE<span style={{ color: indigo }}>WORLD</span>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div style={{ background: 'white', padding: '48px 40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', width: '100%', maxWidth: '440px', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>👋</div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.03em' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Enter your credentials to access the Lounge.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none' }} 
              onFocus={e => e.target.style.borderColor = indigo}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none' }} 
              onFocus={e => e.target.style.borderColor = indigo}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            {/* Sleek Text Toggle instead of Emoji */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ position: 'absolute', right: '16px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 800, color: indigo, textTransform: 'uppercase' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '18px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '8px', opacity: loading ? 0.7 : 1, transition: 'background 0.2s' }}
            onMouseOver={e => { if(!loading) e.currentTarget.style.background = '#1e293b' }}
            onMouseOut={e => { if(!loading) e.currentTarget.style.background = '#0f172a' }}
          >
            {loading ? 'Entering Lounge...' : 'Sign In'}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
          Don't have a secure profile yet? <Link href="/join" style={{ color: indigo, textDecoration: 'none', fontWeight: 800 }}>Join the Network</Link>
        </div>

      </div>
    </div>
  );
}