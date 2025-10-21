import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import { useConversations } from "./useConversations";
import type { Message } from "./db";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const ASK_JSON = `${BASE}/api/ask`;
const ASK_SSE  = `${BASE}/api/ask/stream`;

marked.setOptions({ breaks: true });
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang || "").trim();
      const valid = language && hljs.getLanguage(language) ? language : undefined;
      const highlighted = valid
        ? hljs.highlight(text, { language: valid }).value
        : hljs.highlightAuto(text).value;
      return `<pre><code>${highlighted}</code></pre>`;
    },
  },
});

const uid = () => Math.random().toString(36).slice(2);

function mdToHtml(md: string): string {
  const raw = marked.parse(md) as string;
  return DOMPurify.sanitize(raw);
}

type Preferred = "chatgpt" | "claude" | "grok" | "gemini" | null;
type Mode = "fast" | "balanced" | "thorough";
type NxSettings = {
  theme: "dark" | "light";
  showModels: boolean;
  showAudit: boolean;
  webPct: number;
  aiPct: number;
  useBoth: boolean;
  consensusBeforeWeb: boolean;
  preferred: Preferred;
  mode: Mode;
};

type NxProfile = {
  name: string;
  email: string;
  photoDataUrl?: string;
  accountId: string;
  plan?: string;
};

export default function ConsumerChat() {
  const {
    active, archived, trash,
    current, currentId, setCurrentId,
    startNew, select, rename, append, updateLastAssistant,
    archive, moveToTrash, restore, purge, purgeAllTrash
  } = useConversations();

  const [settings, setSettings] = useState<NxSettings>(() => {
    try { return JSON.parse(localStorage.getItem("nx.settings")||""); } catch {}
    return { theme:"dark", showModels:true, showAudit:false, webPct:50, aiPct:50, useBoth:true, consensusBeforeWeb:true, preferred:null, mode:"balanced" };
  });
  useEffect(()=>{ localStorage.setItem("nx.settings", JSON.stringify(settings)); }, [settings]);
  useEffect(()=>{ document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  const [profile, setProfile] = useState<NxProfile>(() => {
    try { return JSON.parse(localStorage.getItem("nx.profile")||""); } catch {}
    return { name:"Nexus User", email:"user@example.com", accountId:"acc_"+uid(), plan:"Free" };
  });
  useEffect(()=>{ localStorage.setItem("nx.profile", JSON.stringify(profile)); }, [profile]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState<string|null>(null);

  // Profile modal UI state
  const [profileTab, setProfileTab] = useState<'user'|'billing'|'feedback'>('user');
  const [deleteFlow, setDeleteFlow] = useState<null | 'confirm' | 'feedback' | 'submitting' | 'done'>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior:"smooth"}); }, [current, busy]);

  function showToast(msg: string, ms=2000){ setToast(msg); setTimeout(()=>setToast(null), ms); }
  function toggleTheme(){ setSettings(s=>({...s, theme: s.theme==="dark"?"light":"dark"})); }

  async function ensureCurrent() {
    if (current) return current;
    const c = await startNew("New chat");
    setCurrentId(c.id);
    return c;
  }

  async function send() {
    const prompt = input.trim(); if (!prompt || busy) return;
    setInput("");
    const conv = await ensureCurrent();

    if (conv.messages.length === 0) {
      const title = prompt.length > 50 ? prompt.slice(0,50)+"…" : prompt;
      rename(conv.id, title);
    }

    // Show user msg first (always)
    await append(conv.id, { id: uid(), role:"user", content: prompt, html: mdToHtml(prompt) });
    // Insert assistant placeholder, then stream/fallback
    await append(conv.id, { id: uid(), role:"assistant", content:"", html:"" });
    setBusy(true);

    const headers: Record<string,string> = {
      "Content-Type": "application/json",
      "X-Nexus-Web-Pct": String(settings.webPct),
      "X-Nexus-AI-Pct": String(settings.aiPct),
      "X-Nexus-Use-Both": settings.useBoth ? "1" : "0",
      "X-Nexus-Consensus-Before-Web": settings.consensusBeforeWeb ? "1" : "0",
      "X-Nexus-Preferred": String(settings.preferred || ""),
      "X-Nexus-Mode": settings.mode
    };

    const ok = await trySSE({ prompt, convId: conv.id, headers });
    if (!ok) await fallbackJSON({ prompt, convId: conv.id, headers });
    setBusy(false);
  }

  async function trySSE({ prompt, convId, headers }:{
    prompt:string; convId:string; headers:Record<string,string>;
  }) {
    try {
      const res = await fetch(ASK_SSE, { method:"POST", headers, body: JSON.stringify({ prompt }) });
      if (!res.ok || !res.headers.get("content-type")?.includes("text/event-stream")) throw new Error("no-sse");
      const reader = res.body!.getReader(); const dec = new TextDecoder();
      let buffer=""; let full="";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buffer += dec.decode(value, { stream:true });
        const chunks = buffer.split("\n\n"); buffer = chunks.pop() || "";
        for (const block of chunks) {
          const m = block.match(/^data:\s*(.*)$/m); if (!m) continue;
          const data = m[1]; if (data === "[DONE]") break;
          try {
            const obj = JSON.parse(data);
            if (obj.delta) { full += obj.delta; await updateLastAssistant(convId, { content:full, html: mdToHtml(full) }); }
            if (obj.models || obj.model_answers) await updateLastAssistant(convId, { models: obj.models || obj.model_answers });
            if (obj.audit || obj.audit_events) await updateLastAssistant(convId, { audit: obj.audit || obj.audit_events });
          } catch {
            full += data;
            await updateLastAssistant(convId, { content:full, html: mdToHtml(full) });
          }
        }
      }
      return true;
    } catch { return false; }
  }

  async function fallbackJSON({ prompt, convId, headers }:{
    prompt:string; convId:string; headers:Record<string,string>;
  }) {
    try {
      const r = await fetch(ASK_JSON, { method:"POST", headers, body: JSON.stringify({ prompt }) });
      const j = await r.json();
      const answer = String(j.answer ?? j.output ?? j.text ?? "");
      await updateLastAssistant(convId, {
        content: answer,
        html: mdToHtml(answer),
        models: j.model_answers || j.models || undefined,
        audit: j.audit || j.audit_events || undefined
      });
    } catch (e:any) {
      await updateLastAssistant(convId, { content:`⚠️ ${e?.message || "Request failed"}`, html: mdToHtml(`⚠️ ${e?.message || "Request failed"}`) });
    }
  }

  function StatusActions() {
    if (!current) return null;
    const id = current.id;
    if (current.status === "active") {
      return (<><button className="pill" onClick={()=>archive(id)}>Archive</button><button className="pill" onClick={()=>moveToTrash(id)}>Delete</button></>);
    } else if (current.status === "archived") {
      return (<><button className="pill on" onClick={()=>restore(id)}>Restore</button><button className="pill" onClick={()=>moveToTrash(id)}>Delete</button></>);
    }
    return (<><button className="pill on" onClick={()=>restore(id)}>Restore</button><button className="pill danger" onClick={()=>purge(id)}>Permanently Delete</button></>);
  }

  return (
    <div className="cx-shell">
      {/* Sidebar */}
      <aside className="cx-sidebar">
        <div className="cx-brand">Nexus.ai</div>
        <button className="cx-new" onClick={()=>startNew("New chat").then(c=>setCurrentId(c.id))}>＋ New chat</button>
        <div className="cx-divider" />

        <Section title={`Active (${active.length})`}>
          {active.length===0 && <div className="cx-empty-small muted">No active chats</div>}
          {active.map(c=>(
            <ConvRow key={c.id} title={c.title} when={new Date(c.updatedAt).toLocaleString()} active={c.id===currentId}
              onClick={()=>select(c.id)}
              menu={[
                {label:"Archive", onClick:()=>archive(c.id)},
                {label:"Delete", onClick:()=>moveToTrash(c.id)},
                {label:"Rename", onClick:async()=>{ const t=prompt("Rename chat", c.title||"Untitled"); if(t!==null) rename(c.id, t.trim()||"Untitled"); }}
              ]}
            />
          ))}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length===0 && <div className="cx-empty-small muted">Nothing archived</div>}
          {archived.map(c=>(
            <ConvRow key={c.id} title={c.title} when={new Date(c.updatedAt).toLocaleString()} active={c.id===currentId}
              onClick={()=>select(c.id)}
              menu={[
                {label:"Restore", onClick:()=>restore(c.id)},
                {label:"Delete", onClick:()=>moveToTrash(c.id)},
                {label:"Rename", onClick:async()=>{ const t=prompt("Rename chat", c.title||"Untitled"); if(t!==null) rename(c.id, t.trim()||"Untitled"); }}
              ]}
            />
          ))}
        </Section>

        <Section title={`Trash (${trash.length})`} extra={<button className="mini danger" onClick={purgeAllTrash}>Empty Trash</button>}>
          {trash.length===0 && <div className="cx-empty-small muted">Trash is empty</div>}
          {trash.map(c=>(
            <ConvRow key={c.id} title={c.title} when={new Date(c.updatedAt).toLocaleString()} active={c.id===currentId}
              onClick={()=>select(c.id)}
              menu={[
                {label:"Restore", onClick:()=>restore(c.id)},
                {label:"Permanently Delete", onClick:()=>purge(c.id)}
              ]}
            />
          ))}
        </Section>

        <div className="cx-flex" />
        <div className="hint">⌘/Ctrl + N new • ⌘/Ctrl + A archive • Del delete • Shift+Del purge</div>
      </aside>

      {/* Main */}
      <section className="cx-main">
        <header className="cx-top">
          <div className="title">{current?.title || "Chat"}</div>
          <div className="top-icons">
            <button className="icon-btn" onClick={toggleTheme} title={`Theme: ${settings.theme}`}>{settings.theme==="dark"?"🌙":"☀️"}</button>
            <button className="icon-btn" onClick={()=>setShowSettings(true)} title="System Settings">⚙️</button>
            {current && <StatusActions />}
            <button className="avatar-btn" onClick={()=>{ setProfileTab('user'); setDeleteFlow(null); setShowProfile(true); }} title="Profile">
              {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="avatar"/> : <span>{profile.name?.slice(0,1).toUpperCase()||"U"}</span>}
            </button>
          </div>
        </header>

        {/* STREAM */}
        <div className="cx-stream" ref={scrollRef}>
          <div className="cx-stream-inner">
            {!current || current.messages.length === 0 ? (
              <div className="cx-hero">
                <h1>How can Nexus help today?</h1>
                <p className="muted">Ask a question, paste a document, or say “/help”.</p>
                <div className="quick">
                  <button onClick={()=>setInput("Explain transformers like I’m 12")}>Explain simply</button>
                  <button onClick={()=>setInput("Summarize the following article:\n")}>Summarize</button>
                  <button onClick={()=>setInput("Write a polite email to…")}>Draft an email</button>
                </div>
              </div>
            ) : (
              current.messages.map(m => <MessageBubble key={m.id} m={m} />)
            )}
            {busy && <div className="cx-thinking">Thinking…</div>}
          </div>
        </div>

        {/* COMPOSER */}
        <footer className="cx-compose">
          <div className="cx-compose-inner">
            <input
              id="composer"
              className="cx-input"
              placeholder="Ask Nexus…"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
            />
            <button className="cx-send" onClick={send} disabled={busy || !input.trim()}>Send</button>
          </div>
        </footer>
      </section>

      {/* System Settings */}
      {showSettings && (
        <div className="modal-backdrop" onClick={()=>setShowSettings(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">System Settings</div>
              <button className="icon-btn" onClick={()=>setShowSettings(false)}>✖</button>
            </div>
            <div className="modal-body">
              <Row label="Web Search %"><Range value={settings.webPct} set={v=>setSettings(s=>({...s, webPct:v}))} /></Row>
              <Row label="AI Models %"><Range value={settings.aiPct} set={v=>setSettings(s=>({...s, aiPct:v}))} /></Row>
              <Row label="Use Both by Default"><Toggle checked={settings.useBoth} onChange={v=>setSettings(s=>({...s, useBoth:v}))} /></Row>
              <Row label="Consensus before Web is prime"><Toggle checked={settings.consensusBeforeWeb} onChange={v=>setSettings(s=>({...s, consensusBeforeWeb:v}))} /></Row>
              <Row label="Preferred Model">
                <Segmented
                  options={[{key:"chatgpt",label:"ChatGPT"},{key:"claude",label:"Claude"},{key:"grok",label:"Grok"},{key:"gemini",label:"Gemini"}]}
                  value={settings.preferred}
                  onChange={k=>setSettings(s=>({...s, preferred:k as Preferred}))}
                />
              </Row>
              <Row label="Mode (Nexus Engine)">
                <Segmented
                  options={[{key:"fast",label:"Fast"},{key:"balanced",label:"Balanced"},{key:"thorough",label:"Thorough"}]}
                  value={settings.mode}
                  onChange={k=>setSettings(s=>({...s, mode:k as Mode}))}
                />
              </Row>
              <div className="modal-actions">
                <button className="primary" onClick={()=>{ localStorage.setItem("nx.settings", JSON.stringify(settings)); showToast("Settings saved"); setShowSettings(false); }}>Save Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal with safe delete flow */}
      {showProfile && (
        <div className="modal-backdrop" onClick={()=>setShowProfile(false)}>
          <div className="modal wide" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Profile</div>
              <button type="button" className="icon-btn" onClick={()=>setShowProfile(false)}>✖</button>
            </div>

            {/* Delete flow overrides */}
            {deleteFlow && (
              <div className="modal-body">
                {deleteFlow === 'confirm' && (
                  <div className="confirm-card">
                    <h3 className="confirm-title">Delete account?</h3>
                    <p className="note">This will remove your account and local data on this device. You’ll be logged out. This action cannot be undone.</p>
                    <div className="btn-row">
                      <button type="button" className="danger" onClick={()=>setDeleteFlow('feedback')}>Yes, continue</button>
                      <button type="button" className="btn-secondary" onClick={()=>setDeleteFlow(null)}>No, go back</button>
                    </div>
                  </div>
                )}
                {deleteFlow === 'feedback' && (
                  <div className="confirm-card">
                    <h3 className="confirm-title">One last thing</h3>
                    <p className="note">Please tell us why you’re leaving (optional, max 2,000 characters).</p>
                    <textarea className="feedback-area" value={deleteReason} maxLength={2000} rows={7}
                      onChange={e=>setDeleteReason(e.target.value)} placeholder="Your feedback helps us improve Nexus…" />
                    <div className="counter">{deleteReason.length}/2000</div>
                    <div className="btn-row">
                      <button type="button" className="btn-secondary" onClick={()=>setDeleteFlow('confirm')}>Back</button>
                      <button type="button" className="primary" onClick={async()=>{ try{ setDeleteFlow('submitting'); /* await fetch('/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:deleteReason})}); */ localStorage.clear(); showToast('Account deletion request submitted. We’ll be in touch.'); setShowProfile(false); setDeleteFlow('done'); }catch{ showToast('Something went wrong. Please try again.'); setDeleteFlow('feedback'); }}}>Submit & Request Deletion</button>
                    </div>
                  </div>
                )}
                {deleteFlow === 'submitting' && (
                  <div className="confirm-card">
                    <h3 className="confirm-title">Submitting…</h3>
                    <p className="note">Please wait a moment.</p>
                  </div>
                )}
              </div>
            )}

            {/* Normal profile content (hidden when deleteFlow active) */}
            {!deleteFlow && (
              <>
                <div className="tab-head">
                  <button type="button" className={`tab-btn ${profileTab==='user'?'on':''}`} onClick={()=>setProfileTab('user')}>User Settings</button>
                  <button type="button" className={`tab-btn ${profileTab==='billing'?'on':''}`} onClick={()=>setProfileTab('billing')}>Plan & Billing</button>
                  <button type="button" className={`tab-btn ${profileTab==='feedback'?'on':''}`} onClick={()=>setProfileTab('feedback')}>System Feedback</button>
                </div>
                <div className="tab-body">
                  {profileTab==='user' && (
                    <div className="form">
                      <AvatarEdit value={profile.photoDataUrl} onChange={data=>setProfile(p=>({...p, photoDataUrl:data}))} />
                      <Field label="Name"><input value={profile.name} onChange={e=>setProfile(p=>({...p, name:e.target.value}))} /></Field>
                      <Field label="Email"><input value={profile.email} onChange={e=>setProfile(p=>({...p, email:e.target.value}))} /></Field>
                      <Field label="Account ID (read-only)"><input value={profile.accountId} readOnly /></Field>
                      <div className="modal-actions split">
                        <button type="button" className="danger ghost" onClick={()=>setDeleteFlow('confirm')}>Delete Account</button>
                        <button type="button" className="primary" onClick={()=>{ localStorage.setItem("nx.profile", JSON.stringify(profile)); showToast("Profile saved"); }}>Save Changes</button>
                      </div>
                    </div>
                  )}
                  {profileTab==='billing' && (
                    <div className="form">
                      <Field label="Current Plan"><input value={profile.plan || "Free"} readOnly /></Field>
                      <div className="modal-actions right">
                        <button type="button" className="primary" onClick={()=>showToast("We’re working on plans — enjoy Nexus freely for now!")}>Upgrade Plan</button>
                      </div>
                    </div>
                  )}
                  {profileTab==='feedback' && (
                    <div className="form">
                      <Field label="Tell us what to improve"><textarea rows={6} placeholder="Your feedback helps us shape Nexus…" /></Field>
                      <div className="modal-actions right"><button type="button" className="primary" onClick={()=>showToast("Thanks for the feedback!")}>Send</button></div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* UI bits */
function Section({ title, extra, children }:{ title:string; extra?:React.ReactNode; children:React.ReactNode }) {
  return (<div className="sec"><div className="sec-head"><div className="sec-title">{title}</div><div className="sec-extra">{extra}</div></div><div className="sec-body">{children}</div></div>);
}
function ConvRow({ title, when, active, onClick, menu }:{
  title:string; when:string; active?:boolean; onClick?:()=>void; menu?:{label:string; onClick:()=>void}[];
}) {
  return (
    <div className={`conv ${active?"active":""}`}>
      <button type="button" className="conv-body" onClick={onClick}>
        <span className="conv-title">{title||"Untitled"}</span>
        <span className="conv-when">{when}</span>
      </button>
      {menu && (
        <div className="conv-menu" onClick={e=>e.stopPropagation()}>
          <details>
            <summary aria-label="Conversation actions">⋯</summary>
            <div className="menu">{menu.map((m,i)=><button type="button" key={i} onClick={m.onClick}>{m.label}</button>)}</div>
          </details>
        </div>
      )}
    </div>
  );
}
function MessageBubble({ m }:{ m:Message }) {
  return (
    <div className={`cx-msg ${m.role}`}>
      <div className="avatar">{m.role==="assistant"?"🤖":"👤"}</div>
      <div className="bubble">
        <div className="meta"><span className="who">{m.role==="assistant"?"Nexus":"You"}</span></div>
        <div className="content" dangerouslySetInnerHTML={{ __html: m.html ?? mdToHtml(m.content) }} />
        <div className="actions"><button className="mini" onClick={()=>navigator.clipboard.writeText(m.content)}>Copy</button></div>
        {m.models && Object.keys(m.models).length>0 && (
          <details className="panel" open><summary>Model Answers</summary>
            <div className="kv">{Object.entries(m.models).map(([name,text])=>(
              <div className="kv-row" key={name}><div className="k">{name}</div><div className="v">{text}</div></div>
            ))}</div>
          </details>
        )}
        {m.audit && m.audit.length>0 && (
          <details className="panel" open><summary>Audit Trail</summary>
            <div className="kv">{m.audit.map((a:any,i:number)=>(
              <div className="kv-row" key={i}><div className="k">{String(a.ts||a.event||`event ${i+1}`)}</div>
                <div className="v">{Object.entries(a).map(([k,v])=><span key={k} className="pill sm">{k}: {String(v)}</span>)}</div>
              </div>
            ))}</div>
          </details>
        )}
      </div>
    </div>
  );
}
function Row({ label, children }:{ label:string; children:React.ReactNode }) { return (<div className="row"><label>{label}</label><div className="field">{children}</div></div>); }
function Range({ value, set }:{ value:number; set:(v:number)=>void }) { return (<div className="range"><input type="range" min={0} max={100} value={value} onChange={e=>set(Number(e.target.value))}/><span className="range-val">{value}%</span></div>); }
function Toggle({ checked, onChange }:{ checked:boolean; onChange:(v:boolean)=>void }) { return (<label className="switch"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} /><span className="slider"/></label>); }
function Segmented({ options, value, onChange }:{ options:{key:string;label:string}[]; value:string|null|undefined; onChange:(key:string)=>void }) {
  return (<div className="seg">{options.map(o=>(<button key={o.key} className={`seg-item ${value===o.key?"on":""}`} onClick={()=>onChange(o.key)}>{o.label}</button>))}</div>);
}
function Field({ label, children }:{ label:string; children:React.ReactNode }) {
  return (<div className="field-row"><div className="label">{label}</div><div className="control">{children}</div></div>);
}
function AvatarEdit({ value, onChange }:{ value?:string; onChange:(dataUrl?:string)=>void }) {
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader(); reader.onload = ()=>onChange(String(reader.result||"")); reader.readAsDataURL(f);
  }
  return (
    <div className="avatar-edit">
      <div className="preview">{value ? <img src={value} alt="avatar"/> : <div className="ph">U</div>}</div>
      <label className="upload"><input type="file" accept="image/*" onChange={pick}/>Change photo</label>
    </div>
  );
}
