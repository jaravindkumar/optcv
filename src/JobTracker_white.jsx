import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

// ── COLOURS ──────────────────────────────────────────────────────
const C = {
  navy:       '#1e3a5f',
  navyLight:  '#2d5282',
  navyPale:   '#ebf4ff',
  navyBorder: '#bee3f8',
  white:      '#ffffff',
  bgPage:     '#f0f4f8',
  bgCard:     '#ffffff',
  border:     '#e2e8f0',
  borderDark: '#cbd5e1',
  textDark:   '#1e3a5f',
  textMid:    '#475569',
  textLight:  '#94a3b8',
  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  greenBdr:   '#bbf7d0',
  amber:      '#d97706',
  amberBg:    '#fffbeb',
  amberBdr:   '#fde68a',
  red:        '#dc2626',
  redBg:      '#fef2f2',
  redBdr:     '#fecaca',
}

// ── MOCK DATA ────────────────────────────────────────────────────
const MOCK_JOBS = [
  { id:1, created_at:'2026-03-25T06:00:00Z', title:'Senior AI Product Manager', company:'Wayve', location:'London', salary:'£90–120k', board:'LinkedIn', job_type:'Full-time', remote_type:'Hybrid', match_score:94, skills_score:96, experience_score:91, seniority_score:95, salary_score:88, location_score:97, industry_score:95, tags:['AI','Product','Autonomous Systems'], saved:false, applied:false, apply_url:'https://wayve.ai/careers', description:`Wayve is building the future of autonomous vehicles using end-to-end deep learning.\n\n**Responsibilities:**\n- Own the product roadmap for AI training and evaluation\n- Partner with ML researchers to prioritise model improvements\n- Define metrics for autonomous driving features\n\n**Requirements:**\n- 5+ years PM experience in AI/ML products\n- Deep understanding of ML pipelines\n- Experience in fast-moving deep tech environments` },
  { id:2, created_at:'2026-03-25T06:00:00Z', title:'Data Scientist – Sports Analytics', company:'Hudl', location:'London / Remote', salary:'£70–90k', board:'Greenhouse', job_type:'Full-time', remote_type:'Remote', match_score:88, skills_score:92, experience_score:85, seniority_score:82, salary_score:90, location_score:85, industry_score:93, tags:['Python','Computer Vision','Sports Tech'], saved:true, applied:false, apply_url:'https://hudl.com/jobs', description:`Hudl powers performance analysis for 180,000+ teams.\n\n**Responsibilities:**\n- Develop CV models for player tracking\n- Build data pipelines from raw video to metrics\n- Ship features to coaches and analysts\n\n**Requirements:**\n- 3+ years data science experience\n- Strong Python, PyTorch or TensorFlow\n- Experience with pose estimation or object detection` },
  { id:3, created_at:'2026-03-25T12:00:00Z', title:'ML Engineer – Digital Health', company:'Huma Therapeutics', location:'London', salary:'£80–100k', board:'Lever', job_type:'Full-time', remote_type:'Hybrid', match_score:83, skills_score:88, experience_score:84, seniority_score:80, salary_score:82, location_score:90, industry_score:78, tags:['Digital Twin','Healthcare','MLOps'], saved:false, applied:false, apply_url:'https://huma.com/careers', description:`Huma builds digital twin software for clinical trials.\n\n**Responsibilities:**\n- Design ML models for patient outcome prediction\n- Work with clinical data pipelines\n- Validate models with clinicians\n\n**Requirements:**\n- 4+ years ML engineering\n- Clinical or wearable data experience preferred\n- Strong MLOps background` },
  { id:4, created_at:'2026-03-24T18:00:00Z', title:'Biomechanics Data Scientist', company:'Catapult Sports', location:'London', salary:'£65–85k', board:'Wellfound', job_type:'Full-time', remote_type:'Hybrid', match_score:91, skills_score:95, experience_score:93, seniority_score:88, salary_score:75, location_score:80, industry_score:98, tags:['Biomechanics','Wearables','Sports Science'], saved:true, applied:false, apply_url:'https://catapultsports.com/careers', description:`Catapult is the global leader in athlete monitoring.\n\n**Responsibilities:**\n- Build biomechanical feature extraction from IMU data\n- Develop injury risk prediction models\n- Work with NFL, Premier League, AFL teams\n\n**Requirements:**\n- Background in biomechanics or sports science\n- Strong Python and signal processing\n- Wearable sensor data experience` },
  { id:5, created_at:'2026-03-24T12:00:00Z', title:'AI Research Engineer', company:'Magic Pony Technology', location:'London', salary:'£85–115k', board:'Adzuna', job_type:'Full-time', remote_type:'On-site', match_score:76, skills_score:80, experience_score:78, seniority_score:70, salary_score:85, location_score:90, industry_score:72, tags:['Research','Deep Learning','Generative AI'], saved:false, applied:false, apply_url:'#', description:`Magic Pony Technology is hiring an AI Research Engineer for generative video models.\n\n**Responsibilities:**\n- Research novel generative model architectures\n- Run large-scale GPU training experiments\n\n**Requirements:**\n- PhD or equivalent research experience\n- Expert PyTorch skills` },
  { id:6, created_at:'2026-03-23T18:00:00Z', title:'Product Engineer – AI Tools', company:'Cleo', location:'London', salary:'£75–95k', board:'Otta', job_type:'Full-time', remote_type:'Hybrid', match_score:71, skills_score:74, experience_score:72, seniority_score:68, salary_score:80, location_score:90, industry_score:65, tags:['Fintech','AI','Full-stack'], saved:false, applied:true, apply_url:'#', description:`Cleo is an AI-powered financial assistant used by 6M+ people.\n\n**Responsibilities:**\n- Build full-stack features across mobile and web\n- Own features end-to-end\n\n**Requirements:**\n- 3+ years product engineering\n- Strong React/React Native\n- Comfortable with LLM APIs` },
]

const CRITERIA = [
  { id:'skills_score',     label:'Skills'     },
  { id:'experience_score', label:'Experience' },
  { id:'seniority_score',  label:'Seniority'  },
  { id:'salary_score',     label:'Salary'     },
  { id:'location_score',   label:'Location'   },
  { id:'industry_score',   label:'Industry'   },
]
const DATE_PRESETS = ['Today','3 days','Week','Month','Custom']

// ── HELPERS ──────────────────────────────────────────────────────
const scoreColor = s => s >= 88 ? C.green : s >= 72 ? C.amber : C.red
const scoreBg    = s => s >= 88 ? C.greenBg : s >= 72 ? C.amberBg : C.redBg
const scoreBdr   = s => s >= 88 ? C.greenBdr : s >= 72 ? C.amberBdr : C.redBdr
const fmtDate    = d => new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
const fmtTime    = d => new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})

function ScoreRing({ value, size=48, stroke=4 }) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r, col=scoreColor(value)
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 0.5s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:size*.22, fontWeight:700, color:col }}>{value}</span>
      </div>
    </div>
  )
}

function Bar({ label, value }) {
  const col = scoreColor(value)
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:C.textMid, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:11, color:col, fontWeight:700 }}>{value}%</span>
      </div>
      <div style={{ height:4, background:C.border, borderRadius:4 }}>
        <div style={{ height:'100%', width:`${value}%`, background:col, borderRadius:4, transition:'width 0.4s ease' }}/>
      </div>
    </div>
  )
}

function Tag({ label, active }) {
  return (
    <span style={{
      fontSize:11, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap',
      background: active ? C.navyPale : '#f1f5f9',
      border: `1px solid ${active ? C.navyBorder : C.border}`,
      color: active ? C.navy : C.textMid,
      fontWeight: active ? 600 : 400,
    }}>{label}</span>
  )
}

// ── CV MODAL ─────────────────────────────────────────────────────
function CVModal({ job, onClose }) {
  const [tab, setTab]         = useState('cv')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData]   = useState(null)
  const [saved, setSaved]     = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/claude', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1200,
          messages:[{ role:'user', content:`
You are a CV tailoring assistant. Tailor a CV for a candidate applying to this role.

CANDIDATE: Research Associate at Imperial College London. PhD from Max Planck/Harvard.
Skills: Python, AI/ML, Digital Twins, Computer Vision, Biomechanics, MediaPipe, MATLAB.
Patent: WO2022177571A1. Published in top-tier journals.

JOB: ${job.title} at ${job.company}
Tags: ${(job.tags||[]).join(', ')}
Description: ${(job.description||'').slice(0,600)}

Return ONLY raw JSON (no markdown):
{
  "summary": "2-sentence professional summary tailored to this specific role",
  "experience": [
    {"role":"Research Associate","org":"Imperial College London","period":"2023–Present","bullets":["3 tailored bullets"]},
    {"role":"Simulation Engineer","org":"Philomec Inc.","period":"2021–2023","bullets":["2 tailored bullets"]},
    {"role":"Research Fellow","org":"SUTD / HP-NTU","period":"2018–2021","bullets":["2 tailored bullets"]}
  ],
  "coverLetter": "3 tight paragraphs. Direct and specific. No fluff."
}` }]
        })
      })
      const d = await res.json()
      const text = d.content?.[0]?.text || '{}'
      setCvData(JSON.parse(text.replace(/```json|```/g,'').trim()))
    } catch(e) {
      setCvData({
        summary:`Researcher and engineer with a PhD (Max Planck/Harvard) and active work at Imperial College London on AI-powered digital twin systems. Deep expertise in ${(job.tags||[]).slice(0,2).join(' and ')} directly aligned with ${job.company}'s mission.`,
        experience:[
          {role:'Research Associate',org:'Imperial College London',period:'2023–Present',bullets:[`Led AI-powered digital twin development with direct applications in ${(job.tags||['AI'])[0]}`,`Built Python/MediaPipe computer vision pipelines deployed in NHS clinical settings`,`Collaborated with clinical partners to deliver personalised device optimisation`]},
          {role:'Simulation Engineer',org:'Philomec Inc.',period:'2021–2023',bullets:[`Processed VICON motion capture data to build subject-specific biomechanical models`,`Delivered simulation outputs to clinical and sports performance teams`]},
          {role:'Research Fellow',org:'SUTD / HP-NTU',period:'2018–2021',bullets:[`Developed computational design tools bridging simulation and fabrication`,`Published peer-reviewed work; holds international patent WO2022177571A1`]},
        ],
        coverLetter:`Dear Hiring Team at ${job.company},\n\nI am writing to apply for the ${job.title} role. My background combining a PhD from Max Planck Institute and Harvard with current research at Imperial College London on AI-powered digital twins gives me a direct foundation for this work.\n\nAt Imperial I have built and deployed AI systems working with NHS partners — going from research concept to clinical deployment. My international patent and publication record demonstrate I can turn novel ideas into concrete outputs.\n\nI would welcome the chance to discuss how my experience maps to this role.\n\nBest regards,\nAravind Kumar Jaishankar`,
      })
    }
    setLoading(false)
  }

  const saveDoc = async () => {
    if (!cvData) return
    await supabase.from('generated_docs').upsert({ job_id:job.id, cv_json:cvData, cover_letter:cvData.coverLetter, created_at:new Date().toISOString() })
    setSaved(true)
  }

  const download = () => {
    const content = tab==='cv'
      ? [`ARAVIND KUMAR JAISHANKAR`,`aravind@example.com | London, UK | Patent: WO2022177571A1`,'','PROFESSIONAL SUMMARY',cvData?.summary||'','','EXPERIENCE',...(cvData?.experience||[]).flatMap(e=>[`${e.role} — ${e.org} (${e.period})`,...(e.bullets||[]).map(b=>`  • ${b}`),''])].join('\n')
      : cvData?.coverLetter||''
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content],{type:'text/plain'}))
    a.download = `${tab==='cv'?'CV':'CoverLetter'}_${job.company.replace(/\s/g,'_')}.txt`
    a.click()
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'min(720px,96vw)', maxHeight:'92vh', background:C.white, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding:'16px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:C.white, flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>Application Documents</div>
            <div style={{ fontSize:12, color:C.textLight, marginTop:2 }}>{job.title} at {job.company}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {!cvData && !loading && (
              <button onClick={generate} style={{ padding:'8px 16px', borderRadius:8, background:C.navy, border:'none', color:'#fff', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                ✦ Generate with Claude
              </button>
            )}
            {cvData && <>
              <button onClick={saveDoc} style={{ padding:'8px 14px', borderRadius:8, background:saved?C.greenBg:'#f8fafc', border:`1px solid ${saved?C.greenBdr:C.border}`, color:saved?C.green:C.textMid, fontSize:12, cursor:'pointer', fontWeight:500 }}>
                {saved?'✓ Saved':'Save'}
              </button>
              <button onClick={download} style={{ padding:'8px 14px', borderRadius:8, background:C.navyPale, border:`1px solid ${C.navyBorder}`, color:C.navy, fontSize:12, cursor:'pointer', fontWeight:600 }}>
                ↓ Download
              </button>
            </>}
            <button onClick={onClose} style={{ background:'#f1f5f9', border:`1px solid ${C.border}`, borderRadius:8, color:C.textMid, width:32, height:32, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:C.white, flexShrink:0 }}>
          {[['cv','CV'],['cover','Cover Letter']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:'11px 24px', background:'none', border:'none',
              borderBottom:tab===id?`2px solid ${C.navy}`:'2px solid transparent',
              color:tab===id?C.navy:C.textLight,
              fontSize:12, cursor:'pointer', fontWeight:tab===id?600:400,
            }}>{lbl}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'auto', padding:28, background:'#fafbfc' }}>
          {!cvData && !loading && (
            <div style={{ textAlign:'center', padding:'60px 0', color:C.textLight }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
              <div style={{ fontSize:13 }}>Click "Generate with Claude" to tailor your CV to this specific role</div>
            </div>
          )}
          {loading && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:13, color:C.navy, fontWeight:500 }}>Claude is tailoring your documents…</div>
              <div style={{ marginTop:12, fontSize:11, color:C.textLight }}>Usually takes 10–15 seconds</div>
            </div>
          )}
          {cvData && tab==='cv' && (
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:13, color:C.textDark, lineHeight:1.7, background:C.white, padding:28, borderRadius:12, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:22, fontWeight:800, color:C.navy, marginBottom:2 }}>Aravind Kumar Jaishankar</div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:2 }}>aravind@example.com · +44 7700 000000 · London, UK</div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:20 }}>linkedin.com/in/aravindkj · Patent: WO2022177571A1</div>

              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:C.navy, textTransform:'uppercase', marginBottom:6, paddingBottom:4, borderBottom:`2px solid ${C.navy}` }}>Professional Summary</div>
              <div style={{ color:C.textMid, marginBottom:20, fontSize:13, lineHeight:1.8 }}>{cvData.summary}</div>

              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:C.navy, textTransform:'uppercase', marginBottom:10, paddingBottom:4, borderBottom:`2px solid ${C.navy}` }}>Experience</div>
              {(cvData.experience||[]).map((e,i)=>(
                <div key={i} style={{ marginBottom:16 }}>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:13 }}>{e.role}</div>
                  <div style={{ color:C.textMid, fontSize:12, marginBottom:5 }}>{e.org} · {e.period}</div>
                  {(e.bullets||[]).map((b,j)=><div key={j} style={{ color:C.textMid, paddingLeft:14, marginBottom:3, fontSize:12 }}>• {b}</div>)}
                </div>
              ))}

              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:C.navy, textTransform:'uppercase', marginBottom:8, marginTop:4, paddingBottom:4, borderBottom:`2px solid ${C.navy}` }}>Education</div>
              <div style={{ fontWeight:600, color:C.navy, fontSize:13 }}>PhD – Biomechanics & Computational Design</div>
              <div style={{ color:C.textMid, fontSize:12, marginBottom:16 }}>Max Planck Institute / Harvard University · 2018</div>

              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:C.navy, textTransform:'uppercase', marginBottom:8, paddingBottom:4, borderBottom:`2px solid ${C.navy}` }}>Skills</div>
              <div style={{ color:C.textMid, fontSize:12 }}>Python · MATLAB · MediaPipe · Digital Twins · Computer Vision · AI/ML · Rhino/Grasshopper · VICON Motion Capture</div>
            </div>
          )}
          {cvData && tab==='cover' && (
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:13, color:C.textMid, lineHeight:2, whiteSpace:'pre-wrap', background:C.white, padding:28, borderRadius:12, border:`1px solid ${C.border}` }}>
              {cvData.coverLetter}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function JobTracker() {
  const [user, setUser]           = useState(null)
  const [uInput, setUInput]       = useState('')
  const [pInput, setPInput]       = useState('')
  const [authErr, setAuthErr]     = useState('')
  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [usingMock, setUsingMock] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [cvJob, setCvJob]         = useState(null)
  const [datePreset, setDatePreset]         = useState('Week')
  const [customFrom, setCustomFrom]         = useState('')
  const [customTo, setCustomTo]             = useState('')
  const [activeCriteria, setActiveCriteria] = useState(CRITERIA.map(c=>c.id))
  const [filterTab, setFilterTab]           = useState('all')
  const [minMatch, setMinMatch]             = useState(0)
  const [searchQ, setSearchQ]               = useState('')

  const doLogin = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      setUser({ email: uInput || 'demo@optcv.app' }); return
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email:uInput, password:pInput })
    if (error) setAuthErr(error.message)
    else setUser(data.user)
  }

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) throw new Error('demo')
        const { data, error } = await supabase.from('jobs').select('*').order('created_at',{ascending:false})
        if (error || !data?.length) throw new Error('empty')
        setJobs(data); setSelected(data[0])
      } catch { setJobs(MOCK_JOBS); setSelected(MOCK_JOBS[0]); setUsingMock(true) }
      setLoading(false)
    })()
  }, [user])

  const toggleSaved = async (id) => {
    const job = jobs.find(j=>j.id===id)
    const val = !job.saved
    setJobs(p=>p.map(j=>j.id===id?{...j,saved:val}:j))
    if (!usingMock) await supabase.from('jobs').update({saved:val}).eq('id',id)
  }
  const markApplied = async (id) => {
    setJobs(p=>p.map(j=>j.id===id?{...j,applied:true}:j))
    if (!usingMock) await supabase.from('jobs').update({applied:true,applied_at:new Date().toISOString()}).eq('id',id)
  }

  const computeMatch = (job) => {
    if (!activeCriteria.length) return job.match_score||0
    const vals = activeCriteria.map(c=>job[c]||0)
    return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
  }

  const filtered = useMemo(() => {
    const now = new Date()
    return jobs.filter(j => {
      const d=new Date(j.created_at), diff=(now-d)/86400000
      if (datePreset==='Today'  && j.created_at?.slice(0,10)!==now.toISOString().slice(0,10)) return false
      if (datePreset==='3 days' && diff>3)  return false
      if (datePreset==='Week'   && diff>7)  return false
      if (datePreset==='Month'  && diff>30) return false
      if (datePreset==='Custom') {
        if (customFrom && d<new Date(customFrom)) return false
        if (customTo   && d>new Date(customTo))   return false
      }
      if (filterTab==='saved'   && !j.saved)   return false
      if (filterTab==='applied' && !j.applied) return false
      if (computeMatch(j) < minMatch) return false
      const q=searchQ.toLowerCase()
      if (q && !`${j.title} ${j.company} ${(j.tags||[]).join(' ')}`.toLowerCase().includes(q)) return false
      return true
    }).map(j=>({...j,_match:computeMatch(j)})).sort((a,b)=>b._match-a._match)
  }, [jobs,datePreset,customFrom,customTo,filterTab,minMatch,searchQ,activeCriteria])

  const grouped = useMemo(() => {
    const g={}
    filtered.forEach(j=>{const day=j.created_at?.slice(0,10)||'';if(!g[day])g[day]=[];g[day].push(j)})
    return g
  }, [filtered])

  const inp = { background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', color:C.textDark, fontSize:13, outline:'none', width:'100%', fontFamily:"'Inter', sans-serif" }

  // ── LOGIN ──────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #1e3a5f 0%, #2d5282 50%, #1e3a5f 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:380, background:C.white, borderRadius:20, padding:40, boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:26 }}>💼</div>
          <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>OptCV</div>
          <div style={{ fontSize:13, color:C.textLight, marginTop:4 }}>AI-Powered Job Tracker</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:C.textMid, display:'block', marginBottom:5, fontWeight:600 }}>Email</label>
          <input value={uInput} onChange={e=>setUInput(e.target.value)} placeholder="you@email.com" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, color:C.textMid, display:'block', marginBottom:5, fontWeight:600 }}>Password</label>
          <input type="password" value={pInput} onChange={e=>setPInput(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp}/>
        </div>
        {authErr && <div style={{ fontSize:12, color:C.red, marginBottom:12, background:C.redBg, padding:'8px 12px', borderRadius:8, border:`1px solid ${C.redBdr}` }}>{authErr}</div>}
        <button onClick={doLogin} style={{ width:'100%', padding:'12px', background:C.navy, border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Sign in
        </button>
        <div style={{ fontSize:11, color:C.textLight, textAlign:'center', marginTop:14 }}>
          No Supabase? Leave blank and press Sign in for demo mode
        </div>
      </div>
    </div>
  )

  const sel = selected ? {...selected,_match:computeMatch(selected)} : null

  return (
    <div style={{ height:'calc(100vh - 56px)', background:C.bgPage, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Filter bar */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:'10px 20px', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        {DATE_PRESETS.map(p=>(
          <button key={p} onClick={()=>setDatePreset(p)} style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${datePreset===p?C.navy:C.border}`, background:datePreset===p?C.navy:'transparent', color:datePreset===p?'#fff':C.textMid, fontSize:11, cursor:'pointer', fontWeight:datePreset===p?600:400 }}>{p}</button>
        ))}
        {datePreset==='Custom' && <>
          <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{...inp,width:140,padding:'5px 8px',fontSize:11}}/>
          <span style={{color:C.textLight,fontSize:11}}>→</span>
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{...inp,width:140,padding:'5px 8px',fontSize:11}}/>
        </>}
        <div style={{width:1,height:20,background:C.border}}/>
        {['all','saved','applied'].map(t=>(
          <button key={t} onClick={()=>setFilterTab(t)} style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${filterTab===t?C.navy:C.border}`, background:filterTab===t?C.navy:'transparent', color:filterTab===t?'#fff':C.textMid, fontSize:11, cursor:'pointer', fontWeight:filterTab===t?600:400, textTransform:'capitalize' }}>{t}</button>
        ))}
        <div style={{flex:1}}/>
        {usingMock && <span style={{fontSize:10,color:C.amber,background:C.amberBg,padding:'3px 10px',borderRadius:20,border:`1px solid ${C.amberBdr}`,fontWeight:600}}>DEMO MODE</span>}
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍  Search roles, companies…" style={{...inp,width:220,padding:'6px 12px',fontSize:12}}/>
      </div>

      {/* Criteria bar */}
      <div style={{ background:'#f8fafc', borderBottom:`1px solid ${C.border}`, padding:'8px 20px', display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', flexShrink:0 }}>
        <span style={{ fontSize:11, color:C.textMid, fontWeight:600, marginRight:4 }}>Match by:</span>
        {CRITERIA.map(c=>(
          <button key={c.id} onClick={()=>setActiveCriteria(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} style={{ padding:'4px 12px', borderRadius:20, border:`1px solid ${activeCriteria.includes(c.id)?C.green:C.border}`, background:activeCriteria.includes(c.id)?C.greenBg:'transparent', color:activeCriteria.includes(c.id)?C.green:C.textMid, fontSize:11, cursor:'pointer', fontWeight:activeCriteria.includes(c.id)?600:400 }}>{c.label}</button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:C.textMid,fontWeight:500}}>Min {minMatch}%</span>
        <input type="range" min={0} max={90} step={5} value={minMatch} onChange={e=>setMinMatch(+e.target.value)} style={{width:80,accentColor:C.navy}}/>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Left — job list */}
        <div style={{ width:320, borderRight:`1px solid ${C.border}`, overflow:'auto', flexShrink:0, background:C.white }}>
          {loading && <div style={{padding:32,textAlign:'center',fontSize:13,color:C.textLight}}>Loading jobs…</div>}
          {!loading && Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(date=>(
            <div key={date}>
              <div style={{ padding:'10px 16px 6px', fontSize:11, color:C.textLight, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', position:'sticky', top:0, background:'#f8fafc', borderBottom:`1px solid ${C.border}`, zIndex:2 }}>
                {fmtDate(date+'T12:00:00')} · {grouped[date].length} jobs
              </div>
              {grouped[date].map((job,i)=>{
                const active=selected?.id===job.id
                return (
                  <div key={job.id} onClick={()=>setSelected(job)} style={{ padding:'14px 16px', cursor:'pointer', background:active?C.navyPale:C.white, borderLeft:`3px solid ${active?C.navy:'transparent'}`, borderBottom:`1px solid ${C.border}`, animation:`fadeUp .2s ease ${i*.03}s both`, transition:'background 0.1s' }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:active?C.navy:C.textDark,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{job.title}</div>
                        <div style={{fontSize:11,color:C.textMid,marginTop:2}}>{job.company} · {job.location}</div>
                        <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap',alignItems:'center'}}>
                          {(job.tags||[]).slice(0,2).map(t=><Tag key={t} label={t} active={active}/>)}
                          {job.applied && <span style={{fontSize:10,color:C.green,background:C.greenBg,padding:'2px 8px',borderRadius:20,border:`1px solid ${C.greenBdr}`,fontWeight:600}}>Applied</span>}
                          {job.saved   && <span style={{color:'#f59e0b',fontSize:14}}>★</span>}
                        </div>
                      </div>
                      <ScoreRing value={job._match} size={40} stroke={3}/>
                    </div>
                    <div style={{fontSize:10,color:C.textLight,marginTop:6}}>{job.board} · {fmtTime(job.created_at)}</div>
                  </div>
                )
              })}
            </div>
          ))}
          {!loading && filtered.length===0 && <div style={{padding:32,textAlign:'center',fontSize:13,color:C.textLight}}>No jobs match your filters</div>}
        </div>

        {/* Right — detail */}
        {sel && (
          <div style={{flex:1,overflow:'auto',padding:'28px 32px',background:C.bgPage}}>

            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:22,fontWeight:800,color:C.navy,lineHeight:1.2}}>{sel.title}</div>
                <div style={{fontSize:14,color:C.textMid,marginTop:5}}>{sel.company} · {sel.location} · {sel.salary}</div>
                <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                  {sel.job_type    && <Tag label={sel.job_type}/>}
                  {sel.remote_type && <Tag label={sel.remote_type}/>}
                  {sel.board       && <Tag label={sel.board}/>}
                  {(sel.tags||[]).map(t=><Tag key={t} label={t}/>)}
                </div>
              </div>
              <div style={{textAlign:'center',background:C.white,borderRadius:16,padding:'14px 20px',border:`1px solid ${C.border}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <ScoreRing value={sel._match} size={64} stroke={5}/>
                <div style={{fontSize:10,color:C.textLight,marginTop:6,fontWeight:600}}>MATCH</div>
              </div>
            </div>

            {/* Match breakdown */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'18px 22px',marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textMid,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14}}>Match Breakdown</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 24px'}}>
                {CRITERIA.filter(c=>activeCriteria.includes(c.id)).map(c=>(
                  <Bar key={c.id} label={c.label} value={sel[c.id]||0}/>
                ))}
              </div>
              {activeCriteria.length===0 && <div style={{fontSize:12,color:C.textLight}}>Enable criteria above to see breakdown</div>}
            </div>

            {/* Actions */}
            <div style={{display:'flex',gap:10,marginBottom:24}}>
              <button onClick={()=>setCvJob(sel)} style={{padding:'10px 20px',borderRadius:10,background:C.navy,border:'none',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px rgba(30,58,95,0.3)'}}>
                ✦ CV + Cover Letter
              </button>
              <a href={sel.apply_url||'#'} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                <button onClick={()=>markApplied(sel.id)} style={{padding:'10px 20px',borderRadius:10,background:sel.applied?C.greenBg:C.white,border:`1px solid ${sel.applied?C.greenBdr:C.border}`,color:sel.applied?C.green:C.textMid,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  {sel.applied?'✓ Applied':'Apply →'}
                </button>
              </a>
              <button onClick={()=>toggleSaved(sel.id)} style={{padding:'10px 14px',borderRadius:10,background:sel.saved?C.amberBg:C.white,border:`1px solid ${sel.saved?C.amberBdr:C.border}`,color:sel.saved?'#f59e0b':C.textLight,fontSize:18,cursor:'pointer'}}>
                {sel.saved?'★':'☆'}
              </button>
            </div>

            {/* Description */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'22px 24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:13,color:C.textMid,lineHeight:2}}>
                {(sel.description||'').split('\n').map((line,i)=>{
                  if (line.startsWith('**')&&line.endsWith('**')) return <div key={i} style={{color:C.navy,fontWeight:700,marginTop:14,marginBottom:4,fontSize:13}}>{line.replace(/\*\*/g,'')}</div>
                  if (line.startsWith('- ')) return <div key={i} style={{paddingLeft:14,color:C.textMid}}>• {line.slice(2)}</div>
                  return <div key={i}>{line}</div>
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {cvJob && <CVModal job={cvJob} onClose={()=>setCvJob(null)}/>}
    </div>
  )
}
