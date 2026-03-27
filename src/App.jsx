import { useState, useEffect } from 'react'
import JobTracker from './JobTracker.jsx'
import ProfileIngestor from './ProfileIngestor.jsx'

export default function App() {
  const [view, setView]         = useState('tracker')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const navItems = [
    { id: 'tracker', label: 'Job Board' },
    { id: 'profile', label: 'My Profile' },
  ]

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { background: #f4f6f9; font-family: 'Inter', sans-serif; color: #1a2b4a; overflow-x: hidden; }
        input, textarea, select, button { font-family: 'Inter', sans-serif; }
        input::placeholder, textarea::placeholder { color: #a0aec0; }
        input:focus, textarea:focus, select:focus { outline: none !important; border-color: #1a2b4a !important; box-shadow: 0 0 0 3px rgba(26,43,74,0.08) !important; }
        button { cursor: pointer; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#1a2b4a', boxShadow: '0 2px 16px rgba(26,43,74,0.2)',
        height: 56,
      }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, maxWidth: 1400, margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1.2" fill="#1a2b4a"/>
                <rect x="8" y="1" width="5" height="5" rx="1.2" fill="#1a2b4a"/>
                <rect x="1" y="8" width="5" height="5" rx="1.2" fill="#1a2b4a"/>
                <rect x="8" y="8" width="5" height="5" rx="1.2" fill="#3b82f6"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>OptCV</span>
            {!isMobile && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#93c5fd', background: 'rgba(147,197,253,0.12)', border: '1px solid rgba(147,197,253,0.25)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.08em' }}>BETA</span>
            )}
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{ display: 'flex', height: 56, marginLeft: 16 }}>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setView(item.id)} style={{
                  height: 56, padding: '0 16px', background: 'none', border: 'none',
                  borderBottom: view === item.id ? '2px solid #60a5fa' : '2px solid transparent',
                  color: view === item.id ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: view === item.id ? 600 : 400,
                  transition: 'all 0.15s', letterSpacing: '-0.01em',
                }}>{item.label}</button>
              ))}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Desktop right */}
          {!isMobile && (
            <div style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: 6 }}>
              Last sync: <span style={{ color: '#94a3b8', fontWeight: 500 }}>2 hrs ago</span>
            </div>
          )}

          {/* Avatar */}
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#3b82f6', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>A</div>

          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                {menuOpen
                  ? <><line x1="4" y1="4" x2="18" y2="18"/><line x1="18" y1="4" x2="4" y2="18"/></>
                  : <><line x1="3" y1="7" x2="19" y2="7"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="15" x2="19" y2="15"/></>
                }
              </svg>
            </button>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div style={{ background: '#1e3a5f', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 0' }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setView(item.id); setMenuOpen(false) }} style={{
                display: 'block', width: '100%', padding: '12px 20px', background: 'none', border: 'none', textAlign: 'left',
                color: view === item.id ? '#fff' : '#94a3b8',
                fontSize: 14, fontWeight: view === item.id ? 600 : 400,
                borderLeft: view === item.id ? '3px solid #60a5fa' : '3px solid transparent',
              }}>{item.label}</button>
            ))}
          </div>
        )}
      </nav>

      <div style={{ paddingTop: 56 }}>
        {view === 'tracker' ? <JobTracker /> : <ProfileIngestor />}
      </div>
    </div>
  )
}
