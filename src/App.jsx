import { useState } from 'react'
import JobTracker from './JobTracker.jsx'
import ProfileIngestor from './ProfileIngestor.jsx'

export default function App() {
  const [view, setView] = useState('tracker')

  return (
    <div style={{ background: '#07070e', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070e; }
        input::placeholder { color: #1e1e2e !important; }
        input:focus, textarea:focus { border-color: rgba(124,58,237,.4) !important; outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 2px; }
      `}</style>

      {/* Top nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48, zIndex: 999,
        background: '#0a0a16', borderBottom: '1px solid #14141e',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      }}>
        <span style={{
          fontSize: 15, fontWeight: 800, color: '#e0e0f0',
          fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em'
        }}>
          OptCV
        </span>
        <span style={{
          fontSize: 9, color: '#7c3aed', fontFamily: 'monospace',
          background: 'rgba(124,58,237,.1)', padding: '2px 8px',
          borderRadius: 20, border: '1px solid rgba(124,58,237,.2)',
          letterSpacing: '0.1em'
        }}>AI JOB TRACKER</span>

        <div style={{ flex: 1 }} />

        {[['tracker', '⊞  Jobs'], ['profile', '◈  My Profile']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? 'rgba(124,58,237,.1)' : 'transparent',
            border: `1px solid ${view === v ? 'rgba(124,58,237,.3)' : 'transparent'}`,
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            color: view === v ? '#a78bfa' : '#444',
            fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </nav>

      <div style={{ paddingTop: 48 }}>
        {view === 'tracker' ? <JobTracker /> : <ProfileIngestor />}
      </div>
    </div>
  )
}
