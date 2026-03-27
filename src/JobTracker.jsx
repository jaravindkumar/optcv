import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

// ── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  navy:      '#1a2b4a',
  navyMid:   '#2d4a7a',
  navyLight: '#ebf0fa',
  navyBdr:   '#c3d0e8',
  blue:      '#3b82f6',
  bluePale:  '#eff6ff',
  white:     '#ffffff',
  bg:        '#f4f6f9',
  card:      '#ffffff',
  border:    '#e2e8f0',
  borderDk:  '#cbd5e0',
  text:      '#1a2b4a',
  textMid:   '#4a5568',
  textLight: '#718096',
  textFaint: '#a0aec0',
  green:     '#16a34a',
  greenPale: '#f0fdf4',
  greenBdr:  '#bbf7d0',
  amber:     '#b45309',
  amberPale: '#fffbeb',
  amberBdr:  '#fde68a',
  red:       '#dc2626',
  redPale:   '#fef2f2',
  redBdr:    '#fecaca',
  shadow:    '0 1px 4px rgba(26,43,74,0.08)',
  shadowMd:  '0 4px 16px rgba(26,43,74,0.10)',
  shadowLg:  '0 8px 32px rgba(26,43,74,0.14)',
}

// ── MOCK DATA ────────────────────────────────────────────────────
const MOCK = [
  { id:1, created_at:'2026-03-25T06:00:00Z', title:'Senior AI Product Manager', company:'Wayve', location:'London, UK', salary:'£90,000–£120,000', board:'LinkedIn', job_type:'Full-time', remote_type:'Hybrid', match_score:94, skills_score:96, experience_score:91, seniority_score:95, salary_score:88, location_score:97, industry_score:95, tags:['AI','Product Management','Autonomous Systems'], saved:false, applied:false, status:'shortlisted', notes:'', deadline:'2026-04-10', apply_url:'https://wayve.ai/careers', company_size:'201–500', company_industry:'Autonomous Vehicles', description:`Wayve is building the future of autonomous vehicles using end-to-end deep learning. We are hiring a Senior AI Product Manager to define the roadmap for our core ML platform.\n\nResponsibilities\n- Own the product roadmap for AI training and evaluation\n- Partner with ML researchers to prioritise model improvements\n- Define metrics and success criteria for autonomous driving features\n- Collaborate with BD and commercialisation teams\n\nRequirements\n- 5+ years product management experience in AI or ML products\n- Deep understanding of ML pipelines and data infrastructure\n- Experience in fast-moving deep tech environments\n- Strong written and verbal communication skills` },
  { id:2, created_at:'2026-03-25T06:00:00Z', title:'Data Scientist – Sports Analytics', company:'Hudl', location:'London / Remote', salary:'£70,000–£90,000', board:'Greenhouse', job_type:'Full-time', remote_type:'Remote', match_score:88, skills_score:92, experience_score:85, seniority_score:82, salary_score:90, location_score:85, industry_score:93, tags:['Python','Computer Vision','Sports Technology'], saved:true, applied:false, status:'shortlisted', notes:'Spoke to recruiter on 24 Mar. Follow up next week.', deadline:'2026-04-15', apply_url:'https://hudl.com/jobs', company_size:'501–1000', company_industry:'Sports Technology', description:`Hudl powers performance analysis for over 180,000 teams worldwide. We are hiring a Data Scientist to work on next-generation computer vision features.\n\nResponsibilities\n- Develop and deploy computer vision models for player tracking\n- Build data pipelines from raw video to structured performance metrics\n- Collaborate with product and engineering to ship features\n\nRequirements\n- 3+ years data science experience\n- Strong Python, PyTorch or TensorFlow\n- Experience with video or sports data a strong plus\n- Familiarity with pose estimation or object detection models` },
  { id:3, created_at:'2026-03-25T12:00:00Z', title:'ML Engineer – Digital Health', company:'Huma Therapeutics', location:'London, UK', salary:'£80,000–£100,000', board:'Lever', job_type:'Full-time', remote_type:'Hybrid', match_score:83, skills_score:88, experience_score:84, seniority_score:80, salary_score:82, location_score:90, industry_score:78, tags:['Digital Twins','Healthcare','MLOps'], saved:false, applied:false, status:'shortlisted', notes:'', deadline:'', apply_url:'https://huma.com/careers', company_size:'101–200', company_industry:'Digital Health', description:`Huma builds digital twin software for clinical trials and remote patient monitoring.\n\nResponsibilities\n- Design and implement ML models for patient outcome prediction\n- Work with clinical data pipelines ensuring regulatory compliance\n- Collaborate with clinicians and data scientists to validate models\n\nRequirements\n- 4+ years ML engineering experience\n- Experience with clinical or wearable data strongly preferred\n- Knowledge of GDPR and clinical data standards\n- Strong MLOps background` },
  { id:4, created_at:'2026-03-24T18:00:00Z', title:'Biomechanics Data Scientist', company:'Catapult Sports', location:'London, UK', salary:'£65,000–£85,000', board:'Wellfound', job_type:'Full-time', remote_type:'Hybrid', match_score:91, skills_score:95, experience_score:93, seniority_score:88, salary_score:75, location_score:80, industry_score:98, tags:['Biomechanics','Wearables','Sports Science'], saved:true, applied:true, status:'applied', notes:'Application submitted 22 Mar. Waiting for response.', deadline:'2026-04-01', apply_url:'https://catapultsports.com/careers', company_size:'201–500', company_industry:'Athlete Monitoring', description:`Catapult is the global leader in athlete monitoring technology. We need a Biomechanics Data Scientist for injury prevention models.\n\nResponsibilities\n- Build biomechanical feature extraction pipelines from IMU sensor data\n- Develop injury risk prediction models validated against clinical outcomes\n- Work with elite sports organisations including NFL and Premier League\n\nRequirements\n- Background in biomechanics or movement science\n- Strong Python and signal processing skills\n- Experience with wearable sensor data\n- Knowledge of musculoskeletal modelling a significant plus` },
  { id:5, created_at:'2026-03-24T12:00:00Z', title:'AI Research Engineer', company:'Magic Pony Technology', location:'London, UK', salary:'£85,000–£115,000', board:'Adzuna', job_type:'Full-time', remote_type:'On-site', match_score:76, skills_score:80, experience_score:78, seniority_score:70, salary_score:85, location_score:90, industry_score:72, tags:['Research','Deep Learning','Generative AI'], saved:false, applied:false, status:'shortlisted', notes:'', deadline:'', apply_url:'#', company_size:'11–50', company_industry:'AI Research', description:`Magic Pony Technology is hiring an AI Research Engineer to advance generative video models.\n\nResponsibilities\n- Research and implement novel generative model architectures\n- Run large-scale training experiments on GPU clusters\n- Publish findings and contribute to open-source projects\n\nRequirements\n- PhD or equivalent research experience in deep learning\n- Strong publication record preferred\n- Expert in PyTorch, CUDA programming a plus\n- Experience with diffusion models or video generation` },
  { id:6, created_at:'2026-03-23T18:00:00Z', title:'Product Engineer – AI Tools', company:'Cleo', location:'London, UK', salary:'£75,000–£95,000', board:'Otta', job_type:'Full-time', remote_type:'Hybrid', match_score:71, skills_score:74, experience_score:72, seniority_score:68, salary_score:80, location_score:90, industry_score:65, tags:['Fintech','AI','Full-stack'], saved:false, applied:true, status:'interview', notes:'First interview scheduled 28 Mar at 14:00.', deadline:'', apply_url:'#', company_size:'201–500', company_industry:'Fintech', description:`Cleo is an AI-powered financial assistant used by 6M+ people.\n\nResponsibilities\n- Build full-stack features across mobile and web apps\n- Define AI-driven personalisation features\n- Own features end-to-end from scoping to production\n\nRequirements\n- 3+ years product engineering experience\n- Strong React Native or React experience\n- Comfortable working with LLM APIs and prompt engineering` },
  { id:7, created_at:'2026-03-22T06:00:00Z', title:'Senior Data Scientist', company:'Monzo', location:'London, UK', salary:'£85,000–£110,000', board:'LinkedIn', job_type:'Full-time', remote_type:'Hybrid', match_score:68, skills_score:72, experience_score:70, seniority_score:65, salary_score:88, location_score:90, industry_score:60, tags:['Fintech','ML','Personalisation'], saved:false, applied:false, status:'shortlisted', notes:'', deadline:'', apply_url:'#', company_size:'1001–5000', company_industry:'Fintech / Banking', description:`Monzo is building the best bank in the world. We need a Senior Data Scientist for personalised financial insights.\n\nResponsibilities\n- Build recommendation and personalisation models at scale\n- Run A/B experiments and analyse causal impact\n- Work with product teams to define and measure success\n\nRequirements\n- 5+ years data science experience in consumer products\n- Strong SQL, Python, and experimentation methodology\n- Experience with recommendation systems or personalisation` },
]

const CRITERIA = [
  { id:'skills_score',     label:'Skills'     },
  { id:'experience_score', label:'Experience' },
  { id:'seniority_score',  label:'Seniority'  },
  { id:'salary_score',     label:'Salary'     },
  { id:'location_score',   label:'Location'   },
  { id:'industry_score',   label:'Industry'   },
]

const DATE_PRESETS  = ['Today','3 days','Week','Month','Custom']
const KANBAN_COLS   = [
  { id:'shortlisted', label:'Shortlisted',  color:'#3b82f6' },
  { id:'applied',     label:'Applied',      color:'#7c3aed' },
  { id:'interview',   label:'Interview',    color:'#d97706' },
  { id:'offer',       label:'Offer',        color:'#16a34a' },
  { id:'rejected',    label:'Rejected',     color:'#dc2626' },
]

// ── HELPERS ──────────────────────────────────────────────────────
const scoreColor  = s => s >= 88 ? T.green : s >= 72 ? T.amber : T.red
const scorePale   = s => s >= 88 ? T.greenPale : s >= 72 ? T.amberPale : T.redPale
const scoreBdr    = s => s >= 88 ? T.greenBdr : s >= 72 ? T.amberBdr : T.redBdr
const fmtDate     = d => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
const fmtDateShort= d => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})
const fmtTime     = d => new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
const fmtDeadline = d => { if (!d) return null; const diff=Math.ceil((new Date(d)-new Date())/86400000); return { label: diff<=0?'Overdue':diff===1?'Tomorrow':`${diff} days`, urgent: diff<=3 } }

function ScoreBadge({ value, size=42 }) {
  const col = scoreColor(value)
  const r=(size-5)/2, circ=2*Math.PI*r
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', position:'absolute', inset:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 0.5s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:size*.22, fontWeight:700, color:col, lineHeight:1 }}>{value}</span>
      </div>
    </div>
  )
}

function MatchBar({ label, value }) {
  const col = scoreColor(value)
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:12, color:T.textMid, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:col }}>{value}%</span>
      </div>
      <div style={{ height:4, background:T.border, borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value}%`, background:col, borderRadius:4, transition:'width 0.5s ease' }}/>
      </div>
    </div>
  )
}

function Pill({ label, color='default', small=false }) {
  const styles = {
    default: { bg:'#f1f5f9', color:T.textMid, border:T.border },
    blue:    { bg:T.bluePale, color:'#1d4ed8', border:'#bfdbfe' },
    green:   { bg:T.greenPale, color:T.green, border:T.greenBdr },
    amber:   { bg:T.amberPale, color:T.amber, border:T.amberBdr },
    red:     { bg:T.redPale, color:T.red, border:T.redBdr },
    navy:    { bg:T.navyLight, color:T.navy, border:T.navyBdr },
  }
  const s = styles[color] || styles.default
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      fontSize: small ? 10 : 11, padding: small ? '2px 7px' : '3px 10px',
      borderRadius:4, fontWeight:500, whiteSpace:'nowrap',
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
    }}>{label}</span>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:'16px 20px', boxShadow:T.shadow, flex:1, minWidth:0 }}>
      <div style={{ fontSize:11, color:T.textLight, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color: accent || T.navy, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:T.textLight, marginTop:4 }}>{sub}</div>}
    </div>
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
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1500,
          messages:[{ role:'user', content:`You are a professional CV writer. Tailor this candidate's CV for the specific role below.

CANDIDATE PROFILE:
Name: Aravind Kumar Jaishankar
Current Role: Research Associate, Imperial College London
Education: PhD, Max Planck Institute / Harvard University (Biomechanics & Computational Design)
Skills: Python, AI/ML, Digital Twins, Computer Vision, Biomechanics, MediaPipe, MATLAB, Rhino/Grasshopper
Patent: WO2022177571A1
Notable: Published in top-tier journals. NHS clinical deployment experience. Sports tech side projects.

TARGET ROLE: ${job.title} at ${job.company}
Industry: ${job.company_industry || 'Technology'}
Required skills: ${(job.tags||[]).join(', ')}
Job description excerpt: ${(job.description||'').slice(0,700)}

Return ONLY raw JSON with no markdown fences:
{
  "summary": "3-sentence professional summary. Specific to this role. Demonstrates direct relevance.",
  "experience": [
    {
      "role": "Research Associate",
      "org": "Imperial College London",
      "period": "2023 – Present",
      "bullets": ["Achievement bullet 1 tailored to ${job.title}", "Achievement bullet 2", "Achievement bullet 3"]
    },
    {
      "role": "Musculoskeletal Simulation Engineer",
      "org": "Philomec Inc., Canada",
      "period": "2021 – 2023",
      "bullets": ["Tailored bullet 1", "Tailored bullet 2"]
    },
    {
      "role": "Research Fellow",
      "org": "SUTD / HP-NTU Digital Manufacturing Lab",
      "period": "2018 – 2021",
      "bullets": ["Tailored bullet 1", "Tailored bullet 2"]
    }
  ],
  "coverLetter": "Four paragraphs. Opening: why this role and company specifically. Second: most relevant experience with concrete results. Third: what you bring that others do not. Closing: clear call to action. Professional and direct. No generic phrases."
}` }]
        })
      })
      const d = await res.json()
      const text = d.content?.[0]?.text || '{}'
      setCvData(JSON.parse(text.replace(/```json|```/g,'').trim()))
    } catch {
      setCvData({
        summary:`Research engineer with a PhD from Max Planck Institute and Harvard, currently delivering AI-powered digital twin systems at Imperial College London with NHS partners. Proven ability to bridge deep technical research and real-world deployment, with direct experience in ${(job.tags||[]).slice(0,2).join(' and ')} — core requirements for this ${job.title} role at ${job.company}.`,
        experience:[
          { role:'Research Associate', org:'Imperial College London', period:'2023 – Present', bullets:[`Architected and deployed AI-powered digital twin platform for personalised medical device optimisation in partnership with NHS organisations`,`Built production computer vision pipelines using Python and MediaPipe, processing clinical motion data for real-time biomechanical analysis`,`Led cross-functional collaboration with clinicians, engineers, and product stakeholders to deliver research outcomes into clinical practice`]},
          { role:'Musculoskeletal Simulation Engineer', org:'Philomec Inc., Canada', period:'2021 – 2023', bullets:[`Developed subject-specific musculoskeletal models from VICON motion capture data for clinical and performance applications`,`Delivered validated simulation outputs to orthopaedic surgeons and elite sports teams, reducing analysis time by 60%`]},
          { role:'Research Fellow', org:'SUTD / HP-NTU Digital Manufacturing Lab', period:'2018 – 2021', bullets:[`Led computational design research resulting in international patent WO2022177571A1 and publications in top-tier journals`,`Developed parametric design tools in Rhino/Grasshopper and MATLAB bridging simulation fidelity with manufacturing constraints`]},
        ],
        coverLetter:`Dear Hiring Team,\n\nI am writing to apply for the ${job.title} position at ${job.company}. Having spent the past several years building AI-powered systems at the intersection of research and clinical deployment — most recently at Imperial College London in partnership with NHS organisations — I believe my background maps closely to what you are looking for.\n\nMy work centres on taking complex computational methods and making them practical: building pipelines that work outside of a lab, with real constraints and real users. At Imperial, I architected a digital twin system for personalised medical devices that moved from prototype to NHS clinical use. Prior to that, at Philomec in Canada, I delivered subject-specific biomechanical models to surgeons and elite sports teams, reducing analysis cycles significantly. Throughout, I have worked across Python, computer vision, ML pipelines, and multidisciplinary teams — all directly relevant to the ${job.title} role.\n\nWhat I bring beyond the technical skills is the ability to work in ambiguous, fast-moving environments where research rigour and product delivery must coexist. I hold an international patent and a publication record in top-tier journals, but I am equally comfortable shipping production code and collaborating with non-technical stakeholders.\n\nI would welcome the opportunity to discuss how my experience aligns with your team's work. Thank you for your time and consideration.\n\nBest regards,\nAravind Kumar Jaishankar`,
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
    const lines = tab === 'cv' ? [
      'ARAVIND KUMAR JAISHANKAR',
      'aravind@example.com  |  +44 7700 000000  |  London, UK',
      'linkedin.com/in/aravindkj  |  Patent: WO2022177571A1',
      '', '─'.repeat(60),
      'PROFESSIONAL SUMMARY',
      '─'.repeat(60),
      cvData?.summary || '',
      '', '─'.repeat(60),
      'PROFESSIONAL EXPERIENCE',
      '─'.repeat(60),
      ...(cvData?.experience||[]).flatMap(e => [
        `${e.role}`, `${e.org}  |  ${e.period}`,
        ...(e.bullets||[]).map(b=>`  •  ${b}`), ''
      ]),
      '─'.repeat(60),
      'EDUCATION',
      '─'.repeat(60),
      'PhD – Biomechanics & Computational Design',
      'Max Planck Institute / Harvard University  |  2018', '',
      'MEng – Mechanical Engineering',
      'National University of Singapore  |  2014',
      '', '─'.repeat(60),
      'SKILLS',
      '─'.repeat(60),
      'Python  |  MATLAB  |  MediaPipe  |  Digital Twins  |  Computer Vision',
      'AI/ML  |  Rhino/Grasshopper  |  VICON Motion Capture  |  Streamlit',
    ] : [cvData?.coverLetter || '']
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'}))
    a.download = `${tab==='cv'?'CV':'CoverLetter'}_${job.company.replace(/\s/g,'_')}_${job.title.replace(/\s/g,'_')}.txt`
    a.click()
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'min(760px,97vw)', maxHeight:'94vh', background:T.white, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:T.shadowLg }}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:T.navy }}>Application Documents</div>
            <div style={{ fontSize:12, color:T.textLight, marginTop:2 }}>{job.title} — {job.company}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {!cvData && !loading && (
              <button onClick={generate} style={{ padding:'8px 18px', borderRadius:8, background:T.navy, border:'none', color:T.white, fontSize:12, fontWeight:600 }}>
                Generate with Claude
              </button>
            )}
            {cvData && <>
              <button onClick={saveDoc} style={{ padding:'8px 14px', borderRadius:8, background:saved?T.greenPale:T.bg, border:`1px solid ${saved?T.greenBdr:T.border}`, color:saved?T.green:T.textMid, fontSize:12, fontWeight:500 }}>
                {saved ? 'Saved' : 'Save to account'}
              </button>
              <button onClick={download} style={{ padding:'8px 14px', borderRadius:8, background:T.navyLight, border:`1px solid ${T.navyBdr}`, color:T.navy, fontSize:12, fontWeight:600 }}>
                Download .txt
              </button>
            </>}
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, color:T.textMid, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, background:'#fafbfc', flexShrink:0 }}>
          {[['cv','Tailored CV'],['cover','Cover Letter']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:tab===id?`2px solid ${T.navy}`:'2px solid transparent', color:tab===id?T.navy:T.textLight, fontSize:13, fontWeight:tab===id?600:400 }}>{lbl}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'auto', padding:28, background:'#fafbfc' }}>
          {!cvData && !loading && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:T.navyLight, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:T.navy, marginBottom:6 }}>Generate tailored documents</div>
              <div style={{ fontSize:13, color:T.textLight, maxWidth:320, margin:'0 auto' }}>Claude will tailor your CV and write a personalised cover letter for this specific role at {job.company}.</div>
            </div>
          )}
          {loading && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:14, color:T.navy, fontWeight:500, marginBottom:8 }}>Generating your documents...</div>
              <div style={{ fontSize:12, color:T.textLight }}>Claude is tailoring your CV and cover letter. This takes about 15 seconds.</div>
            </div>
          )}
          {cvData && tab==='cv' && (
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:32, boxShadow:T.shadow }}>
              <div style={{ borderBottom:`2px solid ${T.navy}`, paddingBottom:12, marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:800, color:T.navy }}>Aravind Kumar Jaishankar</div>
                <div style={{ fontSize:12, color:T.textMid, marginTop:4 }}>aravind@example.com  ·  +44 7700 000000  ·  London, UK</div>
                <div style={{ fontSize:12, color:T.textMid }}>linkedin.com/in/aravindkj  ·  Patent: WO2022177571A1</div>
              </div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.navy, marginBottom:8 }}>Professional Summary</div>
              <div style={{ fontSize:13, color:T.textMid, lineHeight:1.8, marginBottom:20 }}>{cvData.summary}</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.navy, marginBottom:12, paddingTop:12, borderTop:`1px solid ${T.border}` }}>Experience</div>
              {(cvData.experience||[]).map((e,i)=>(
                <div key={i} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.navy }}>{e.role}</div>
                    <div style={{ fontSize:11, color:T.textLight, whiteSpace:'nowrap', marginLeft:12 }}>{e.period}</div>
                  </div>
                  <div style={{ fontSize:12, color:T.textMid, marginBottom:6 }}>{e.org}</div>
                  {(e.bullets||[]).map((b,j)=><div key={j} style={{ fontSize:13, color:T.textMid, paddingLeft:16, marginBottom:4, lineHeight:1.6, position:'relative' }}><span style={{ position:'absolute', left:0, color:T.navy }}>•</span>{b}</div>)}
                </div>
              ))}
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.navy, marginBottom:10, paddingTop:12, borderTop:`1px solid ${T.border}` }}>Education</div>
              <div style={{ fontSize:13, fontWeight:600, color:T.navy }}>PhD – Biomechanics & Computational Design</div>
              <div style={{ fontSize:12, color:T.textMid, marginBottom:10 }}>Max Planck Institute / Harvard University  ·  2018</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.navy, marginBottom:8, paddingTop:12, borderTop:`1px solid ${T.border}` }}>Skills</div>
              <div style={{ fontSize:13, color:T.textMid }}>Python  ·  MATLAB  ·  MediaPipe  ·  Digital Twins  ·  Computer Vision  ·  AI/ML  ·  Rhino/Grasshopper  ·  VICON Motion Capture</div>
            </div>
          )}
          {cvData && tab==='cover' && (
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:32, boxShadow:T.shadow }}>
              <div style={{ fontSize:13, color:T.textMid, lineHeight:2.1, whiteSpace:'pre-wrap' }}>{cvData.coverLetter}</div>
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
  const [viewMode, setViewMode]   = useState('list')   // 'list' | 'kanban'
  const [datePreset, setDatePreset]         = useState('Week')
  const [customFrom, setCustomFrom]         = useState('')
  const [customTo, setCustomTo]             = useState('')
  const [activeCriteria, setActiveCriteria] = useState(CRITERIA.map(c=>c.id))
  const [filterTab, setFilterTab]           = useState('all')
  const [minMatch, setMinMatch]             = useState(0)
  const [searchQ, setSearchQ]               = useState('')
  const [editingNote, setEditingNote]       = useState(false)
  const [noteVal, setNoteVal]               = useState('')
  const noteRef = useRef(null)

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
      } catch { setJobs(MOCK); setSelected(MOCK[0]); setUsingMock(true) }
      setLoading(false)
    })()
  }, [user])

  const updateJob = async (id, updates) => {
    setJobs(p=>p.map(j=>j.id===id?{...j,...updates}:j))
    if (selected?.id===id) setSelected(p=>({...p,...updates}))
    if (!usingMock) await supabase.from('jobs').update(updates).eq('id',id)
  }

  const exportCSV = () => {
    const cols = ['title','company','location','salary','board','match_score','status','saved','applied','deadline','apply_url']
    const rows = [cols.join(','), ...filtered.map(j=>cols.map(c=>`"${(j[c]||'').toString().replace(/"/g,'""')}"`).join(','))]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}))
    a.download = `optcv_jobs_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
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

  const stats = useMemo(() => ({
    total:    jobs.length,
    applied:  jobs.filter(j=>j.applied).length,
    saved:    jobs.filter(j=>j.saved).length,
    avgMatch: jobs.length ? Math.round(jobs.reduce((s,j)=>s+(j.match_score||0),0)/jobs.length) : 0,
    topMatch: jobs.length ? Math.max(...jobs.map(j=>j.match_score||0)) : 0,
  }), [jobs])

  const inp = (extra={}) => ({ background:T.white, border:`1px solid ${T.border}`, borderRadius:8, padding:'9px 13px', color:T.text, fontSize:13, outline:'none', width:'100%', ...extra })

  // ── LOGIN ──────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg, #1a2b4a 0%, #2d4a7a 60%, #1a2b4a 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:400, background:T.white, borderRadius:20, padding:44, boxShadow:T.shadowLg }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:T.navy, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#60a5fa"/>
            </svg>
          </div>
          <div style={{ fontSize:24, fontWeight:800, color:T.navy, letterSpacing:'-0.03em' }}>OptCV</div>
          <div style={{ fontSize:13, color:T.textLight, marginTop:4 }}>AI-Powered Job Search Platform</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:T.textMid, display:'block', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Email</label>
          <input value={uInput} onChange={e=>setUInput(e.target.value)} placeholder="you@email.com" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp()}/>
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:11, color:T.textMid, display:'block', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Password</label>
          <input type="password" value={pInput} onChange={e=>setPInput(e.target.value)} placeholder="Enter your password" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={inp()}/>
        </div>
        {authErr && <div style={{ fontSize:12, color:T.red, marginBottom:16, background:T.redPale, padding:'10px 14px', borderRadius:8, border:`1px solid ${T.redBdr}` }}>{authErr}</div>}
        <button onClick={doLogin} style={{ width:'100%', padding:'13px', background:T.navy, border:'none', borderRadius:10, color:T.white, fontSize:14, fontWeight:700 }}>
          Sign in to OptCV
        </button>
        <div style={{ fontSize:11, color:T.textFaint, textAlign:'center', marginTop:16 }}>No Supabase configured? Leave blank to enter demo mode.</div>
      </div>
    </div>
  )

  const sel = selected ? {...selected,_match:computeMatch(selected)} : null

  return (
    <div style={{ height:'calc(100vh - 58px)', background:T.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Stats bar */}
      <div style={{ padding:'14px 24px 0', flexShrink:0 }}>
        <div style={{ display:'flex', gap:12, marginBottom:14 }}>
          <StatCard label="Total Jobs" value={stats.total} sub={usingMock?'Demo data':'From all boards'}/>
          <StatCard label="Applied" value={stats.applied} sub={`${stats.total?Math.round(stats.applied/stats.total*100):0}% of total`} accent={T.blue}/>
          <StatCard label="Saved" value={stats.saved} sub="Shortlisted for review" accent={T.amber}/>
          <StatCard label="Avg Match" value={`${stats.avgMatch}%`} sub={`Best: ${stats.topMatch}%`} accent={scoreColor(stats.avgMatch)}/>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding:'0 24px', flexShrink:0 }}>
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 16px', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', boxShadow:T.shadow }}>

          {/* Date presets */}
          <div style={{ display:'flex', gap:4 }}>
            {DATE_PRESETS.map(p=>(
              <button key={p} onClick={()=>setDatePreset(p)} style={{ padding:'5px 11px', borderRadius:6, border:`1px solid ${datePreset===p?T.navy:T.border}`, background:datePreset===p?T.navy:'transparent', color:datePreset===p?T.white:T.textMid, fontSize:11, fontWeight:datePreset===p?600:400 }}>{p}</button>
            ))}
          </div>

          {datePreset==='Custom' && (
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={inp({width:130,padding:'5px 8px',fontSize:11})}/>
              <span style={{ color:T.textFaint, fontSize:11 }}>to</span>
              <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={inp({width:130,padding:'5px 8px',fontSize:11})}/>
            </div>
          )}

          <div style={{ width:1, height:20, background:T.border }}/>

          {/* Status tabs */}
          {['all','saved','applied'].map(t=>(
            <button key={t} onClick={()=>setFilterTab(t)} style={{ padding:'5px 11px', borderRadius:6, border:`1px solid ${filterTab===t?T.navy:T.border}`, background:filterTab===t?T.navy:'transparent', color:filterTab===t?T.white:T.textMid, fontSize:11, fontWeight:filterTab===t?600:400, textTransform:'capitalize' }}>{t}</button>
          ))}

          <div style={{ flex:1 }}/>

          {/* View toggle */}
          <div style={{ display:'flex', border:`1px solid ${T.border}`, borderRadius:7, overflow:'hidden' }}>
            {[['list','List'],['kanban','Kanban']].map(([v,lbl])=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{ padding:'5px 12px', background:viewMode===v?T.navy:'transparent', border:'none', color:viewMode===v?T.white:T.textMid, fontSize:11, fontWeight:viewMode===v?600:400 }}>{lbl}</button>
            ))}
          </div>

          {/* Search */}
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search roles, companies, tags..." style={inp({width:220,padding:'6px 12px',fontSize:12})}/>

          {/* Export */}
          <button onClick={exportCSV} style={{ padding:'6px 12px', borderRadius:7, background:T.navyLight, border:`1px solid ${T.navyBdr}`, color:T.navy, fontSize:11, fontWeight:600 }}>
            Export CSV
          </button>
        </div>

        {/* Criteria bar */}
        <div style={{ display:'flex', gap:6, alignItems:'center', padding:'10px 0', flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:T.textLight, fontWeight:600 }}>Score by:</span>
          {CRITERIA.map(c=>(
            <button key={c.id} onClick={()=>setActiveCriteria(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} style={{ padding:'4px 11px', borderRadius:6, border:`1px solid ${activeCriteria.includes(c.id)?T.green:T.border}`, background:activeCriteria.includes(c.id)?T.greenPale:'transparent', color:activeCriteria.includes(c.id)?T.green:T.textLight, fontSize:11, fontWeight:activeCriteria.includes(c.id)?600:400 }}>{c.label}</button>
          ))}
          <div style={{ flex:1 }}/>
          <span style={{ fontSize:11, color:T.textLight }}>Min {minMatch}%</span>
          <input type="range" min={0} max={90} step={5} value={minMatch} onChange={e=>setMinMatch(+e.target.value)} style={{ width:80, accentColor:T.navy }}/>
          {usingMock && <Pill label="Demo Mode" color="amber" small/>}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflow:'hidden', padding:'0 24px 24px' }}>

        {/* ── LIST VIEW ── */}
        {viewMode==='list' && (
          <div style={{ display:'flex', gap:16, height:'100%', overflow:'hidden' }}>

            {/* Left panel */}
            <div style={{ width:340, display:'flex', flexDirection:'column', overflow:'hidden', background:T.white, border:`1px solid ${T.border}`, borderRadius:12, boxShadow:T.shadow }}>
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                <span style={{ fontSize:12, fontWeight:600, color:T.navy }}>{filtered.length} jobs</span>
              </div>
              <div style={{ flex:1, overflow:'auto' }}>
                {loading && <div style={{ padding:32, textAlign:'center', fontSize:13, color:T.textLight }}>Loading jobs...</div>}
                {!loading && Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(date=>(
                  <div key={date}>
                    <div style={{ padding:'8px 16px', fontSize:10, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase', position:'sticky', top:0, background:'#f8fafc', borderBottom:`1px solid ${T.border}`, zIndex:2 }}>
                      {fmtDate(date+'T12:00:00')} — {grouped[date].length}
                    </div>
                    {grouped[date].map((job,i)=>{
                      const active=selected?.id===job.id
                      const dl=fmtDeadline(job.deadline)
                      return (
                        <div key={job.id} onClick={()=>setSelected(job)} style={{ padding:'14px 16px', cursor:'pointer', background:active?T.navyLight:T.white, borderLeft:`3px solid ${active?T.navy:'transparent'}`, borderBottom:`1px solid ${T.border}`, animation:`fadeUp .18s ease ${i*.03}s both`, transition:'background 0.1s' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:active?T.navy:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{job.title}</div>
                              <div style={{ fontSize:11, color:T.textMid, marginTop:2 }}>{job.company} · {job.location}</div>
                              <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
                                <Pill label={job.remote_type||'On-site'} small/>
                                {job.saved   && <Pill label="Saved" color="amber" small/>}
                                {job.applied && <Pill label="Applied" color="green" small/>}
                                {dl && <Pill label={dl.label} color={dl.urgent?'red':'default'} small/>}
                              </div>
                            </div>
                            <ScoreBadge value={job._match} size={40}/>
                          </div>
                          <div style={{ fontSize:10, color:T.textFaint, marginTop:6 }}>{job.board} · {fmtTime(job.created_at)}</div>
                        </div>
                      )
                    })}
                    {!loading && filtered.length===0 && <div style={{ padding:32, textAlign:'center', fontSize:13, color:T.textLight }}>No jobs match your filters</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            {sel ? (
              <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:16 }}>

                {/* Job header card */}
                <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:24, boxShadow:T.shadow }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:T.navy, lineHeight:1.2, marginBottom:4 }}>{sel.title}</div>
                      <div style={{ fontSize:14, color:T.textMid, marginBottom:10 }}>{sel.company} · {sel.location} · {sel.salary}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {sel.job_type    && <Pill label={sel.job_type}/>}
                        {sel.remote_type && <Pill label={sel.remote_type}/>}
                        {sel.board       && <Pill label={sel.board} color="navy"/>}
                        {(sel.tags||[]).map(t=><Pill key={t} label={t}/>)}
                      </div>
                    </div>
                    <div style={{ textAlign:'center', background:T.bg, borderRadius:12, padding:'14px 18px', border:`1px solid ${T.border}` }}>
                      <ScoreBadge value={sel._match} size={56}/>
                      <div style={{ fontSize:9, color:T.textLight, marginTop:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Match Score</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button onClick={()=>setCvJob(sel)} style={{ padding:'9px 18px', borderRadius:8, background:T.navy, border:'none', color:T.white, fontSize:12, fontWeight:600, boxShadow:`0 2px 8px rgba(26,43,74,0.25)` }}>
                      Generate CV + Cover Letter
                    </button>
                    <a href={sel.apply_url||'#'} target="_blank" rel="noreferrer">
                      <button onClick={()=>updateJob(sel.id,{applied:true,applied_at:new Date().toISOString(),status:'applied'})} style={{ padding:'9px 18px', borderRadius:8, background:sel.applied?T.greenPale:T.white, border:`1px solid ${sel.applied?T.greenBdr:T.border}`, color:sel.applied?T.green:T.textMid, fontSize:12, fontWeight:600 }}>
                        {sel.applied ? 'Applied' : 'Apply Now'}
                      </button>
                    </a>
                    <button onClick={()=>updateJob(sel.id,{saved:!sel.saved})} style={{ padding:'9px 18px', borderRadius:8, background:sel.saved?T.amberPale:T.white, border:`1px solid ${sel.saved?T.amberBdr:T.border}`, color:sel.saved?T.amber:T.textMid, fontSize:12, fontWeight:600 }}>
                      {sel.saved ? 'Saved' : 'Save'}
                    </button>
                    <select value={sel.status||'shortlisted'} onChange={e=>updateJob(sel.id,{status:e.target.value})} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${T.border}`, background:T.white, color:T.textMid, fontSize:12, fontWeight:500 }}>
                      {KANBAN_COLS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Match + Company row */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                  {/* Match breakdown */}
                  <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:20, boxShadow:T.shadow }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>Match Breakdown</div>
                    {CRITERIA.filter(c=>activeCriteria.includes(c.id)).map(c=>(
                      <MatchBar key={c.id} label={c.label} value={sel[c.id]||0}/>
                    ))}
                    {activeCriteria.length===0 && <div style={{ fontSize:12, color:T.textLight }}>Enable scoring criteria above</div>}
                  </div>

                  {/* Company info */}
                  <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:20, boxShadow:T.shadow }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>Company Info</div>
                    {[
                      ['Company', sel.company],
                      ['Industry', sel.company_industry||'—'],
                      ['Size', sel.company_size||'—'],
                      ['Location', sel.location],
                      ['Source', sel.board],
                      ['Salary', sel.salary],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
                        <span style={{ color:T.textLight, fontWeight:500 }}>{k}</span>
                        <span style={{ color:T.navy, fontWeight:600, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                      </div>
                    ))}
                    {sel.deadline && (
                      <div style={{ marginTop:12 }}>
                        {(() => { const dl=fmtDeadline(sel.deadline); return dl ? <Pill label={`Deadline: ${fmtDateShort(sel.deadline)} (${dl.label})`} color={dl.urgent?'red':'amber'}/> : null })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:20, boxShadow:T.shadow }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>Private Notes</div>
                    {!editingNote
                      ? <button onClick={()=>{setEditingNote(true);setNoteVal(sel.notes||'');setTimeout(()=>noteRef.current?.focus(),50)}} style={{ fontSize:11, color:T.navy, background:T.navyLight, border:`1px solid ${T.navyBdr}`, padding:'4px 10px', borderRadius:6, fontWeight:600 }}>Edit</button>
                      : <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>{updateJob(sel.id,{notes:noteVal});setEditingNote(false)}} style={{ fontSize:11, color:T.white, background:T.navy, border:'none', padding:'4px 10px', borderRadius:6, fontWeight:600 }}>Save</button>
                          <button onClick={()=>setEditingNote(false)} style={{ fontSize:11, color:T.textMid, background:T.bg, border:`1px solid ${T.border}`, padding:'4px 10px', borderRadius:6 }}>Cancel</button>
                        </div>
                    }
                  </div>
                  {editingNote
                    ? <textarea ref={noteRef} value={noteVal} onChange={e=>setNoteVal(e.target.value)} placeholder="Add notes about this role — recruiter name, interview details, follow-up actions..." style={{ width:'100%', minHeight:80, resize:'vertical', ...inp(), fontSize:13, lineHeight:1.6 }}/>
                    : <div style={{ fontSize:13, color:sel.notes?T.textMid:T.textFaint, lineHeight:1.7, whiteSpace:'pre-wrap', minHeight:40 }}>{sel.notes || 'No notes yet. Click Edit to add details about this role.'}</div>
                  }
                </div>

                {/* Job description */}
                <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:24, boxShadow:T.shadow }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Job Description</div>
                  <div style={{ fontSize:13, color:T.textMid, lineHeight:1.9 }}>
                    {(sel.description||'').split('\n').map((line,i)=>{
                      if (!line.trim()) return <div key={i} style={{ height:8 }}/>
                      if (/^[A-Z][^a-z]{3,}$/.test(line.trim())) return <div key={i} style={{ fontSize:12, fontWeight:700, color:T.navy, marginTop:12, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{line}</div>
                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) return <div key={i} style={{ paddingLeft:16, marginBottom:4, position:'relative' }}><span style={{ position:'absolute', left:0, color:T.navy }}>•</span>{line.replace(/^[-•]\s*/,'')}</div>
                      return <div key={i}>{line}</div>
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:T.textLight, fontSize:14 }}>
                Select a job to view details
              </div>
            )}
          </div>
        )}

        {/* ── KANBAN VIEW ── */}
        {viewMode==='kanban' && (
          <div style={{ display:'flex', gap:14, height:'100%', overflowX:'auto', overflowY:'hidden' }}>
            {KANBAN_COLS.map(col=>{
              const colJobs = filtered.filter(j=>(j.status||'shortlisted')===col.id)
              return (
                <div key={col.id} style={{ width:280, minWidth:280, display:'flex', flexDirection:'column', background:T.white, border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden', boxShadow:T.shadow }}>
                  <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafbfc' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:col.color }}/>
                      <span style={{ fontSize:12, fontWeight:700, color:T.navy }}>{col.label}</span>
                    </div>
                    <span style={{ fontSize:11, color:T.textLight, background:T.border, padding:'1px 8px', borderRadius:20, fontWeight:600 }}>{colJobs.length}</span>
                  </div>
                  <div style={{ flex:1, overflow:'auto', padding:10, display:'flex', flexDirection:'column', gap:8 }}>
                    {colJobs.map((job,i)=>{
                      const dl=fmtDeadline(job.deadline)
                      return (
                        <div key={job.id} onClick={()=>{setSelected(job);setViewMode('list')}} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:9, padding:14, cursor:'pointer', animation:`fadeUp .2s ease ${i*.04}s both`, boxShadow:T.shadow, transition:'box-shadow 0.15s', borderLeft:`3px solid ${col.color}` }}>
                          <div style={{ fontSize:12, fontWeight:700, color:T.navy, marginBottom:3, lineHeight:1.3 }}>{job.title}</div>
                          <div style={{ fontSize:11, color:T.textMid, marginBottom:8 }}>{job.company}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div style={{ fontSize:11, color:scoreColor(job._match), fontWeight:700, background:scorePale(job._match), border:`1px solid ${scoreBdr(job._match)}`, padding:'2px 8px', borderRadius:4 }}>{job._match}% match</div>
                            {dl && <Pill label={dl.label} color={dl.urgent?'red':'default'} small/>}
                          </div>
                          {job.notes && <div style={{ fontSize:10, color:T.textLight, marginTop:8, lineHeight:1.5, borderTop:`1px solid ${T.border}`, paddingTop:6 }}>{job.notes.slice(0,80)}{job.notes.length>80?'...':''}</div>}
                        </div>
                      )
                    })}
                    {colJobs.length===0 && (
                      <div style={{ padding:'20px 0', textAlign:'center', fontSize:12, color:T.textFaint }}>No jobs here</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {cvJob && <CVModal job={cvJob} onClose={()=>setCvJob(null)}/>}
    </div>
  )
}
