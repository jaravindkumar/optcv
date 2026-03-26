import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

// ── MOCK DATA shown when Supabase not connected ─────────────────
const MOCK_JOBS = [
  { id:1, created_at:'2026-03-25T06:00:00Z', title:'Senior AI Product Manager', company:'Wayve', location:'London', salary:'£90–120k', board:'LinkedIn', job_type:'Full-time', remote_type:'Hybrid', match_score:94, skills_score:96, experience_score:91, seniority_score:95, salary_score:88, location_score:97, industry_score:95, tags:['AI','Product','Autonomous Systems'], saved:false, applied:false, apply_url:'https://wayve.ai/careers', description:`Wayve is building the future of autonomous vehicles using end-to-end deep learning.\n\n**Responsibilities:**\n- Own the product roadmap for AI training and evaluation\n- Partner with ML researchers to prioritise model improvements\n- Define metrics for autonomous driving features\n\n**Requirements:**\n- 5+ years PM experience in AI/ML products\n- Deep understanding of ML pipelines\n- Experience in fast-moving deep tech environments` },
  { id:2, created_at:'2026-03-25T06:00:00Z', title:'Data Scientist – Sports Analytics', company:'Hudl', location:'London / Remote', salary:'£70–90k', board:'Greenhouse', job_type:'Full-time', remote_type:'Remote', match_score:88, skills_score:92, experience_score:85, seniority_score:82, salary_score:90, location_score:85, industry_score:93, tags:['Python','Computer Vision','Sports Tech'], saved:true, applied:false, apply_url:'https://hudl.com/jobs', description:`Hudl powers performance analysis for 180,000+ teams.\n\n**Responsibilities:**\n- Develop CV models for player tracking\n- Build data pipelines from raw video to metrics\n- Ship features to coaches and analysts\n\n**Requirements:**\n- 3+ years data science experience\n- Strong Python, PyTorch or TensorFlow\n- Experience with pose estimation or object detection` },
  { id:3, created_at:'2026-03-25T12:00:00Z', title:'ML Engineer – Digital Health', company:'Huma Therapeutics', location:'London', salary:'£80–100k', board:'Lever', job_type:'Full-time', remote_type:'Hybrid', match_score:83, skills_score:88, experience_score:84, seniority_score:80, salary_score:82, location_score:90, industry_score:78, tags:['Digital Twin','Healthcare','MLOps'], saved:false, applied:false, apply_url:'https://huma.com/careers', description:`Huma builds digital twin software for clinical trials.\n\n**Responsibilities:**\n- Design ML models for patient outcome prediction\n- Work with clinical data pipelines\n- Validate models with clinicians\n\n**Requirements:**\n- 4+ years ML engineering\n- Clinical or wearable data experience preferred\n- Strong MLOps background` },
  { id:4, created_at:'2026-03-24T18:00:00Z', title:'Biomechanics Data Scientist', company:'Catapult Sports', location:'London', salary:'£65–85k', board:'Wellfound', job_type:'Full-time', remote_type:'Hybrid', match_score:91, skills_score:95, experience_score:93, seniority_score:88, salary_score:75, location_score:80, industry_score:98, tags:['Biomechanics','Wearables','Sports Science'], saved:true, applied:false, apply_url:'https://catapultsports.com/careers', description:`Catapult is the global leader in athlete monitoring.\n\n**Responsibilities:**\n- Build biomechanical feature extraction from IMU data\n- Develop injury risk prediction models\n- Work with NFL, Premier League, AFL teams\n\n**Requirements:**\n- Background in biomechanics or sports science\n- Strong Python and signal processing\n- Wearable sensor data experience` },
  { id:5, created_at:'2026-03-24T12:00:00Z', title:'AI Research Engineer', company:'Magic Pony Technology', location:'London', salary:'£85–115k', board:'Adzuna', job_type:'Full-time', remote_type:'On-site', match_score:76, skills_score:80, experience_score:78, seniority_score:70, salary_score:85, location_score:90, industry_score:72, tags:['Research','Deep Learning','Generative AI'], saved:false, applied:false, apply_url:'#', description:`Magic Pony Technology is hiring an AI Research Engineer for generative video models.\n\n**Responsibilities:**\n- Research novel generative model architectures\n- Run large-scale GPU training experiments\n\n**Requirements:**\n- PhD or equivalent research experience\n- Expert PyTorch skills` },
  { id:6, created_at:'2026-03-23T18:00:00Z', title:'Product Engineer – AI Tools', company:'Cleo', location:'London', salary:'£75–95k', board:'Otta', job_type:'Full-time', remote_type:'Hybrid', match_score:71, skills_score:74, experience_score:72, seniority_score:68, salary_score:80, location_score:90, industry_score:65, tags:['Fintech','AI','Full-stack'], saved:false, applied:true, apply_url:'#', description:`Cleo is an AI-powered financial assistant used by 6M+ people.\n\n**Responsibilities:**\n- Build full-stack features across mobile and web\n- Own features end-to-end\n\n**Requirements:**\n- 3+ years product engineering\n- Strong React/React Native\n- Comfortable with LLM APIs` },
]

const CRITERIA = [
  { id:'skills_score',     label:'Skills'      },
  { id:'experience_score', label:'Experience'  },
  { id:'seniority_score',  label:'Seniority'   },
  { id:'salary_score',     label:'Salary'      },
  { id:'location_score',   label:'Location'    },
  { id:'industry_score',   label:'Industry'    },
]
const DATE_PRESETS = ['Today','3 days','Week','Month','Custom']

// ── HELPERS ─────────────────────────────────────────────────────
const scoreColor = s => s >= 88 ? '#4ade80' : s >= 72 ? '#facc15' : '#f87171'
const fmtDate = d => new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
const fmtTime = d => new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})

function ScoreRing({ value, size=48, stroke=4 }) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r, col=scoreColor(value)
  return (
    <svg width={size} height={size} style={{flexShrink:0,transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
        style={{transition:'stroke-dasharray 0.5s ease'}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={col} fontSize={size*.22} fontWeight="700" fontFamily="monospace"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>
        {value}
      </text>
    </svg>
  )
}

function Bar({ label, value }) {
  const col = scoreColor(value)
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{fontSize:10,color:'#444',fontFamily:'monospace'}}>{label}</span>
        <span style={{fontSize:10,color:col,fontFamily:'monospace',fontWeight:700}}>{value}%</span>
      </div>
      <div style={{height:3,background:'#1a1a2e',borderRadius:2}}>
        <div style={{height:'100%',width:`${value}%`,background:col,borderRadius:2,transition:'width 0.4s ease'}}/>
      </div>
    </div>
  )
}

function Chip({ label, hi }) {
  return (
    <span style={{
      fontSize:10,padding:'2px 8px',borderRadius:20,whiteSpace:'nowrap',
      background:hi?'rgba(139,92,246,.15)':'rgba(255,255,255,.04)',
      border:`1px solid ${hi?'rgba(139,92,246,.3)':'rgba(255,255,255,.08)'}`,
      color:hi?'#a78bfa':'#555',fontFamily:'monospace',
    }}>{label}</span>
  )
}

// ── CV MODAL ─────────────────────────────────────────────────────
function CVModal({ job, onClose }) {
  const [tab, setTab]       = useState('cv')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const [saved, setSaved]   = useState(false)

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
  "coverLetter": "3 tight paragraphs. Direct, specific to ${job.company} and ${job.title}. No fluff."
}` }]
        })
      })
      const d = await res.json()
      const text = d.content?.[0]?.text || '{}'
      setCvData(JSON.parse(text.replace(/```json|```/g,'').trim()))
    } catch(e) {
      // Fallback
      setCvData({
        summary:`Researcher and engineer with a PhD (Max Planck/Harvard) and active work at Imperial College London on AI-powered digital twin systems. Deep expertise in ${(job.tags||[]).slice(0,2).join(' and ')} directly aligned with ${job.company}'s mission.`,
        experience:[
          {role:'Research Associate',org:'Imperial College London',period:'2023–Present',bullets:[`Led AI-powered digital twin development with direct applications in ${(job.tags||['AI'])[0]}`,`Built Python/MediaPipe computer vision pipelines deployed in NHS clinical settings`,`Collaborated with clinical partners to deliver personalised device optimisation`]},
          {role:'Simulation Engineer',org:'Philomec Inc.',period:'2021–2023',bullets:[`Processed VICON motion capture data to build subject-specific biomechanical models`,`Delivered simulation outputs to clinical and sports performance teams`]},
          {role:'Research Fellow',org:'SUTD / HP-NTU',period:'2018–2021',bullets:[`Developed computational design tools bridging simulation and fabrication`,`Published peer-reviewed work; holds international patent WO2022177571A1`]},
        ],
        coverLetter:`Dear Hiring Team at ${job.company},\n\nI am writing to apply for the ${job.title} role. My background combining a PhD from Max Planck Institute and Harvard with current research at Imperial College London on AI-powered digital twins gives me a direct foundation for the work you are doing in ${(job.tags||[]).slice(0,2).join(' and ')}.\n\nAt Imperial I have built and deployed AI systems working with NHS partners — going from research concept to clinical deployment. I have hands-on experience with the full pipeline: data collection, model development, validation, and working with multidisciplinary teams. My international patent and publication record demonstrate I can turn novel ideas into concrete outputs.\n\nI would welcome the chance to discuss how my experience maps to this role.\n\nBest regards,\nAravind Kumar Jaishankar`,
      })
    }
    setLoading(false)
  }

  const saveDoc = async () => {
    if (!cvData) return
    await supabase.from('generated_docs').upsert({
      job_id: job.id, cv_json: cvData,
      cover_letter: cvData.coverLetter,
      created_at: new Date().toISOString()
    })
    setSaved(true)
  }

  const download = () => {
    const content = tab === 'cv'
      ? [`ARAVIND KUMAR JAISHANKAR`,`aravind@example.com | London, UK | linkedin.com/in/aravindkj | Patent: WO2022177571A1`,'',
         'PROFESSIONAL SUMMARY', cvData?.summary||'','',
         'EXPERIENCE',
         ...(cvData?.experience||[]).flatMap(e=>[`${e.role} — ${e.org} (${e.period})`,...(e.bullets||[]).map(b=>`  • ${b}`),''])
        ].join('\n')
      : cvData?.coverLetter || ''
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content],{type:'text/plain'}))
    a.download = `${tab==='cv'?'CV':'CoverLetter'}_${job.company.replace(/\s/g,'_')}.txt`
    a.click()
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'min(700px,96vw)',maxHeight:'92vh',background:'#0c0c18',border:'1px solid #1e1e30',borderRadius:16,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,.6)'}}>

        {/* Header */}
        <div style={{padding:'14px 20px',borderBottom:'1px solid #1a1a28',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#e0e0f0',fontFamily:"'Syne',sans-serif"}}>Application Documents</div>
            <div style={{fontSize:10,color:'#333',fontFamily:'monospace',marginTop:1}}>{job.title} @ {job.company}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {!cvData && !loading && (
              <button onClick={generate} style={{padding:'7px 14px',borderRadius:8,background:'#7c3aed',border:'none',color:'#fff',fontSize:11,cursor:'pointer',fontFamily:'monospace'}}>
                ✦ Generate with Claude
              </button>
            )}
            {cvData && <>
              <button onClick={saveDoc} style={{padding:'7px 12px',borderRadius:8,background:saved?'#0d1f14':'transparent',border:`1px solid ${saved?'#14532d':'#1e1e30'}`,color:saved?'#4ade80':'#555',fontSize:11,cursor:'pointer',fontFamily:'monospace'}}>
                {saved?'✓ Saved':'Save'}
              </button>
              <button onClick={download} style={{padding:'7px 12px',borderRadius:8,background:'transparent',border:'1px solid #1e1e30',color:'#a78bfa',fontSize:11,cursor:'pointer',fontFamily:'monospace'}}>
                ↓ Download
              </button>
            </>}
            <button onClick={onClose} style={{background:'transparent',border:'1px solid #1e1e30',borderRadius:8,color:'#444',width:28,height:28,cursor:'pointer',fontSize:15}}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid #1a1a28',flexShrink:0}}>
          {[['cv','CV'],['cover','Cover Letter']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:'9px 20px',background:'none',border:'none',
              borderBottom:tab===id?'2px solid #7c3aed':'2px solid transparent',
              color:tab===id?'#a78bfa':'#333',fontSize:10,cursor:'pointer',
              fontFamily:'monospace',letterSpacing:'0.08em',textTransform:'uppercase',
            }}>{lbl}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:'auto',padding:24}}>
          {!cvData && !loading && (
            <div style={{textAlign:'center',padding:'50px 0',color:'#2a2a3a',fontFamily:'monospace',fontSize:12}}>
              <div style={{fontSize:28,marginBottom:10}}>✦</div>
              Click "Generate with Claude" to tailor your CV and cover letter to this role
            </div>
          )}
          {loading && (
            <div style={{textAlign:'center',padding:'50px 0'}}>
              <div style={{fontSize:12,color:'#7c3aed',fontFamily:'monospace',animation:'pulse 1.2s ease infinite'}}>
                Claude is tailoring your documents…
              </div>
              <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
            </div>
          )}
          {cvData && tab==='cv' && (
            <div style={{fontFamily:'monospace',fontSize:12,color:'#ccc',lineHeight:1.8}}>
              <div style={{fontSize:18,fontWeight:800,color:'#e0e0f0',fontFamily:"'Syne',sans-serif",marginBottom:2}}>Aravind Kumar Jaishankar</div>
              <div style={{color:'#444',fontSize:10,marginBottom:1}}>aravind@example.com · +44 7700 000000 · London, UK</div>
              <div style={{color:'#333',fontSize:10,marginBottom:16}}>linkedin.com/in/aravindkj · Patent: WO2022177571A1</div>
              <div style={{fontSize:9,letterSpacing:'0.15em',color:'#7c3aed',textTransform:'uppercase',marginBottom:5}}>Summary</div>
              <div style={{color:'#aaa',borderLeft:'2px solid #7c3aed',paddingLeft:10,marginBottom:18,lineHeight:1.7}}>{cvData.summary}</div>
              <div style={{fontSize:9,letterSpacing:'0.15em',color:'#7c3aed',textTransform:'uppercase',marginBottom:10}}>Experience</div>
              {(cvData.experience||[]).map((e,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{fontWeight:700,color:'#ddd'}}>{e.role}</div>
                  <div style={{color:'#444',fontSize:10,marginBottom:4}}>{e.org} · {e.period}</div>
                  {(e.bullets||[]).map((b,j)=><div key={j} style={{color:'#666',paddingLeft:10,marginBottom:2,fontSize:11}}>· {b}</div>)}
                </div>
              ))}
              <div style={{fontSize:9,letterSpacing:'0.15em',color:'#7c3aed',textTransform:'uppercase',marginBottom:8,marginTop:6}}>Education</div>
              <div style={{color:'#bbb',fontSize:11,fontWeight:600}}>PhD – Biomechanics & Computational Design</div>
              <div style={{color:'#444',fontSize:10,marginBottom:8}}>Max Planck Institute / Harvard University · 2018</div>
              <div style={{fontSize:9,letterSpacing:'0.15em',color:'#7c3aed',textTransform:'uppercase',marginBottom:8}}>Skills</div>
              <div style={{color:'#666',fontSize:11}}>Python · MATLAB · MediaPipe · Digital Twins · Computer Vision · AI/ML · Rhino/Grasshopper · VICON Motion Capture</div>
            </div>
          )}
          {cvData && tab==='cover' && (
            <div style={{fontFamily:'monospace',fontSize:12,color:'#888',lineHeight:2,whiteSpace:'pre-wrap'}}>{cvData.coverLetter}</div>
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
  const [datePreset, setDatePreset]   = useState('Week')
  const [customFrom, setCustomFrom]   = useState('')
  const [customTo, setCustomTo]       = useState('')
  const [activeCriteria, setActiveCriteria] = useState(CRITERIA.map(c=>c.id))
  const [filterTab, setFilterTab]     = useState('all')
  const [minMatch, setMinMatch]       = useState(0)
  const [searchQ, setSearchQ]         = useState('')

  const doLogin = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      setUser({ email: uInput || 'demo@optcv.app' })
      return
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: uInput, password: pInput })
    if (error) setAuthErr(error.message)
    else setUser(data.user)
  }

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
          throw new Error('demo')
        }
        const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
        if (error || !data?.length) throw new Error('empty')
        setJobs(data)
        setSelected(data[0])
      } catch {
        setJobs(MOCK_JOBS)
        setSelected(MOCK_JOBS[0])
        setUsingMock(true)
      }
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
      const d = new Date(j.created_at)
      const diff = (now-d)/86400000
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
      const m = computeMatch(j)
      if (m < minMatch) return false
      const q = searchQ.toLowerCase()
      if (q && !`${j.title} ${j.company} ${(j.tags||[]).join(' ')}`.toLowerCase().includes(q)) return false
      return true
    }).map(j=>({...j,_match:computeMatch(j)})).sort((a,b)=>b._match-a._match)
  }, [jobs,datePreset,customFrom,customTo,filterTab,minMatch,searchQ,activeCriteria])

  const grouped = useMemo(() => {
    const g={}
    filtered.forEach(j => { const day=j.created_at?.slice(0,10)||''; if(!g[day])g[day]=[]; g[day].push(j) })
    return g
  }, [filtered])

  const inp = {background:'#080812',border:'1px solid #1e1e30',borderRadius:8,padding:'9px 12px',color:'#ccc',fontSize:12,fontFamily:'monospace',outline:'none',width:'100%'}

  // ── LOGIN ──
  if (!user) return (
    <div style={{minHeight:'100vh',background:'#06060f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:340,background:'#0c0c18',border:'1px solid #1e1e30',borderRadius:16,padding:36}}>
        <div style={{fontSize:22,fontWeight:800,color:'#e0e0f0',fontFamily:"'Syne',sans-serif",marginBottom:2}}>OptCV</div>
        <div style={{fontSize:10,color:'#2a2a3a',fontFamily:'monospace',marginBottom:28,letterSpacing:'0.06em'}}>AI-POWERED JOB TRACKER</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:9,color:'#333',fontFamily:'monospace',display:'block',marginBottom:5,letterSpacing:'0.1em',textTransform:'uppercase'}}>Email</label>
          <input value={uInput} onChange={e=>setUInput(e.target.value)} placeholder="you@email.com" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:9,color:'#333',fontFamily:'monospace',display:'block',marginBottom:5,letterSpacing:'0.1em',textTransform:'uppercase'}}>Password</label>
          <input type="password" value={pInput} onChange={e=>setPInput(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp}/>
        </div>
        {authErr && <div style={{fontSize:10,color:'#f87171',fontFamily:'monospace',marginBottom:12}}>{authErr}</div>}
        <button onClick={doLogin} style={{width:'100%',padding:'11px',background:'#7c3aed',border:'none',borderRadius:8,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Syne',sans-serif"}}>
          Sign in
        </button>
        <div style={{fontSize:9,color:'#1e1e2e',fontFamily:'monospace',textAlign:'center',marginTop:12}}>
          No Supabase yet? Leave blank and press Sign in for demo mode
        </div>
      </div>
    </div>
  )

  const sel = selected ? {...selected,_match:computeMatch(selected)} : null

  return (
    <div style={{height:'calc(100vh - 48px)',background:'#06060f',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Filter bar */}
      <div style={{background:'#09091400',borderBottom:'1px solid #0e0e18',padding:'8px 18px',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
        {DATE_PRESETS.map(p=>(
          <button key={p} onClick={()=>setDatePreset(p)} style={{padding:'4px 10px',borderRadius:20,border:`1px solid ${datePreset===p?'rgba(124,58,237,.4)':'#14141e'}`,background:datePreset===p?'rgba(124,58,237,.1)':'transparent',color:datePreset===p?'#a78bfa':'#333',fontSize:9,cursor:'pointer',fontFamily:'monospace'}}>{p}</button>
        ))}
        {datePreset==='Custom' && <>
          <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{...inp,width:130,padding:'4px 8px',fontSize:9}}/>
          <span style={{color:'#2a2a3a',fontSize:9}}>→</span>
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{...inp,width:130,padding:'4px 8px',fontSize:9}}/>
        </>}
        <div style={{width:1,height:16,background:'#14141e'}}/>
        {['all','saved','applied'].map(t=>(
          <button key={t} onClick={()=>setFilterTab(t)} style={{padding:'4px 10px',borderRadius:20,border:`1px solid ${filterTab===t?'rgba(124,58,237,.4)':'#14141e'}`,background:filterTab===t?'rgba(124,58,237,.1)':'transparent',color:filterTab===t?'#a78bfa':'#333',fontSize:9,cursor:'pointer',fontFamily:'monospace',textTransform:'capitalize'}}>{t}</button>
        ))}
        <div style={{flex:1}}/>
        {usingMock && <span style={{fontSize:9,color:'#7c3aed',fontFamily:'monospace',background:'rgba(124,58,237,.1)',padding:'2px 8px',borderRadius:20,border:'1px solid rgba(124,58,237,.2)'}}>DEMO</span>}
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search…" style={{...inp,width:160,padding:'5px 10px',fontSize:10}}/>
      </div>

      {/* Criteria bar */}
      <div style={{background:'#06060f',borderBottom:'1px solid #0e0e18',padding:'6px 18px',display:'flex',gap:5,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
        <span style={{fontSize:8,color:'#222',fontFamily:'monospace',letterSpacing:'0.1em',textTransform:'uppercase',marginRight:4}}>Match criteria:</span>
        {CRITERIA.map(c=>(
          <button key={c.id} onClick={()=>setActiveCriteria(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} style={{padding:'3px 9px',borderRadius:20,border:`1px solid ${activeCriteria.includes(c.id)?'rgba(74,222,128,.25)':'#0e0e18'}`,background:activeCriteria.includes(c.id)?'rgba(74,222,128,.07)':'transparent',color:activeCriteria.includes(c.id)?'#4ade80':'#222',fontSize:9,cursor:'pointer',fontFamily:'monospace'}}>{c.label}</button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:9,color:'#222',fontFamily:'monospace'}}>Min {minMatch}%</span>
        <input type="range" min={0} max={90} step={5} value={minMatch} onChange={e=>setMinMatch(+e.target.value)} style={{width:70,accentColor:'#7c3aed'}}/>
      </div>

      {/* Body */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* Left — job list */}
        <div style={{width:300,borderRight:'1px solid #0e0e18',overflow:'auto',flexShrink:0}}>
          {loading && <div style={{padding:32,textAlign:'center',fontSize:11,color:'#2a2a3a',fontFamily:'monospace'}}>Loading…</div>}
          {!loading && Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(date=>(
            <div key={date}>
              <div style={{padding:'9px 14px 5px',fontSize:8,color:'#222',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',position:'sticky',top:0,background:'#06060f',zIndex:2}}>
                {fmtDate(date+'T12:00:00')} · {grouped[date].length}
              </div>
              {grouped[date].map((job,i)=>{
                const active=selected?.id===job.id
                return (
                  <div key={job.id} onClick={()=>setSelected(job)} style={{padding:'11px 14px',cursor:'pointer',background:active?'rgba(124,58,237,.08)':'transparent',borderLeft:`2px solid ${active?'#7c3aed':'transparent'}`,borderBottom:'1px solid #0c0c14',animation:`fadeUp .2s ease ${i*.03}s both`,transition:'background 0.15s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:active?'#e0e0f0':'#aaa',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{job.title}</div>
                        <div style={{fontSize:9,color:'#333',marginTop:1,fontFamily:'monospace'}}>{job.company} · {job.location}</div>
                        <div style={{display:'flex',gap:3,marginTop:5,flexWrap:'wrap',alignItems:'center'}}>
                          {(job.tags||[]).slice(0,2).map(t=><Chip key={t} label={t}/>)}
                          {job.applied && <Chip label="Applied" hi/>}
                          {job.saved   && <span style={{color:'#facc15',fontSize:11}}>★</span>}
                        </div>
                      </div>
                      <ScoreRing value={job._match} size={36} stroke={3}/>
                    </div>
                    <div style={{fontSize:8,color:'#1a1a28',fontFamily:'monospace',marginTop:4}}>{job.board} · {fmtTime(job.created_at)}</div>
                  </div>
                )
              })}
            </div>
          ))}
          {!loading && filtered.length===0 && <div style={{padding:32,textAlign:'center',fontSize:10,color:'#1e1e2e',fontFamily:'monospace'}}>No jobs match filters</div>}
        </div>

        {/* Right — detail */}
        {sel && (
          <div style={{flex:1,overflow:'auto',padding:'22px 26px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18,gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:800,color:'#e0e0f0',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.02em',lineHeight:1.2}}>{sel.title}</div>
                <div style={{fontSize:12,color:'#444',marginTop:4}}>{sel.company} · {sel.location} · {sel.salary}</div>
                <div style={{display:'flex',gap:5,marginTop:8,flexWrap:'wrap'}}>
                  {sel.job_type && <Chip label={sel.job_type}/>}
                  {sel.remote_type && <Chip label={sel.remote_type}/>}
                  {sel.board && <Chip label={sel.board}/>}
                  {(sel.tags||[]).map(t=><Chip key={t} label={t}/>)}
                </div>
              </div>
              <ScoreRing value={sel._match} size={60} stroke={5}/>
            </div>

            {/* Breakdown */}
            <div style={{background:'#0a0a14',border:'1px solid #14141e',borderRadius:10,padding:'14px 18px',marginBottom:18}}>
              <div style={{fontSize:8,color:'#2a2a3a',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:10}}>Match Breakdown</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 20px'}}>
                {CRITERIA.filter(c=>activeCriteria.includes(c.id)).map(c=>(
                  <Bar key={c.id} label={c.label} value={sel[c.id]||0}/>
                ))}
              </div>
              {activeCriteria.length===0 && <div style={{fontSize:10,color:'#1e1e2e',fontFamily:'monospace'}}>Enable criteria above to see breakdown</div>}
            </div>

            {/* Actions */}
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              <button onClick={()=>setCvJob(sel)} style={{padding:'9px 16px',borderRadius:8,background:'#7c3aed',border:'none',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:"'Syne',sans-serif"}}>
                ✦ CV + Cover Letter
              </button>
              <a href={sel.apply_url||'#'} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                <button onClick={()=>markApplied(sel.id)} style={{padding:'9px 16px',borderRadius:8,background:sel.applied?'#0d1a10':'transparent',border:`1px solid ${sel.applied?'#14532d':'#1e1e30'}`,color:sel.applied?'#4ade80':'#555',fontSize:11,cursor:'pointer',fontFamily:"'Syne',sans-serif"}}>
                  {sel.applied?'✓ Applied':'Apply →'}
                </button>
              </a>
              <button onClick={()=>toggleSaved(sel.id)} style={{padding:'9px 12px',borderRadius:8,background:sel.saved?'rgba(250,204,21,.08)':'transparent',border:`1px solid ${sel.saved?'rgba(250,204,21,.3)':'#1e1e30'}`,color:sel.saved?'#facc15':'#333',fontSize:14,cursor:'pointer'}}>
                {sel.saved?'★':'☆'}
              </button>
            </div>

            {/* Description */}
            <div style={{fontSize:11,color:'#444',lineHeight:2,fontFamily:'monospace'}}>
              {(sel.description||'').split('\n').map((line,i)=>{
                if (line.startsWith('**')&&line.endsWith('**')) return <div key={i} style={{color:'#888',fontWeight:700,marginTop:12,marginBottom:2}}>{line.replace(/\*\*/g,'')}</div>
                if (line.startsWith('- ')) return <div key={i} style={{paddingLeft:10,color:'#3a3a4a'}}>· {line.slice(2)}</div>
                return <div key={i}>{line}</div>
              })}
            </div>
          </div>
        )}
      </div>

      {cvJob && <CVModal job={cvJob} onClose={()=>setCvJob(null)}/>}
    </div>
  )
}
