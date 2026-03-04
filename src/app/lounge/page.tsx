"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TopNav from '@/components/TopNav';
import MarketIntel from '@/components/MarketIntel'; // <-- Importing the new component

// --- CONSTANTS & HELPERS ---
const YEARS = Array.from({ length: 41 }, (_, i) => i);
const MODES = ["Full Time", "Hybrid", "Remote", "Contract"];
const AVAIL = ["Immediately", "1 Week Notice", "2 Weeks Notice", "4 Weeks Notice", "Currently Employed"];

function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHrs = Math.round(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  const diffDays = Math.round(diffHrs / 24);
  return `${diffDays} days ago`;
}

export default function LoungePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('General Discussion');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New state for toggling between the regular feed and the Market Intel
  const [activeTab, setActiveTab] = useState<'feed' | 'intel'>('feed');

  const [isStealthModalOpen, setIsStealthModalOpen] = useState(false);
  const [isSavingStealth, setIsSavingStealth] = useState(false);
  
  const [stealthData, setStealthData] = useState({
    candidate_id: '',
    targetRole: '', 
    salary: '', 
    target: '', 
    exclude: '',
    targetLocation: '',
    years_experience: 0,
    work_mode: 'Full Time',
    availability: '2 Weeks Notice'
  });

  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/join');

      let candidateData = null;

      const { data: authCand } = await supabase.from('candidates').select('*, candidate_cards(*)').eq('auth_user_id', session.user.id).maybeSingle();
      
      if (authCand) {
        candidateData = authCand;
      } else if (session.user.email) {
        const { data: emailCand } = await supabase.from('candidates').select('*, candidate_cards(*)').eq('email', session.user.email).maybeSingle();
        if (emailCand) {
          candidateData = emailCand;
          await supabase.from('candidates').update({ auth_user_id: session.user.id }).eq('id', emailCand.id);
        }
      }

      if (candidateData) {
        setUserName(candidateData.full_name?.split(' ')[0] || "Pro");
        const card = candidateData.candidate_cards?.[0] || {};
        
        setStealthData({
          candidate_id: candidateData.id,
          targetRole: Array.isArray(candidateData.target_roles) ? candidateData.target_roles.join(', ') : (card.target_role || ''),
          target: Array.isArray(candidateData.target_companies) ? candidateData.target_companies.join(', ') : '',
          exclude: candidateData.excluded_companies || '',
          salary: card.salary_expectation || '',
          targetLocation: card.location_blurb || '',
          years_experience: card.years_experience || 0,
          work_mode: card.work_mode || 'Full Time',
          availability: card.availability || '2 Weeks Notice'
        });
      }
      setIsLoading(false);
    };

    checkUser();
    fetchPosts();
    fetchLiveNews();
  }, [router]);

  async function fetchLiveNews() {
    setIsRefreshingNews(true);
    try {
      const cacheBuster = new Date().getTime(); 
      const rssUrl = `https://news.google.com/rss/search?q=insurance+industry+canada&hl=en-CA&gl=CA&ceid=CA:en&_cb=${cacheBuster}`;
      
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(apiUrl, { cache: 'no-store' }); 
      const data = await res.json();
      
      if (data.status === 'ok') {
        const formattedNews = data.items.slice(0, 4).map((item: any) => ({
          ...item,
          author: item.source || 'Industry News' 
        }));
        setNewsItems(formattedNews);
      }
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      setTimeout(() => setIsRefreshingNews(false), 800);
    }
  }

  async function fetchPosts() {
    const { data } = await supabase.from('lounge_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data.map(p => ({ id: p.id, author: "Verified Pro", time: timeAgo(p.created_at), tag: p.category, content: p.content })));
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase.from('lounge_posts').insert([{ candidate_id: session.user.id, category: postCategory, title: "Lounge Post", content: newPostContent }]);
      setNewPostContent('');
      fetchPosts();
    }
    setIsSubmitting(false);
  };

  const handleSaveStealth = async () => {
    setIsSavingStealth(true);
    try {
      if (!stealthData.candidate_id) throw new Error("Could not verify candidate record.");

      const { error: candError } = await supabase.from('candidates').update({ 
        stealth_mode: true, 
        target_roles: stealthData.targetRole.split(',').map(i => i.trim()).filter(Boolean), 
        target_companies: stealthData.target.split(',').map(i => i.trim()).filter(Boolean), 
        excluded_companies: stealthData.exclude, 
        status: 'Stealth Active' 
      }).eq('id', stealthData.candidate_id);

      if (candError) throw candError;

      const cardPayload = {
        candidate_id: stealthData.candidate_id,
        salary_expectation: stealthData.salary,
        location_blurb: stealthData.targetLocation,
        years_experience: stealthData.years_experience,
        work_mode: stealthData.work_mode,
        availability: stealthData.availability
      };

      const { data: existingCard } = await supabase.from('candidate_cards').select('id').eq('candidate_id', stealthData.candidate_id).maybeSingle();

      if (existingCard) {
        const { error: cardErr } = await supabase.from('candidate_cards').update(cardPayload).eq('candidate_id', stealthData.candidate_id);
        if (cardErr) throw cardErr;
      } else {
        const { error: cardErr } = await supabase.from('candidate_cards').insert(cardPayload);
        if (cardErr) throw cardErr;
      }

      setIsStealthModalOpen(false); 
      alert("Stealth Compass Set! Your preferences are now active."); 
    } catch (err: any) {
      alert(`Error saving compass: ${err.message}`);
    } finally {
      setIsSavingStealth(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Syncing with Lounge...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      
      <div style={{ textAlign: 'center', padding: '60px 20px 20px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px', color: '#0f172a' }}>The Lounge</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Welcome back, {userName}. Connect, prep, and stay sharp.</p>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px', display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '32px', alignItems: 'start' }}>
        
        {/* --- LEFT SIDEBAR: CAREER & TOOLKIT --- */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Your Profile */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
             <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>Your Profile</h2>
             <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Manage your network presence.</p>
             <button onClick={() => router.push('/profile')} style={{ width: '100%', textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, color: '#334155', transition: 'all 0.2s' }}>
               Edit Career Stats
             </button>
          </div>

          {/* Section 2: The Academy */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
             <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: indigo, marginBottom: '16px', letterSpacing: '0.5px' }}>The Academy</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <button 
                 onClick={() => router.push('/ribo-prep-level-1')} 
                 style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: '8px 0', cursor: 'pointer', fontWeight: 800, color: '#334155', fontSize: '14px', transition: 'color 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.color = indigo}
                 onMouseOut={e => e.currentTarget.style.color = '#334155'}
               >
                 RIBO Level 1: Acting
               </button>
               <button 
                 onClick={() => router.push('/ribo-prep-level-2')} 
                 style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: '8px 0', cursor: 'pointer', fontWeight: 800, color: '#334155', fontSize: '14px', transition: 'color 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.color = indigo}
                 onMouseOut={e => e.currentTarget.style.color = '#334155'}
               >
                 RIBO Level 2: Unrestricted
               </button>
               <button 
                 onClick={() => router.push('/llqp-prep')} 
                 style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: '8px 0', cursor: 'pointer', fontWeight: 800, color: '#334155', fontSize: '14px', transition: 'color 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.color = '#059669'}
                 onMouseOut={e => e.currentTarget.style.color = '#334155'}
               >
                 LLQP Practice Tests
               </button>
             </div>
          </div>

          {/* Section 3: Pro Toolkit */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
             <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: indigo, marginBottom: '16px', letterSpacing: '0.5px' }}>Pro Toolkit</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <button 
                 onClick={() => router.push('/salary-guide')} 
                 style={{ textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, color: '#334155', fontSize: '13px', transition: 'border-color 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.borderColor = indigo}
                 onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
               >
                 2026 Salary Guide
               </button>
               <button 
                 onClick={() => router.push('/pro-tools')} 
                 style={{ textAlign: 'left', background: indigo, color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', border: 'none', transition: 'background 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.background = '#4f46e5'}
                 onMouseOut={e => e.currentTarget.style.background = indigo}
               >
                 Open All Pro-Tools
               </button>
             </div>
          </div>
        </aside>

        {/* --- CENTER FEED --- */}
        <div>
          
          {/* TAB SWITCHER */}
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '6px', borderRadius: '16px', marginBottom: '24px' }}>
             <button 
                onClick={() => setActiveTab('feed')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'feed' ? 'white' : 'transparent', color: activeTab === 'feed' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'feed' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none' }}
             >
                💬 Community Feed
             </button>
             <button 
                onClick={() => setActiveTab('intel')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'intel' ? 'white' : 'transparent', color: activeTab === 'intel' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'intel' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
             >
                🔒 Market Intel Share
             </button>
          </div>

          {/* TAB 1: COMMUNITY FEED */}
          {activeTab === 'feed' && (
            <>
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', background: '#ffffff', padding: '12px 20px', borderRadius: '999px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
                <span style={{ fontSize: '16px', marginRight: '12px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search posts or topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', background: 'transparent' }}
                />
              </div>

              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: softBlueShadow }}>
                <form onSubmit={handlePostSubmit}>
                  <textarea 
                    placeholder="Share carrier updates, ask questions, or discuss market capacity..." 
                    value={newPostContent} 
                    onChange={(e) => setNewPostContent(e.target.value)} 
                    style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '80px', fontSize: '16px', fontFamily: 'inherit' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                      <option value="General Discussion">General Discussion</option>
                      <option value="Carrier Intel">Carrier Intel</option>
                      <option value="Exam Help">Exam Help</option>
                      <option value="Comp & Worth">Comp & Worth</option>
                    </select>
                    <button type="submit" disabled={isSubmitting} style={{ background: indigo, color: 'white', padding: '10px 24px', borderRadius: '999px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                      {isSubmitting ? 'Posting...' : 'Post to Lounge'}
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                  <div key={post.id} style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{post.author}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{post.time}</div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: indigo, background: '#e0e7ff', padding: '4px 12px', borderRadius: '999px' }}>{post.tag}</div>
                    </div>
                    <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6 }}>{post.content}</p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px' }}>
                    No posts found matching "{searchQuery}".
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: MARKET INTEL SHARE */}
          {activeTab === 'intel' && (
             <MarketIntel />
          )}

        </div>

        {/* --- RIGHT SIDEBAR: STEALTH & PULSE --- */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#0f172a', color: 'white', padding: '24px', borderRadius: '24px', boxShadow: softBlueShadow }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '12px' }}>Stealth Job Match</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Update your core status and confidential targets instantly.</p>
            <button onClick={() => setIsStealthModalOpen(true)} style={{ width: '100%', background: indigo, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Manage Stealth</button>
          </div>

          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Market Pulse</span>
                <span style={{ fontSize: '10px', background: '#e0e7ff', color: indigo, padding: '4px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>Live</span>
              </h3>
              <button onClick={fetchLiveNews} disabled={isRefreshingNews} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: isRefreshingNews ? 0.5 : 1 }} title="Refresh News">
                🔄
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {newsItems.length > 0 ? newsItems.map((news, idx) => (
                <a key={idx} href={news.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', borderBottom: idx !== newsItems.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: idx !== newsItems.length - 1 ? '16px' : '0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4', marginBottom: '6px' }}>
                    {news.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(news.pubDate).toLocaleDateString()} • {news.author}
                  </div>
                </a>
              )) : (
                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Fetching latest headlines...</div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* --- STEALTH MODAL --- */}
      {isStealthModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0f172a', width: '100%', maxWidth: '600px', borderRadius: '32px', padding: '40px', color: 'white', border: '1px solid #1e293b', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Stealth Job Match</h2>
              <span style={{ fontSize: "11px", background: indigo, color: "white", padding: "6px 12px", borderRadius: "8px", fontWeight: 900, textTransform: "uppercase" }}>🟢 Active</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Update your core stats and confidential targets instantly.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</label>
                  <select value={stealthData.years_experience} onChange={e => setStealthData({...stealthData, years_experience: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }}>
                    {YEARS.map(y => <option key={y} value={y}>{y} Years</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Work Mode</label>
                  <select value={stealthData.work_mode} onChange={e => setStealthData({...stealthData, work_mode: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }}>
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Availability</label>
                  <select value={stealthData.availability} onChange={e => setStealthData({...stealthData, availability: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }}>
                    {AVAIL.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Target Roles</label>
                  <input placeholder="e.g. Senior Underwriter" value={stealthData.targetRole} onChange={e => setStealthData({...stealthData, targetRole: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Target Salary</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '14px', color: '#64748b', fontWeight: 800 }}>$</span>
                    <input placeholder="e.g. 95,000" value={stealthData.salary} onChange={e => setStealthData({...stealthData, salary: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 28px', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }} />
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Target Locations</label>
                <input placeholder="e.g. Toronto, Hybrid" value={stealthData.targetLocation} onChange={e => setStealthData({...stealthData, targetLocation: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Target Organizations</label>
                <input placeholder="Enter desired companies" value={stealthData.target} onChange={e => setStealthData({...stealthData, target: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Confidential Avoid List</label>
                <input placeholder="Employers to avoid" value={stealthData.exclude} onChange={e => setStealthData({...stealthData, exclude: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', fontSize: '14px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={handleSaveStealth} disabled={isSavingStealth} style={{ flex: 1, background: indigo, color: 'white', padding: '16px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                  {isSavingStealth ? 'Locking in...' : 'Update Compass'}
                </button>
                <button onClick={() => setIsStealthModalOpen(false)} style={{ padding: '16px 24px', background: 'transparent', color: '#94a3b8', borderRadius: '12px', fontWeight: 800, border: '1px solid #334155', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}