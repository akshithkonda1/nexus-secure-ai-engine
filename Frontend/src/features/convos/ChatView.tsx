import React, { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Download, Moon, Sun, Trash2 } from "lucide-react";
import { useConversations } from "./useConversations";
import { askJSON, askSSE } from "./api";
import { mdToHtml } from "./md";
import { Message } from "./types";
import { useNavigationGuards } from "./useNavigationGuards";
import "../../styles/nexus-convos.css";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

export default function ChatView() {
  useNavigationGuards();

  const {
    convos, current, currentId, setCurrentId,
    ensureCurrent, rename, append, updateMessage, setStatus, purge, purgeAllTrash
  } = useConversations();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return (document.documentElement.dataset.theme as "dark"|"light") || (prefersDark ? "dark" : "light");
  });
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  function formatDate(ts: number) {
    const d=new Date(ts), diff=Date.now()-ts;
    if (diff<3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString();
  }

  async function send() {
    const prompt = input.trim(); if (!prompt || busy) return;
    setInput(""); setBusy(true);

    const conv = await ensureCurrent();
    if (conv.messages.length === 0) await rename(conv.id, prompt.length>50?prompt.slice(0,50)+"…":prompt);

    const userMsg: Message = { id: uid(), role: "user", content: prompt, html: mdToHtml(prompt) };
    const asstMsg: Message = { id: uid(), role: "assistant", content: "", html: "" };
    await append(conv.id, userMsg);
    await append(conv.id, asstMsg);
    setCurrentId(conv.id);

    const headers: Record<string,string> = {
      "X-Nexus-Web-Pct": "50",
      "X-Nexus-AI-Pct": "50",
      "X-Nexus-Use-Both": "1",
      "X-Nexus-Consensus-Before-Web": "1",
      "X-Nexus-Preferred": "",
      "X-Nexus-Mode": "balanced"
    };

    const patch = (content: string, meta?: any) => {
      updateMessage(conv.id, asstMsg.id, {
        content,
        html: mdToHtml(content),
        models: meta?.model_answers ?? meta?.models,
        audit: meta?.audit ?? meta?.audit_events
      });
    };

    try {
      const controller = new AbortController();
      streamAbortRef.current = controller;
      await askSSE(prompt, headers, patch, controller.signal);
    } catch {
      await askJSON(prompt, headers, patch);
    } finally {
      streamAbortRef.current = null;
      setBusy(false);
    }
  }

  function stop() { streamAbortRef.current?.abort(); streamAbortRef.current=null; setBusy(false); }
  async function regenerate() {
    if (!current || busy) return;
    const lastUser = [...current.messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    // clear last assistant
    const lastAsstIndex = [...current.messages].length - 1;
    const lastAsst = current.messages[lastAsstIndex];
    if (lastAsst?.role === "assistant") await updateMessage(current.id, lastAsst.id, { content: "", html: "" });
    setBusy(true);
    try {
      const controller = new AbortController();
      streamAbortRef.current = controller;
      await askSSE(lastUser.content, {}, (c,m)=>updateMessage(current.id,lastAsst.id,{content:c,html:mdToHtml(c),models:m?.model_answers ?? m?.models,audit:m?.audit ?? m?.audit_events}), controller.signal);
    } catch {
      await askJSON(lastUser.content, {}, (c,m)=>updateMessage(current.id,lastAsst.id,{content:c,html:mdToHtml(c),models:m?.model_answers ?? m?.models,audit:m?.audit ?? m?.audit_events}));
    } finally { streamAbortRef.current=null; setBusy(false); }
  }

  function exportConversation() {
    if (!current) return;
    const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(current,null,2));
    const a = document.createElement("a");
    a.href = dataStr; a.download = `${current.title.replace(/\s+/g,"_")}.json`; a.click();
  }

  const active = useMemo(()=>convos.filter(c=>c.status==="active"),[convos]);
  const archived = useMemo(()=>convos.filter(c=>c.status==="archived"),[convos]);
  const trash = useMemo(()=>convos.filter(c=>c.status==="trash"),[convos]);

  const previewFor = (messages: Message[]) => {
    if (!messages.length) return "";
    const last = messages[messages.length - 1];
    const content = last?.content ?? "";
    return content.length > 40 ? `${content.slice(0, 40)}…` : content;
  };

  return (
    <div className="nx-wrap">
      {/* Sidebar */}
      <aside className="nx-side">
        <div className="nx-side-header">
          <button type="button" className="primary" onClick={async()=>{ const c=await ensureCurrent(); setCurrentId(c.id); }}>
            ＋ New chat
          </button>
          <div className="theme">
            <button type="button" className="icon-btn" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>
              {theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}
            </button>
          </div>
        </div>

        <Section title={`Active (${active.length})`}>
          {active.length===0 ? <Empty label="Nothing active"/> :
            active.map(c=>(
              <ConvRow key={c.id}
                title={c.title}
                subtitle={previewFor(c.messages)}
                when={formatDate(c.updatedAt)}
                active={c.id===currentId}
                onClick={()=>setCurrentId(c.id)}
                actions={[
                  {label:"Archive", onClick:()=>setStatus(c.id,"archived")},
                  {label:"Delete",  onClick:()=>setStatus(c.id,"trash")}
                ]}
              />
            ))
          }
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length===0 ? <Empty label="Nothing archived"/> :
            archived.map(c=>(
              <ConvRow key={c.id}
                title={c.title}
                subtitle={previewFor(c.messages)}
                when={formatDate(c.updatedAt)}
                active={c.id===currentId}
                onClick={()=>setCurrentId(c.id)}
                actions={[
                  {label:"Restore", onClick:()=>setStatus(c.id,"active")},
                  {label:"Delete",  onClick:()=>setStatus(c.id,"trash")}
                ]}
              />
            ))
          }
        </Section>

        <Section title={`Trash (${trash.length})`} extra={<button type="button" className="danger sm" onClick={purgeAllTrash}>Empty Trash</button>}>
          {trash.length===0 ? <Empty label="Trash is empty"/> :
            trash.map(c=>(
              <ConvRow key={c.id}
                title={c.title}
                subtitle={previewFor(c.messages)}
                when={formatDate(c.updatedAt)}
                active={c.id===currentId}
                onClick={()=>setCurrentId(c.id)}
                actions={[
                  {label:"Restore", onClick:()=>setStatus(c.id,"active")},
                  {label:"Purge",   onClick:()=>purge(c.id)}
                ]}
              />
            ))
          }
        </Section>
      </aside>

      {/* Main */}
      <main className="nx-main">
        <header className="nx-top">
          {current ? (
            <>
              <h2 className="title">{current.title}</h2>
              <div className="actions">
                <button type="button" className="btn" onClick={exportConversation}><Download size={16}/> Export</button>
                <button type="button" className="btn" onClick={()=>setStatus(current.id, current.status==="archived"?"active":"archived")}><Archive size={16}/> {current.status==="archived"?"Unarchive":"Archive"}</button>
                <button type="button" className="btn danger" onClick={()=>setStatus(current.id,"trash")}><Trash2 size={16}/> Delete</button>
              </div>
            </>
          ) : <h2 className="title">New chat</h2>}
        </header>

        <div className="cx-stream">
          <div className="cx-stream-inner">
            {!current || current.messages.length===0 ? (
              <div className="cx-hero">
                <h1>How can Nexus help today?</h1>
                <p className="muted">Ask a question, paste a document, or say “/help”.</p>
                <div className="quick">
                  <button type="button" onClick={()=>setInput("Explain transformers like I’m 12")}>Explain simply</button>
                  <button type="button" onClick={()=>setInput("Summarize the following article:\n")}>Summarize</button>
                  <button type="button" onClick={()=>setInput("Draft a concise email about…")}>Draft an email</button>
                </div>
              </div>
            ) : current.messages.map(m=>(
              <div key={m.id} className={`cx-msg ${m.role}`}>
                <div className="bubble" dangerouslySetInnerHTML={{ __html: m.html || mdToHtml(m.content) }} />
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <form className="cx-compose" onSubmit={(e)=>{ e.preventDefault(); if(!busy) send(); }}>
          <div className="cx-compose-inner">
            {!busy ? (
              <button type="button" className="icon-btn" title="Regenerate" onClick={regenerate}>↻</button>
            ) : (
              <button type="button" className="icon-btn danger" title="Stop" onClick={stop}>■</button>
            )}
            <input
              className="cx-input"
              placeholder="Ask Nexus…"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); if(!busy) send(); } }}
            />
            <button type="submit" className="cx-send" disabled={busy || !input.trim()}>{busy ? "Sending…" : "Send"}</button>
          </div>
          <div className="cx-hint">Enter to send • Shift+Enter for newline</div>
        </form>
      </main>
    </div>
  );
}

function Section({ title, extra, children }:{title:string; extra?:React.ReactNode; children:React.ReactNode}) {
  return (
    <div className="sect">
      <div className="sect-head">
        <div className="sect-title">{title}</div>
        {extra}
      </div>
      <div className="sect-body">{children}</div>
    </div>
  );
}

function Empty({ label }:{label:string}) {
  return <div className="empty">{label}</div>;
}

function ConvRow({
  title, subtitle, when, active, onClick, actions
}:{
  title:string; subtitle?:string; when:string; active?:boolean; onClick?:()=>void;
  actions?: {label:string; onClick:()=>void}[];
}) {
  return (
    <div className={`conv ${active?"active":""}`} onClick={onClick}>
      <div className="conv-text">
        <div className="conv-title">{title || "Untitled"}</div>
        {subtitle && <div className="conv-sub">{subtitle}</div>}
      </div>
      <div className="conv-when">{when}</div>
      {actions?.length ? (
        <div className="conv-menu" onClick={e=>e.stopPropagation()}>
          {actions.map((a,i)=><button type="button" key={i} onClick={a.onClick} className="pill sm">{a.label}</button>)}
        </div>
      ) : null}
    </div>
  );
}
