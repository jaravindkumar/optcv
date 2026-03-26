import { useState } from 'react'
import JobTracker from './JobTracker.jsx'
import ProfileIngestor from './ProfileIngestor.jsx'

export default function App() {
  const [view, setView] = useState('tracker')

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f4f8; font-family: 'Inter', sans-serif; }
        input::placeholder { color: #94a3b8 !important; }
        input:focus, textarea:focus { border-color: #1e3a5f !important; outline: none; box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f0f4f8; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      {/* Top nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 999,
        background: '#1e3a5f', boxShadow: '0 2px 12px rgba(30,58,95,0.2)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16 }}>💼</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>OptCV</span>
          <span style={{ fontSize: 9, color: '#93c5fd', background: 'rgba(147,197,253,0.15)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(147,197,253,0.3)', letterSpacing: '0.08em', fontWeight: 600 }}>AI</span>
        </div>

        <div style={{ flex: 1 }} />

        {[['tracker', '📋  Jobs'], ['profile', '👤  My Profile']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? '#ffffff' : 'rgba(255,255,255,0.1)',
            border: 'none', padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
            color: view === v ? '#1e3a5f' : '#bfdbfe',
            fontSize: 12, fontWeight: view === v ? 700 : 500, transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </nav>

      <div style={{ paddingTop: 56 }}>
        {view === 'tracker' ? <JobTracker /> : <ProfileIngestor />}
      </div>
    </div>
  )
}
