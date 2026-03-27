import { useState } from 'react'
import JobTracker from './JobTracker.jsx'
import ProfileIngestor from './ProfileIngestor.jsx'

export default function App() {
  const [view, setView] = useState('tracker')

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f6f9; font-family: 'Inter', sans-serif; color: #1a2b4a; }
        input, textarea, select { font-family: 'Inter', sans-serif; }
        input::placeholder, textarea::placeholder { color: #a0aec0; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #1a2b4a !important; box-shadow: 0 0 0 3px rgba(26,43,74,0.08); }
        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f4f6f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 58, zIndex: 1000,
        background: '#1a2b4a',
        boxShadow: '0 2px 16px rgba(26,43,74,0.18)',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 0,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 36 }}>
          <div style={{
            width: 30, height: 30, background: '#ffffff',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#1a2b4a"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#1a2b4a"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#1a2b4a"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#3b82f6"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>OptCV</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.1em',
            background: 'rgba(147,197,253,0.12)', border: '1px solid rgba(147,197,253,0.25)',
            padding: '2px 7px', borderRadius: 4,
          }}>BETA</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', height: 58, gap: 2 }}>
          {[['tracker', 'Job Board'], ['profile', 'My Profile']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              height: 58, padding: '0 18px',
              background: 'none', border: 'none',
              borderBottom: view === v ? '2px solid #60a5fa' : '2px solid transparent',
              color: view === v ? '#ffffff' : '#94a3b8',
              fontSize: 13, fontWeight: view === v ? 600 : 400,
              transition: 'all 0.15s', letterSpacing: '-0.01em',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '5px 12px', borderRadius: 6,
            letterSpacing: '-0.01em',
          }}>
            Last sync: <span style={{ color: '#94a3b8', fontWeight: 500 }}>2 hours ago</span>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#3b82f6', border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>A</div>
        </div>
      </nav>

      <div style={{ paddingTop: 58 }}>
        {view === 'tracker' ? <JobTracker /> : <ProfileIngestor />}
      </div>
    </div>
  )
}
