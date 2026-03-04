import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', margin: 0, background: '#ffffff', overflowX: 'hidden', position: 'relative' }}>
      
      {/* THE ADJUSTED INDIGO GLOW EFFECT */}
      {/* Moved down and tightened to frame the 2-line headline perfectly */}
      <div style={{
        position: 'absolute',
        top: '5%', // Moved down from -10% to center on the text
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', 
        maxWidth: '1000px',
        height: '500px', // Slightly shorter for a tighter focus
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.18) 0%, rgba(255, 255, 255, 0) 65%)', // Tighter gradient radius
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* NAVIGATION BAR */}
      <nav style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '32px 20px', 
        background: 'rgba(255,255,255,0.8)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid #f1f5f9' 
      }}>
        <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em' }}>
          INSURE<span style={{ color: '#6366f1' }}>WORLD</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 20px 40px', textAlign: 'center' }}>
        {/* WIDENED CONTAINER: Increased from 850px to 980px to prevent unwanted line breaks */}
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          
          <div style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            background: '#e0e7ff', 
            color: '#4338ca', 
            borderRadius: '999px', 
            fontSize: '16px', 
            fontWeight: 800, 
            marginBottom: '32px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            boxShadow: '0 4px 20px 0 rgba(99, 102, 241, 0.15)' 
          }}>
            Canadian Insurance Recruiting
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 8vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '24px', color: '#1e293b' }}>
            The Modern Engine for <br/>
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Insurance Recruiting.
            </span>
          </h1>
          <p style={{ fontSize: '22px', color: '#64748b', lineHeight: 1.6, marginBottom: '40px', maxWidth: '640px', margin: '0 auto' }}>
            Connecting top-tier insurance professionals with Canada's leading companies. Efficient, secure, and data-driven.
          </p>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 20px 80px' }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          
          {[
            { img: '/Talent.png', title: 'Vetted Talent', text: 'Every candidate is manually screened for RIBO and provincial licensing requirements before entering our system.' },
            { img: '/Intros.png', title: 'Instant Intros', text: 'Request introductions with a single click. Manage your hiring pipeline with our transparent Requested and Declined states.' },
            { img: '/portal.png', title: 'Client Portals', text: 'Secure, custom job tanks for companies to track their candidates and view unlocked resumes and LinkedIn profiles.' }
          ].map((feature, i) => (
            <div key={i} style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', padding: '40px 32px', borderRadius: '28px', border: '1px solid #c7d2fe', boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.2)', textAlign: 'center' }}>
              <img src={feature.img} alt={feature.title} style={{ width: '120px', height: '120px', marginBottom: '24px', objectFit: 'contain' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, textAlign: 'left' }}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ 
          width: '100%',
          maxWidth: '540px', 
          margin: '0 auto', 
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
          padding: 'clamp(24px, 5vw, 48px)', 
          borderRadius: '32px', 
          border: '1px solid #c7d2fe', 
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.2)',
          boxSizing: 'border-box' 
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', textAlign: 'center', color: '#0f172a', letterSpacing: '-0.02em' }}>Partner with Insure World</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '16px', marginBottom: '36px' }}>Enter your details to discuss your company's hiring needs.</p>
          
          <form action="/api/contact" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input name="name" type="text" required placeholder="Full Name" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '16px', boxSizing: 'border-box' }} />
            <input name="email" type="email" required placeholder="Business Email" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '16px', boxSizing: 'border-box' }} />
            <textarea name="message" placeholder="Hiring requirements..." style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '16px', minHeight: '140px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            
            <button type="submit" style={{ width: '100%', padding: '18px', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)', marginTop: '8px' }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        © 2026 Insure World. Built for Canadian Insurance Excellence.
      </footer>
    </div>
  );
}