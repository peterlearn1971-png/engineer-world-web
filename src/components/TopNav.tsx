"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const indigo = "#6366f1";

  // Securely end the session and boot them to the login screen
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); 
  };

  const linkStyle = (active: boolean) => ({
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    color: active ? indigo : '#64748b',
    borderBottom: active ? `2px solid ${indigo}` : 'none',
    paddingBottom: '4px',
    transition: 'color 0.2s ease'
  });

  return (
    <nav style={{ 
      background: 'rgba(255, 255, 255, 0.85)', // Slightly transparent
      backdropFilter: 'blur(12px)', // The "Frosted Glass" blur effect
      padding: '20px 40px', 
      borderBottom: '1px solid #e2e8f0', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      {/* LEFT SIDE: Logo & Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link href="/lounge" style={{ textDecoration: 'none', color: '#0f172a' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            INSURE<span style={{ color: indigo }}>WORLD</span> <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px', textTransform: 'uppercase' }}>Pro</span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '32px', marginTop: '4px' }}>
          <Link href="/lounge" style={linkStyle(pathname === '/lounge')}>Lounge</Link>
          <Link href="/profile" style={linkStyle(pathname === '/profile')}>My Profile</Link>
        </div>
      </div>

      {/* RIGHT SIDE: Log Out */}
      <button 
        onClick={handleSignOut}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: '#94a3b8', 
          fontWeight: 800, 
          fontSize: '13px', 
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'color 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.color = '#ef4444'} // Turns red on hover
        onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
      >
        Sign Out
      </button>
    </nav>
  );
}