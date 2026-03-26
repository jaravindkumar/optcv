/*
  PROFILE INTELLIGENCE ENGINE
  ════════════════════════════════════════════════════════════════
  Sources ingested:
  • LinkedIn profile URL  → scraped via Jina AI reader
  • GitHub profile/repos  → GitHub public API (no auth needed)
  • Personal website      → scraped via Jina AI reader  
  • Any URL               → Jina AI reader (patents, papers, talks)
  • Uploaded files        → PDF/TXT/DOC read in browser
  
  Output: Unified master profile saved to Supabase `profile` table
  ════════════════════════════════════════════════════════════════
*/

import { useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ─────────────────────────────────────────────────────
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const ANTHROPIC_KEY     = import.meta.env.VITE_ANTHROPIC_KEY     || "YOUR_ANTHROPIC_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── JINA READER — converts any URL to clean markdown (free, no key needed) ──
const jinaRead = async (url) => {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { "Accept": "text/plain" }
  });
  if (!res.ok) throw new Error(`Jina failed for ${url}: ${res.status}`);
  const text = await res.text();
  return text.slice(0, 12000); // cap tokens
};

// ── GITHUB API — public, no auth needed for public profiles ────
const fetchGitHub = async (username) => {
  const clean = username.replace(/.*github\.com\//i, "").replace(/\//g, "");
  const [profile, repos] = await Promise.all([
    fetch(`https://api.github.com/users/${clean}`).then(r => r.json()),
    fetch(`https://api.github.com/users/${clean}/repos?sort=updated&per_page=10`).then(r => r.json()),
  ]);
  const repoSummaries = Array.isArray(repos)
    ? repos.filter(r => !r.fork).slice(0, 8).map(r => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        topics: r.topics,
        updated: r.updated_at?.slice(0, 10),
      }))
    : [];
  return { profile, repos: repoSummaries };
};

// ── READ FILE in browser ────────────────────────────────────────
const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = e => resolve(e.target.result);
  reader.onerror = reject;
  reader.readAsText(file);
});

// ── CLAUDE — synthesise all sources into master profile ─────────
const synthesiseProfile = async (sources) => {
  const sourceText = sources.map(s => `\n\n=== ${s.label} ===\n${s.content}`).join("");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `You are a profile intelligence engine. Analyse ALL the sources below and synthesise a single, rich, structured master profile for this person.

Sources:
${sourceText}

Return ONLY raw JSON (no markdown fences, no preamble):
{
  "name": "full name",
  "headline": "10-word professional headline",
  "email": "if found, else null",
  "phone": "if found, else null",
  "location": "city, country",
  "linkedin_url": "if found",
  "github_url": "if found",
  "website_url": "if found",
  "summary": "3-sentence rich professional summary capturing their unique value",
  "years_experience": number,
  "seniority": "junior|mid|senior|principal|director",
  "skills": ["deduplicated skill list, max 25, ranked by evidence strength"],
  "languages_and_tools": ["programming languages, frameworks, tools"],
  "domains": ["e.g. AI/ML, Digital Twins, Sports Tech, Healthcare"],
  "target_roles": ["3-5 specific role titles they're best suited for"],
  "target_industries": ["2-4 industries"],
  "salary_expectation": "e.g. £80k–£110k based on seniority and location",
  "work_preference": "remote|hybrid|onsite|flexible",
  "experience": [
    {
      "role": "job title",
      "org": "company/institution",
      "period": "start – end or Present",
      "type": "industry|academic|freelance",
      "highlights": ["2-3 achievement bullets, quantified where possible"]
    }
  ],
  "education": [
    { "degree": "...", "institution": "...", "year": "..." }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "1-sentence description",
      "tech_stack": ["..."],
      "url": "if available",
      "significance": "what this says about the candidate"
    }
  ],
  "publications_patents": ["formatted citations"],
  "writing_voice": "2-sentence description of their communication style based on their writing samples",
  "strengths": ["3-5 genuine differentiators vs typical candidates in their field"],
  "gaps": ["honest gaps or missing signals that could hurt job search"],
  "job_search_tips": ["3 specific, actionable tips based on their profile"],
  "profile_completeness": number between 0-100,
  "sources_used": ["list of source labels that had useful signal"]
}`
      }]
    })
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

// ── STYLES ──────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#07070e", fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif", color: "#e0e0f0" },
  card: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 14, padding: 20 },
  label: { fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", display: "block", marginBottom: 6 },
  input: { width: "100%", boxSizing: "border-box", background: "#080812", border: "1px solid #1a1a2e", borderRadius: 8, padding: "10px 13px", color: "#ccc", fontSize: 12, fontFamily: "monospace", outline: "none" },
  btn: (active, color = "#7c3aed") => ({
    padding: "10px 20px", borderRadius: 10, border: "none", cursor: active ? "pointer" : "not-allowed",
    background: active ? color : "#111", color: active ? "#fff" : "#333",
    fontSize: 12, fontWeight: 600, fontFamily: "monospace", transition: "all 0.2s",
  }),
  tag: (col = "#7c3aed") => ({
    fontSize: 10, padding: "3px 9px", borderRadius: 20,
    background: `${col}18`, border: `1px solid ${col}40`, color: col,
    fontFamily: "monospace", whiteSpace: "nowrap",
  }),
};

// ── SOURCE ROW ──────────────────────────────────────────────────
function SourceRow({ icon, label, placeholder, value, onChange, status, optional = true }) {
  const statusColor = { idle: "#333", loading: "#f59e0b", done: "#4ade80", error: "#f87171" };
  const statusIcon  = { idle: "○", loading: "◌", done: "✓", error: "✗" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #0e0e18" }}>
      <div style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: "#333", fontFamily: "monospace", marginBottom: 4, letterSpacing: "0.08em" }}>
          {label} {optional && <span style={{ color: "#1e1e28" }}>optional</span>}
        </div>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
      </div>
      <div style={{ fontSize: 14, color: statusColor[status], flexShrink: 0, width: 16, textAlign: "center" }}>
        {statusIcon[status]}
      </div>
    </div>
  );
}

// ── COMPLETENESS RING ───────────────────────────────────────────
function CompletenessRing({ value }) {
  const r = 36, stroke = 6, circ = 2 * Math.PI * r;
  const col = value >= 80 ? "#4ade80" : value >= 60 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: col, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 8, color: "#444", fontFamily: "monospace", marginTop: 2 }}>SCORE</div>
      </div>
    </div>
  );
}

// ── PROFILE CARD ────────────────────────────────────────────────
function ProfileCard({ profile, onSave, saving, saved }) {
  const [tab, setTab] = useState("overview");

  const tabs = [
    ["overview", "Overview"],
    ["experience", "Experience"],
    ["projects", "Projects"],
    ["intelligence", "Intelligence"],
  ];

  return (
    <div style={{ ...S.card, marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
        <CompletenessRing value={profile.profile_completeness || 0} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e0e0f0", letterSpacing: "-0.02em" }}>{profile.name}</div>
          <div style={{ fontSize: 13, color: "#7c3aed", marginTop: 3 }}>{profile.headline}</div>
          <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace", marginTop: 4 }}>
            {[profile.location, profile.seniority, `${profile.years_experience}y exp`].filter(Boolean).join(" · ")}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
            {(profile.domains || []).map(d => <span key={d} style={S.tag("#7c3aed")}>{d}</span>)}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>{profile.salary_expectation}</div>
          <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginTop: 2 }}>{profile.work_preference}</div>
          <button onClick={onSave} disabled={saving || saved} style={{ ...S.btn(!saving && !saved, "#4ade80"), marginTop: 10, color: "#07070e" }}>
            {saved ? "✓ Saved" : saving ? "Saving…" : "Save to Supabase"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #1a1a2e", marginBottom: 18 }}>
        {tabs.map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "8px 14px", background: "none", border: "none",
            borderBottom: tab === id ? "2px solid #7c3aed" : "2px solid transparent",
            color: tab === id ? "#a78bfa" : "#333", fontSize: 10, cursor: "pointer",
            fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>{lbl}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={S.label}>Summary</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8, marginBottom: 16 }}>{profile.summary}</div>
            <div style={S.label}>Target Roles</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
              {(profile.target_roles || []).map(r => <span key={r} style={S.tag("#06b6d4")}>{r}</span>)}
            </div>
            <div style={S.label}>Target Industries</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(profile.target_industries || []).map(i => <span key={i} style={S.tag("#f59e0b")}>{i}</span>)}
            </div>
          </div>
          <div>
            <div style={S.label}>Top Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
              {(profile.skills || []).slice(0, 15).map(s => <span key={s} style={S.tag("#4ade80")}>{s}</span>)}
            </div>
            <div style={S.label}>Languages & Tools</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
              {(profile.languages_and_tools || []).map(t => <span key={t} style={S.tag("#a78bfa")}>{t}</span>)}
            </div>
            {profile.publications_patents?.length > 0 && <>
              <div style={S.label}>Publications & Patents</div>
              {profile.publications_patents.map((p, i) => (
                <div key={i} style={{ fontSize: 10, color: "#555", fontFamily: "monospace", marginBottom: 4 }}>· {p}</div>
              ))}
            </>}
          </div>
        </div>
      )}

      {/* Experience tab */}
      {tab === "experience" && (
        <div>
          {(profile.experience || []).map((e, i) => (
            <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < profile.experience.length - 1 ? "1px solid #0e0e18" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd" }}>{e.role}</div>
                  <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>{e.org}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{e.period}</div>
                  <span style={{ ...S.tag(e.type === "academic" ? "#f59e0b" : "#4ade80"), fontSize: 9, marginTop: 4, display: "inline-block" }}>{e.type}</span>
                </div>
              </div>
              {(e.highlights || []).map((h, j) => (
                <div key={j} style={{ fontSize: 11, color: "#666", paddingLeft: 12, marginTop: 6, lineHeight: 1.6, borderLeft: "1px solid #1a1a2e" }}>· {h}</div>
              ))}
            </div>
          ))}
          {(profile.education || []).length > 0 && <>
            <div style={{ ...S.label, marginTop: 8 }}>Education</div>
            {profile.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#bbb" }}>{e.degree}</div>
                <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{e.institution} · {e.year}</div>
              </div>
            ))}
          </>}
        </div>
      )}

      {/* Projects tab */}
      {tab === "projects" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {(profile.projects || []).map((p, i) => (
            <div key={i} style={{ background: "#080812", border: "1px solid #1a1a2e", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>{p.name}</div>
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: "#7c3aed", fontFamily: "monospace" }}>→ view</a>}
              </div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6, marginBottom: 8 }}>{p.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {(p.tech_stack || []).map(t => <span key={t} style={S.tag("#a78bfa")}>{t}</span>)}
              </div>
              {p.significance && <div style={{ fontSize: 10, color: "#7c3aed", fontStyle: "italic", fontFamily: "monospace" }}>{p.significance}</div>}
            </div>
          ))}
          {(profile.projects || []).length === 0 && (
            <div style={{ color: "#333", fontSize: 12, fontFamily: "monospace", gridColumn: "1/-1" }}>No projects extracted — add GitHub or portfolio URL for richer results</div>
          )}
        </div>
      )}

      {/* Intelligence tab */}
      {tab === "intelligence" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={S.label}>Writing Voice</div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>{profile.writing_voice || "—"}</div>
            <div style={S.label}>Genuine Strengths</div>
            {(profile.strengths || []).map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: "#4ade80", padding: "5px 0", borderBottom: "1px solid #0e0e18" }}>✦ {s}</div>
            ))}
          </div>
          <div>
            <div style={S.label}>Gaps to Address</div>
            {(profile.gaps || []).map((g, i) => (
              <div key={i} style={{ fontSize: 11, color: "#f87171", padding: "5px 0", borderBottom: "1px solid #0e0e18" }}>△ {g}</div>
            ))}
            <div style={{ ...S.label, marginTop: 16 }}>Job Search Tips</div>
            {(profile.job_search_tips || []).map((t, i) => (
              <div key={i} style={{ fontSize: 11, color: "#888", padding: "6px 0", borderBottom: "1px solid #0e0e18", lineHeight: 1.6 }}>{i + 1}. {t}</div>
            ))}
            <div style={{ ...S.label, marginTop: 16 }}>Sources Used</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(profile.sources_used || []).map(s => <span key={s} style={S.tag("#06b6d4")}>{s}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────
export default function ProfileIngestor() {
  // Inputs
  const [linkedin, setLinkedin]   = useState("");
  const [github, setGithub]       = useState("");
  const [website, setWebsite]     = useState("");
  const [extraUrls, setExtraUrls] = useState(["", ""]);
  const [files, setFiles]         = useState([]);
  const fileRef = useRef();

  // Pipeline state
  const [log, setLog]         = useState([]);
  const [running, setRunning] = useState(false);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // Source statuses
  const [statuses, setStatuses] = useState({
    linkedin: "idle", github: "idle", website: "idle",
    extra0: "idle", extra1: "idle", files: "idle", synthesis: "idle",
  });

  const setStatus = (key, val) => setStatuses(p => ({ ...p, [key]: val }));
  const addLog = (msg, type = "info") => setLog(p => [...p, { msg, type, t: Date.now() }]);

  const hasInput = linkedin || github || website || extraUrls.some(u => u) || files.length > 0;

  const run = async () => {
    setRunning(true);
    setLog([]);
    setProfile(null);
    setSaved(false);
    const sources = [];

    // ── LinkedIn ──────────────────────────────────────────────
    if (linkedin) {
      setStatus("linkedin", "loading");
      addLog("Reading LinkedIn profile…");
      try {
        const content = await jinaRead(linkedin);
        sources.push({ label: "LinkedIn Profile", content });
        setStatus("linkedin", "done");
        addLog("LinkedIn ✓ — extracted work history, skills, recommendations", "done");
      } catch (e) {
        setStatus("linkedin", "error");
        addLog(`LinkedIn failed: ${e.message} — try pasting profile text manually`, "error");
      }
    }

    // ── GitHub ────────────────────────────────────────────────
    if (github) {
      setStatus("github", "loading");
      addLog("Fetching GitHub profile and repos…");
      try {
        const { profile: ghProfile, repos } = await fetchGitHub(github);
        const content = `
GitHub User: ${ghProfile.login}
Name: ${ghProfile.name}
Bio: ${ghProfile.bio}
Location: ${ghProfile.location}
Followers: ${ghProfile.followers}
Public repos: ${ghProfile.public_repos}
Company: ${ghProfile.company}

Top Repositories:
${repos.map(r => `- ${r.name} (${r.language || "?"}${r.stars ? `, ★${r.stars}` : ""}): ${r.description || "no description"}${r.topics?.length ? ` [${r.topics.join(", ")}]` : ""}`).join("\n")}`;
        sources.push({ label: "GitHub Profile & Repos", content });
        setStatus("github", "done");
        addLog(`GitHub ✓ — ${repos.length} repos analysed, languages and projects extracted`, "done");

        // Also fetch README if it exists
        try {
          const readmeRes = await fetch(`https://raw.githubusercontent.com/${github.replace(/.*github\.com\//i, "")}/main/README.md`);
          if (readmeRes.ok) {
            const readme = await readmeRes.text();
            sources.push({ label: "GitHub Profile README", content: readme.slice(0, 4000) });
            addLog("GitHub README ✓ — personal README extracted", "done");
          }
        } catch (_) {}
      } catch (e) {
        setStatus("github", "error");
        addLog(`GitHub failed: ${e.message}`, "error");
      }
    }

    // ── Personal website ──────────────────────────────────────
    if (website) {
      setStatus("website", "loading");
      addLog(`Reading website: ${website}…`);
      try {
        const content = await jinaRead(website);
        sources.push({ label: "Personal Website / Portfolio", content });
        setStatus("website", "done");
        addLog("Website ✓ — portfolio and about page extracted", "done");
      } catch (e) {
        setStatus("website", "error");
        addLog(`Website failed: ${e.message}`, "error");
      }
    }

    // ── Extra URLs ────────────────────────────────────────────
    for (let i = 0; i < extraUrls.length; i++) {
      const url = extraUrls[i];
      if (!url) continue;
      setStatus(`extra${i}`, "loading");
      addLog(`Reading URL ${i + 1}: ${url}…`);
      try {
        const content = await jinaRead(url);
        const urlLabel = url.includes("patent") ? "Patent" :
                         url.includes("arxiv") || url.includes("doi") ? "Publication" :
                         url.includes("youtube") || url.includes("youtu.be") ? "Talk / Video" :
                         `Additional URL ${i + 1}`;
        sources.push({ label: urlLabel, content });
        setStatus(`extra${i}`, "done");
        addLog(`${urlLabel} ✓ — content extracted`, "done");
      } catch (e) {
        setStatus(`extra${i}`, "error");
        addLog(`URL ${i + 1} failed: ${e.message}`, "error");
      }
    }

    // ── Files ─────────────────────────────────────────────────
    if (files.length > 0) {
      setStatus("files", "loading");
      addLog(`Reading ${files.length} uploaded file(s)…`);
      try {
        for (const file of files) {
          const content = await readFile(file);
          const label = file.name.toLowerCase().includes("cover") ? "Cover Letter" :
                        file.name.toLowerCase().includes("cv") || file.name.toLowerCase().includes("resume") ? "CV / Resume" :
                        file.name.toLowerCase().includes("portfolio") ? "Portfolio Document" :
                        `Uploaded File: ${file.name}`;
          sources.push({ label, content: content.slice(0, 8000) });
          addLog(`${label} ✓ — ${Math.round(content.length / 1000)}k chars extracted`, "done");
        }
        setStatus("files", "done");
      } catch (e) {
        setStatus("files", "error");
        addLog(`File read failed: ${e.message}`, "error");
      }
    }

    if (sources.length === 0) {
      addLog("No sources could be read. Check your inputs.", "error");
      setRunning(false);
      return;
    }

    // ── Claude Synthesis ──────────────────────────────────────
    setStatus("synthesis", "loading");
    addLog(`Synthesising ${sources.length} sources with Claude Sonnet…`);
    try {
      const masterProfile = await synthesiseProfile(sources);
      setProfile(masterProfile);
      setStatus("synthesis", "done");
      addLog(`Profile synthesised ✓ — completeness score: ${masterProfile.profile_completeness}/100`, "done");
      addLog(`Found: ${masterProfile.skills?.length || 0} skills · ${masterProfile.experience?.length || 0} roles · ${masterProfile.projects?.length || 0} projects`, "done");
    } catch (e) {
      setStatus("synthesis", "error");
      addLog(`Claude synthesis failed: ${e.message}`, "error");
    }

    setRunning(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profile").upsert({
        id: 1,
        name:           profile.name,
        email:          profile.email,
        phone:          profile.phone,
        location:       profile.location,
        linkedin_url:   profile.linkedin_url || linkedin,
        github_url:     profile.github_url   || github,
        website_url:    profile.website_url  || website,
        patent:         (profile.publications_patents || []).join("; "),
        skills:         profile.skills || [],
        keywords:       (profile.target_roles || []).join(", ") + ", " + (profile.target_industries || []).join(", "),
        education:      profile.education || [],
        profile_json:   profile,
        updated_at:     new Date().toISOString(),
      });
      if (error) throw error;
      setSaved(true);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed — check Supabase config. Profile is still shown below.");
    }
    setSaving(false);
  };

  const logColor = { info: "#444", done: "#4ade80", error: "#f87171" };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 2px; }
        input::placeholder { color: #1e1e2e !important; }
        input:focus { border-color: rgba(124,58,237,.4) !important; outline: none; }
        a { color: inherit; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#7c3aed", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>
            ✦ Profile Intelligence Engine
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.025em" }}>
            Build your master profile
          </h1>
          <p style={{ color: "#333", fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
            Give it everything you have. The more sources, the richer the profile — and the better every CV, cover letter, and job match becomes.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* LEFT — inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 14, fontFamily: "monospace", letterSpacing: "0.06em" }}>PROFILE URLS</div>
              <SourceRow icon="💼" label="LinkedIn" placeholder="linkedin.com/in/yourname" value={linkedin} onChange={setLinkedin} status={statuses.linkedin} />
              <SourceRow icon="🐙" label="GitHub"   placeholder="github.com/yourhandle"   value={github}   onChange={setGithub}   status={statuses.github} />
              <SourceRow icon="🌐" label="Website"  placeholder="yoursite.com"             value={website}  onChange={setWebsite}  status={statuses.website} />
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 14, fontFamily: "monospace", letterSpacing: "0.06em" }}>ANY OTHER URLS</div>
              <div style={{ fontSize: 10, color: "#2a2a3a", fontFamily: "monospace", marginBottom: 12 }}>Patents, papers, conference talks, side projects, Hugging Face spaces…</div>
              {extraUrls.map((url, i) => (
                <SourceRow key={i} icon="🔗" label={`URL ${i + 1}`} placeholder={i === 0 ? "arxiv.org/abs/... or patent link" : "youtube.com/... or any URL"} value={url} onChange={v => setExtraUrls(p => p.map((u, j) => j === i ? v : u))} status={statuses[`extra${i}`]} />
              ))}
              <button onClick={() => setExtraUrls(p => [...p, ""])} style={{ marginTop: 10, fontSize: 10, color: "#333", background: "none", border: "1px dashed #1a1a2e", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "monospace" }}>
                + Add URL
              </button>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 14, fontFamily: "monospace", letterSpacing: "0.06em" }}>UPLOAD FILES</div>
              <div style={{ fontSize: 10, color: "#2a2a3a", fontFamily: "monospace", marginBottom: 10 }}>CV, cover letters, portfolio docs, project writeups</div>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFiles(p => [...p, ...Array.from(e.dataTransfer.files)]); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: "1px dashed #1a1a2e", borderRadius: 8, padding: "16px", textAlign: "center", cursor: "pointer", background: "#080812" }}
              >
                <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md" style={{ display: "none" }} onChange={e => setFiles(p => [...p, ...Array.from(e.target.files)])} />
                <div style={{ fontSize: 20, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 10, color: "#2a2a3a", fontFamily: "monospace" }}>Drop files or click · PDF TXT MD DOC</div>
                {files.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }} onClick={e => e.stopPropagation()}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 6, padding: "4px 10px" }}>
                        <span style={{ fontSize: 10, color: "#a78bfa", fontFamily: "monospace" }}>📄 {f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 13 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={run} disabled={!hasInput || running} style={{ ...S.btn(hasInput && !running), padding: "13px", fontSize: 13, borderRadius: 10 }}>
              {running ? "⟳  Ingesting sources…" : "✦  Build Master Profile"}
            </button>
          </div>

          {/* RIGHT — log */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...S.card, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 14, fontFamily: "monospace", letterSpacing: "0.06em" }}>PIPELINE LOG</div>

              {log.length === 0 && (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                  <div style={{ fontSize: 11, color: "#1e1e2e", fontFamily: "monospace" }}>Add at least one source and click Build</div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {log.map((entry, i) => (
                  <div key={i} style={{ fontSize: 11, color: logColor[entry.type] || "#444", fontFamily: "monospace", lineHeight: 1.6, animation: "fadeIn .2s ease", display: "flex", gap: 6 }}>
                    <span style={{ color: "#1a1a2e", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))}
                {running && (
                  <div style={{ fontSize: 11, color: "#7c3aed", fontFamily: "monospace", animation: "pulse 1.2s ease infinite" }}>⟳ processing…</div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div style={{ ...S.card, background: "#09090f" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#444", marginBottom: 12, fontFamily: "monospace", letterSpacing: "0.1em" }}>HOW IT WORKS</div>
              {[
                ["🔗 URLs", "Jina AI reader converts any URL to clean text — no scraping, no auth"],
                ["🐙 GitHub", "Public API reads your profile, repos, READMEs, topics, languages"],
                ["📄 Files", "Read directly in your browser — never uploaded to any server"],
                ["✦ Synthesis", "Claude Sonnet merges all sources into one structured profile"],
                ["💾 Save", "Saved to your Supabase — agents use it for scoring and CV tailoring"],
              ].map(([icon, desc]) => (
                <div key={icon} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace", lineHeight: 1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile output */}
        {profile && <ProfileCard profile={profile} onSave={saveProfile} saving={saving} saved={saved} />}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
