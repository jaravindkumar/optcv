import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

const T = {
  navy:      '#1a2b4a', navyMid: '#2d4a7a', navyLight: '#ebf0fa', navyBdr: '#c3d0e8',
  blue:      '#3b82f6', bluePale: '#eff6ff',
  white:     '#ffffff', bg: '#f4f6f9',
  border:    '#e2e8f0', borderDk: '#cbd5e0',
  text:      '#1a2b4a', textMid: '#4a5568', textLight: '#718096', textFaint: '#a0aec0',
  green:     '#16a34a', greenPale: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:     '#b45309', amberPale: '#fffbeb', amberBdr: '#fde68a',
  red:       '#dc2626', redPale: '#fef2f2', redBdr: '#fecaca',
  shadow:    '0 1px 4px rgba(26,43,74,0.07)',
  shadowMd:  '0 4px 16px rgba(26,43,74,0.09)',
}

function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: width < 768, isTablet: width >= 768 && width < 1024, width }
}

const jinaRead = async (url) => {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  const res = await fetch(`https://r.jina.ai/${fullUrl}`, { headers: { Accept: 'text/plain' } })
  if (!res.ok) throw new Error(`Could not read ${url}`)
  return (await res.text()).slice(0, 10000)
}

const fetchGitHub = async (input) => {
  const handle = input.replace(/.*github\.com\//i, '').replace(/\//g, '').trim()
  const [profile, repos] = await Promise.all([
    fetch(`https://api.github.com/users/${handle}`).then(r => r.json()),
    fetch(`https://api.github.com/users/${handle}/repos?sort=updated&per_page=8`).then(r => r.json()),
  ])
  const repoList = Array.isArray(repos) ? repos.filter(r => !r.fork).slice(0, 8).map(r => `${r.name} (${r.language||'?'}${r.stargazers_count?`, ${r.stargazers_count} stars`:''})${r.description?`: ${r.description}`:''}`) : []
  return `GitHub: ${profile.login}\nName: ${profile.name||'—'}\nBio: ${profile.bio||'—'}\nLocation: ${profile.location||'—'}\nPublic repos: ${profile.public_repos}\n\nTop repositories:\n${repoList.join('\n')}`
}

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  const isPDF = file.name.toLowerCase().endsWith('.pdf')
  reader.onload = e => {
    if (isPDF) {
      // For PDFs, convert to base64 and send as document to Claude
      const base64 = e.target.result.split(',')[1]
      resolve({ type: 'pdf', base64, name: file.name })
    } else {
      resolve({ type: 'text', content: e.target.result })
    }
  }
  reader.onerror = reject
  if (isPDF) {
    reader.readAsDataURL(file)
  } else {
    reader.readAsText(file)
  }
})

const synthesise = async (sources, pdfFiles) => {
  const sourceText = sources.map(s => `\n\n=== ${s.label} ===\n${s.content}`).join('')

  // Build message content — text + any PDFs as documents
  const content = []

  // Add PDFs as document blocks
  if (pdfFiles && pdfFiles.length > 0) {
    for (const pdf of pdfFiles) {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: pdf.base64
        },
        title: pdf.name,
      })
    }
  }

  // Add text prompt
  content.push({
    type: 'text',
    text: `You are a profile intelligence engine. Analyse ALL the sources below (including any PDF documents above) and synthesise a single rich structured master profile.

${sourceText.length > 0 ? `Additional text sources:${sourceText}` : ''}

Return ONLY a valid JSON object. No markdown fences, no explanation, just the JSON:
{"name":"full name","headline":"10-word professional headline","email":"if found else null","phone":"if found else null","location":"city, country","linkedin_url":"if found else null","github_url":"if found else null","website_url":"if found else null","summary":"3-sentence rich summary capturing unique value","years_experience":0,"seniority":"senior","skills":["skill1","skill2"],"languages_and_tools":["tool1"],"domains":["domain1"],"target_roles":["role1","role2"],"target_industries":["industry1"],"salary_expectation":"£80k-£110k","work_preference":"hybrid","experience":[{"role":"title","org":"company","period":"2020-Present","highlights":["achievement 1","achievement 2"]}],"education":[{"degree":"degree name","institution":"university","year":"2018"}],"projects":[{"name":"project","description":"what it does","tech_stack":["Python"],"url":"","significance":"what it shows"}],"publications_patents":["citation"],"writing_voice":"description","strengths":["strength1","strength2"],"gaps":["gap1"],"job_search_tips":["tip1","tip2","tip3"],"profile_completeness":85,"sources_used":["source1"]}`
  })

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content }]
    })
  })

  const d = await res.json()

  // Handle API errors
  if (d.error) throw new Error(d.error.message || 'Claude API error')

  const text = d.content?.[0]?.text || ''
  if (!text) throw new Error('Empty response from Claude')

  // Clean and parse — extract JSON even if there is surrounding text
  const cleaned = text.replace(/```json|```/g, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')

  return JSON.parse(jsonMatch[0])
}

function Pill({ label, color = 'default', small }) {
  const s = { default:{bg:'#f1f5f9',color:T.textMid,border:T.border}, navy:{bg:T.navyLight,color:T.navy,border:T.navyBdr}, green:{bg:T.greenPale,color:T.green,border:T.greenBdr}, amber:{bg:T.amberPale,color:T.amber,border:T.amberBdr}, blue:{bg:T.bluePale,color:'#1d4ed8',border:'#bfdbfe'} }[color] || { bg:'#f1f5f9', color:T.textMid, border:T.border }
  return <span style={{ display:'inline-flex', alignItems:'center', fontSize:small?10:11, padding:small?'2px 7px':'3px 10px', borderRadius:4, fontWeight:500, whiteSpace:'nowrap', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{label}</span>
}

function SectionTitle({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, color:T.textLight, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${T.border}` }}>{children}</div>
}

function ScoreRing({ value }) {
  const size=80, stroke=6, r=(size-stroke*2)/2, circ=2*Math.PI*r
  const col = value>=80 ? T.green : value>=60 ? T.amber : T.red
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', position:'absolute', inset:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:22, fontWeight:800, color:col, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:8, color:T.textFaint, fontWeight:600, marginTop:1 }}>SCORE</div>
      </div>
    </div>
  )
}

function SourceRow({ icon, label, value, onChange, status, placeholder }) {
  const col = { idle:'#e2e8f0', loading:T.amber, done:T.green, error:T.red }[status]
  const mark = { idle:'○', loading:'◌', done:'✓', error:'✗' }[status]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ width:32, height:32, borderRadius:8, background:T.navyLight, border:`1px solid ${T.navyBdr}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10, color:T.textLight, fontWeight:600, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoCapitalize="none" autoCorrect="off" style={{ width:'100%', background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, padding:'8px 11px', color:T.text, fontSize:12, outline:'none' }}/>
      </div>
      <div style={{ fontSize:14, color:col, fontWeight:700, width:16, textAlign:'center', flexShrink:0 }}>{mark}</div>
    </div>
  )
}

function FileChip({ file, onRemove }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:T.navyLight, border:`1px solid ${T.navyBdr}`, borderRadius:6, padding:'4px 10px' }}>
      <span style={{ fontSize:11, color:T.navy, fontWeight:500 }}>{file.name}</span>
      <button onClick={onRemove} style={{ background:'none', border:'none', color:T.textLight, cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>×</button>
    </div>
  )
}

export default function ProfileIngestor() {
  const { isMobile, isTablet, width } = useBreakpoint()

  const [linkedin,  setLinkedin]  = useState('')
  const [github,    setGithub]    = useState('')
  const [website,   setWebsite]   = useState('')
  const [extraUrls, setExtraUrls] = useState(['', ''])
  const [files,     setFiles]     = useState([])
  const [log,       setLog]       = useState([])
  const [running,   setRunning]   = useState(false)
  const [profile,   setProfile]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [statuses,  setStatuses]  = useState({ linkedin:'idle', github:'idle', website:'idle', extra0:'idle', extra1:'idle', files:'idle', synthesis:'idle' })
  const fileRef = useRef()

  const setStatus = (key, val) => setStatuses(p => ({ ...p, [key]: val }))
  const addLog = (msg, type='info') => setLog(p => [...p, { msg, type }])
  const hasInput = linkedin || github || website || extraUrls.some(u => u) || files.length > 0

  const run = async () => {
    setRunning(true); setLog([]); setProfile(null); setSaved(false)
    const sources = []

    if (linkedin) {
      setStatus('linkedin','loading'); addLog('Reading LinkedIn profile...')
      try { const c=await jinaRead(linkedin); sources.push({label:'LinkedIn Profile',content:c}); setStatus('linkedin','done'); addLog('LinkedIn read successfully','done') }
      catch(e) { setStatus('linkedin','error'); addLog(`LinkedIn: ${e.message} — try uploading your profile as a text file instead`,'error') }
    }
    if (github) {
      setStatus('github','loading'); addLog('Fetching GitHub profile and repositories...')
      try { const c=await fetchGitHub(github); sources.push({label:'GitHub Profile & Repos',content:c}); setStatus('github','done'); addLog('GitHub profile and repositories read','done') }
      catch(e) { setStatus('github','error'); addLog(`GitHub: ${e.message}`,'error') }
    }
    if (website) {
      setStatus('website','loading'); addLog(`Reading portfolio: ${website}...`)
      try { const c=await jinaRead(website); sources.push({label:'Personal Website / Portfolio',content:c}); setStatus('website','done'); addLog('Portfolio website read','done') }
      catch(e) { setStatus('website','error'); addLog(`Website: ${e.message}`,'error') }
    }
    for (let i=0; i<extraUrls.length; i++) {
      const url=extraUrls[i]; if(!url)continue
      setStatus(`extra${i}`,'loading'); addLog(`Reading URL: ${url}...`)
      try {
        const c=await jinaRead(url)
        const lbl=url.includes('patent')?'Patent':url.includes('arxiv')||url.includes('doi')?'Publication':url.includes('youtube')?'Talk / Video':`Additional URL ${i+1}`
        sources.push({label:lbl,content:c}); setStatus(`extra${i}`,'done'); addLog(`${lbl} read successfully`,'done')
      } catch(e) { setStatus(`extra${i}`,'error'); addLog(`URL ${i+1}: ${e.message}`,'error') }
    }
    const pdfFiles = []
    if (files.length>0) {
      setStatus('files','loading'); addLog(`Reading ${files.length} uploaded file(s)...`)
      try {
        for (const f of files) {
          const result = await readFile(f)
          const lbl = f.name.toLowerCase().includes('cover')?'Cover Letter':f.name.toLowerCase().includes('cv')||f.name.toLowerCase().includes('resume')?'CV / Resume':'Uploaded Document'
          if (result.type === 'pdf') {
            pdfFiles.push({ ...result, label: lbl })
            addLog(`${lbl}: ${f.name} read as PDF`,'done')
          } else {
            sources.push({ label: lbl, content: result.content.slice(0, 6000) })
            addLog(`${lbl}: ${f.name} read`,'done')
          }
        }
        setStatus('files','done')
      } catch(e) { setStatus('files','error'); addLog(`File read failed: ${e.message}`,'error') }
    }

    if (sources.length===0 && pdfFiles.length===0) { addLog('No sources could be read. Check your inputs.','error'); setRunning(false); return }

    const totalSources = sources.length + pdfFiles.length
    setStatus('synthesis','loading'); addLog(`Synthesising ${totalSources} source(s) with Claude...`)
    try {
      const p = await synthesise(sources, pdfFiles)
      setProfile(p); setStatus('synthesis','done')
      addLog(`Profile built — completeness score: ${p.profile_completeness}/100`,'done')
      addLog(`Found ${p.skills?.length||0} skills · ${p.experience?.length||0} roles · ${p.projects?.length||0} projects`,'done')
    } catch(e) { setStatus('synthesis','error'); addLog(`Claude synthesis failed: ${e.message}`,'error') }

    setRunning(false)
  }

  const saveProfile = async () => {
    if (!profile) return; setSaving(true)
    try {
      const { error } = await supabase.from('profile').upsert({
        id:1, name:profile.name, email:profile.email, phone:profile.phone,
        location:profile.location, linkedin_url:profile.linkedin_url||linkedin,
        github_url:profile.github_url||github, website_url:profile.website_url||website,
        patent:(profile.publications_patents||[]).join('; '),
        skills:profile.skills||[], keywords:(profile.target_roles||[]).join(', ')+', '+(profile.target_industries||[]).join(', '),
        education:profile.education||[], profile_json:profile, updated_at:new Date().toISOString()
      })
      if (error) throw error; setSaved(true)
    } catch(e) { alert('Save failed: '+e.message) }
    setSaving(false)
  }

  const profileTabs = [
    {id:'overview',label:'Overview'},
    {id:'experience',label:'Experience'},
    {id:'projects',label:'Projects'},
    {id:'intelligence',label:'Intelligence'},
  ]

  const logColor = { info:'#718096', done:T.green, error:T.red }

  const isWide = width >= 900

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:T.bg, padding: isMobile?'12px':'20px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: isMobile?16:24, maxWidth:900 }}>
        <div style={{ fontSize: isMobile?18:22, fontWeight:800, color:T.navy, letterSpacing:'-0.025em', marginBottom:4 }}>
          Profile Intelligence
        </div>
        <div style={{ fontSize:13, color:T.textLight, lineHeight:1.6, maxWidth:560 }}>
          Add any combination of sources. The more you provide, the richer the profile — and the better your CV tailoring and job matching becomes.
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display:'grid', gridTemplateColumns: isWide?'380px 1fr':'1fr', gap: isMobile?12:20, maxWidth:1200 }}>

        {/* LEFT — inputs */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Profile URLs */}
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px', boxShadow:T.shadow }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.navy, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2 }}>Profile URLs</div>
            <div style={{ fontSize:11, color:T.textFaint, marginBottom:10 }}>All optional — provide any combination</div>
            <SourceRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill={T.navy}><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" fill={T.navy}/></svg>} label="LinkedIn" value={linkedin} onChange={setLinkedin} status={statuses.linkedin} placeholder="linkedin.com/in/yourname"/>
            <SourceRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill={T.navy}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>} label="GitHub" value={github} onChange={setGithub} status={statuses.github} placeholder="github.com/yourhandle"/>
            <SourceRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>} label="Personal Website / Portfolio" value={website} onChange={setWebsite} status={statuses.website} placeholder="yoursite.com"/>
          </div>

          {/* Additional URLs */}
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px', boxShadow:T.shadow }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.navy, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2 }}>Additional URLs</div>
            <div style={{ fontSize:11, color:T.textFaint, marginBottom:10 }}>Patents, papers, conference talks, Hugging Face spaces, any URL</div>
            {extraUrls.map((url,i)=>(
              <SourceRow key={i} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>} label={`URL ${i+1}`} value={url} onChange={v=>setExtraUrls(p=>p.map((u,j)=>j===i?v:u))} status={statuses[`extra${i}`]} placeholder={i===0?'arxiv.org/... or patent link':'youtube.com/... or any URL'}/>
            ))}
            <button onClick={()=>setExtraUrls(p=>[...p,''])} style={{ marginTop:10, fontSize:11, color:T.navy, background:T.navyLight, border:`1px solid ${T.navyBdr}`, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontWeight:500 }}>+ Add URL</button>
          </div>

          {/* File upload */}
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px', boxShadow:T.shadow }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.navy, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2 }}>Upload Files</div>
            <div style={{ fontSize:11, color:T.textFaint, marginBottom:10 }}>CV, cover letters, portfolio documents — PDF, TXT, DOC, MD</div>
            <div
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();setFiles(p=>[...p,...Array.from(e.dataTransfer.files)])}}
              onClick={()=>fileRef.current?.click()}
              style={{ border:`1.5px dashed ${T.borderDk}`, borderRadius:9, padding:'20px', textAlign:'center', cursor:'pointer', background:T.bg, transition:'border-color 0.15s' }}
            >
              <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md" style={{ display:'none' }} onChange={e=>setFiles(p=>[...p,...Array.from(e.target.files)])}/>
              <div style={{ marginBottom:6 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.textLight} strokeWidth="1.5" style={{ margin:'0 auto', display:'block' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{ fontSize:12, color:T.textMid, fontWeight:500 }}>Drag files here or tap to browse</div>
              <div style={{ fontSize:10, color:T.textFaint, marginTop:3 }}>PDF · TXT · MD · DOC</div>
            </div>
            {files.length>0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }} onClick={e=>e.stopPropagation()}>
                {files.map((f,i)=><FileChip key={i} file={f} onRemove={()=>setFiles(p=>p.filter((_,j)=>j!==i))}/>)}
              </div>
            )}
          </div>

          {/* Run button */}
          <button onClick={run} disabled={!hasInput||running} style={{ width:'100%', padding:'13px', borderRadius:10, background:hasInput&&!running?T.navy:'#cbd5e0', border:'none', color:T.white, fontSize:13, fontWeight:700, cursor:hasInput&&!running?'pointer':'not-allowed', transition:'background 0.2s' }}>
            {running ? 'Building profile...' : 'Build Master Profile'}
          </button>

          {/* Log */}
          {log.length>0 && (
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'14px 16px', boxShadow:T.shadow }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.textLight, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Pipeline Log</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {log.map((entry,i)=>(
                  <div key={i} style={{ display:'flex', gap:8, fontSize:11, color:logColor[entry.type]||T.textLight, lineHeight:1.5 }}>
                    <span style={{ color:T.borderDk, fontWeight:600, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))}
                {running && <div style={{ fontSize:11, color:T.blue, fontStyle:'italic' }}>Processing...</div>}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — profile output */}
        <div>
          {!profile && !running && (
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'48px 24px', textAlign:'center', boxShadow:T.shadow }}>
              <div style={{ width:56, height:56, borderRadius:16, background:T.navyLight, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:T.navy, marginBottom:6 }}>Your master profile appears here</div>
              <div style={{ fontSize:12, color:T.textLight, maxWidth:320, margin:'0 auto', lineHeight:1.7 }}>Add at least one source on the left and click Build Master Profile. The more sources you provide, the richer the result.</div>
              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:8, maxWidth:280, margin:'20px auto 0' }}>
                {[['GitHub URL','Extracts real projects, languages, tech stack'],['CV file upload','Work history, skills, education'],['Portfolio website','How you present yourself'],['Patent or paper URL','Research credibility signal']].map(([label,desc])=>(
                  <div key={label} style={{ display:'flex', gap:10, textAlign:'left' }}>
                    <div style={{ width:4, borderRadius:2, background:T.navyBdr, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:T.navy }}>{label}</div>
                      <div style={{ fontSize:10, color:T.textLight }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile && (
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden', boxShadow:T.shadow }}>

              {/* Profile header */}
              <div style={{ background:T.navy, padding: isMobile?'20px 16px':'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize: isMobile?18:22, fontWeight:800, color:T.white, letterSpacing:'-0.02em' }}>{profile.name}</div>
                    <div style={{ fontSize:13, color:'#93c5fd', marginTop:3 }}>{profile.headline}</div>
                    <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>{profile.location} · {profile.seniority} · {profile.years_experience} yrs exp</div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:10 }}>
                      {(profile.domains||[]).map(d=><span key={d} style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:'rgba(255,255,255,0.1)', color:'#bfdbfe', border:'1px solid rgba(255,255,255,0.15)', fontWeight:500 }}>{d}</span>)}
                    </div>
                  </div>
                  <div style={{ flexShrink:0 }}>
                    <ScoreRing value={profile.profile_completeness||0}/>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ fontSize:11, color:'#93c5fd', fontWeight:500 }}>{profile.salary_expectation}</div>
                  <span style={{ color:'rgba(255,255,255,0.2)' }}>·</span>
                  <div style={{ fontSize:11, color:'#93c5fd' }}>{profile.work_preference}</div>
                  <div style={{ flex:1 }}/>
                  <button onClick={saveProfile} disabled={saving||saved} style={{ padding:'7px 16px', borderRadius:8, background:saved?T.greenPale:T.white, border:`1px solid ${saved?T.greenBdr:'rgba(255,255,255,0.3)'}`, color:saved?T.green:T.navy, fontSize:12, fontWeight:600, cursor:saving||saved?'not-allowed':'pointer' }}>
                    {saved?'Saved to account':saving?'Saving...':'Save to account'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                {profileTabs.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:'11px 18px', background:'none', border:'none', borderBottom:activeTab===tab.id?`2px solid ${T.navy}`:'2px solid transparent', color:activeTab===tab.id?T.navy:T.textLight, fontSize:12, fontWeight:activeTab===tab.id?600:400, whiteSpace:'nowrap', cursor:'pointer' }}>{tab.label}</button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ padding: isMobile?'16px':'24px' }}>

                {/* Overview */}
                {activeTab==='overview' && (
                  <div style={{ display:'grid', gridTemplateColumns: width>=640?'1fr 1fr':'1fr', gap:20 }}>
                    <div>
                      <SectionTitle>Summary</SectionTitle>
                      <p style={{ fontSize:12, color:T.textMid, lineHeight:1.8, marginBottom:16 }}>{profile.summary}</p>
                      <SectionTitle>Target Roles</SectionTitle>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                        {(profile.target_roles||[]).map(r=><Pill key={r} label={r} color="navy"/>)}
                      </div>
                      <SectionTitle>Target Industries</SectionTitle>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {(profile.target_industries||[]).map(i=><Pill key={i} label={i} color="amber"/>)}
                      </div>
                    </div>
                    <div>
                      <SectionTitle>Top Skills</SectionTitle>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                        {(profile.skills||[]).slice(0,16).map(s=><Pill key={s} label={s} color="green"/>)}
                      </div>
                      <SectionTitle>Languages & Tools</SectionTitle>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                        {(profile.languages_and_tools||[]).map(t=><Pill key={t} label={t} color="blue"/>)}
                      </div>
                      {(profile.publications_patents||[]).length>0 && <>
                        <SectionTitle>Publications & Patents</SectionTitle>
                        {profile.publications_patents.map((p,i)=><div key={i} style={{ fontSize:11, color:T.textMid, marginBottom:4, lineHeight:1.5 }}>· {p}</div>)}
                      </>}
                      <SectionTitle>Sources Used</SectionTitle>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {(profile.sources_used||[]).map(s=><Pill key={s} label={s} color="navy" small/>)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {activeTab==='experience' && (
                  <div>
                    {(profile.experience||[]).map((e,i)=>(
                      <div key={i} style={{ marginBottom:20, paddingBottom:20, borderBottom:i<profile.experience.length-1?`1px solid ${T.border}`:'none' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:4, marginBottom:6 }}>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.navy }}>{e.role}</div>
                            <div style={{ fontSize:12, color:T.blue }}>{e.org}</div>
                          </div>
                          <div style={{ fontSize:11, color:T.textLight, fontWeight:500 }}>{e.period}</div>
                        </div>
                        {(e.highlights||[]).map((h,j)=><div key={j} style={{ fontSize:12, color:T.textMid, paddingLeft:14, marginBottom:3, lineHeight:1.6, position:'relative' }}><span style={{ position:'absolute', left:0, color:T.navy }}>•</span>{h}</div>)}
                      </div>
                    ))}
                    {(profile.education||[]).length>0 && <>
                      <SectionTitle>Education</SectionTitle>
                      {profile.education.map((e,i)=>(
                        <div key={i} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.navy }}>{e.degree}</div>
                          <div style={{ fontSize:11, color:T.textMid }}>{e.institution} · {e.year}</div>
                        </div>
                      ))}
                    </>}
                  </div>
                )}

                {/* Projects */}
                {activeTab==='projects' && (
                  <div style={{ display:'grid', gridTemplateColumns: width>=640?'1fr 1fr':'1fr', gap:12 }}>
                    {(profile.projects||[]).map((p,i)=>(
                      <div key={i} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.navy }}>{p.name}</div>
                          {p.url && p.url!=='null' && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:T.blue, fontWeight:500 }}>View</a>}
                        </div>
                        <div style={{ fontSize:12, color:T.textMid, lineHeight:1.6, marginBottom:8 }}>{p.description}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
                          {(p.tech_stack||[]).map(t=><Pill key={t} label={t} small color="blue"/>)}
                        </div>
                        {p.significance && <div style={{ fontSize:11, color:T.navy, fontStyle:'italic', lineHeight:1.5 }}>{p.significance}</div>}
                      </div>
                    ))}
                    {(profile.projects||[]).length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:32, color:T.textFaint, fontSize:12 }}>No projects extracted — add a GitHub URL or portfolio site for richer results</div>}
                  </div>
                )}

                {/* Intelligence */}
                {activeTab==='intelligence' && (
                  <div style={{ display:'grid', gridTemplateColumns: width>=640?'1fr 1fr':'1fr', gap:20 }}>
                    <div>
                      <SectionTitle>Writing Voice</SectionTitle>
                      <p style={{ fontSize:12, color:T.textMid, lineHeight:1.7, fontStyle:'italic', marginBottom:16 }}>{profile.writing_voice||'—'}</p>
                      <SectionTitle>Genuine Strengths</SectionTitle>
                      {(profile.strengths||[]).map((s,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, padding:'6px 0', borderBottom:`1px solid ${T.border}`, alignItems:'flex-start' }}>
                          <span style={{ color:T.green, fontWeight:700, fontSize:13, flexShrink:0 }}>+</span>
                          <span style={{ fontSize:12, color:T.textMid, lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <SectionTitle>Gaps to Address</SectionTitle>
                      {(profile.gaps||[]).map((g,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, padding:'6px 0', borderBottom:`1px solid ${T.border}`, alignItems:'flex-start' }}>
                          <span style={{ color:T.amber, fontWeight:700, fontSize:13, flexShrink:0 }}>!</span>
                          <span style={{ fontSize:12, color:T.textMid, lineHeight:1.5 }}>{g}</span>
                        </div>
                      ))}
                      <SectionTitle>Job Search Tips</SectionTitle>
                      {(profile.job_search_tips||[]).map((t,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, padding:'6px 0', borderBottom:`1px solid ${T.border}`, alignItems:'flex-start' }}>
                          <span style={{ color:T.blue, fontWeight:700, fontSize:11, flexShrink:0 }}>{i+1}.</span>
                          <span style={{ fontSize:12, color:T.textMid, lineHeight:1.5 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
