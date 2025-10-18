import React, { Suspense, useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import ChatList from '../components/chat/ChatList';
import Composer from '../components/chat/Composer';
import { ThemeStyles } from '../components/ThemeStyles';
import ResultCard from '../components/right-rail/ResultCard';
import AnswersCard from '../components/right-rail/AnswersCard';
import AuditTrailCard from '../components/right-rail/AuditTrailCard';
import SecurityCard from '../components/right-rail/SecurityCard';
import ChatSidebar from '../components/sidebar/ChatSidebar';
import { genId } from '../lib/id';
import { priorityTier } from '../lib/priority';
import type { Message } from '../types/chat';
import { SessionService } from '../state/sessions';
import type { SessionRow } from '../state/sessions';
import { useDarkMode } from '../hooks/useDarkMode';
import { readProfile, writeProfile, type UserProfile } from '../state/profile';

const ProfileModal = React.lazy(()=> import('../components/modals/ProfileModal'));

const ChatPage: React.FC<{ onOpenSettings: ()=>void }>=({onOpenSettings})=>{
  const { isDark, setIsDark } = useDarkMode();
  const [profileOpen,setProfileOpen]=useState(false);
  const [profile,setProfile]=useState<UserProfile>(()=>readProfile());

  const [sessions,setSessions]=useState<SessionRow[]>(()=>SessionService.list());
  const [archived,setArchived]=useState<SessionRow[]>(()=>SessionService.listArchived());
  const [deleted,setDeleted]=useState<SessionRow[]>(()=>SessionService.listDeleted());
  const refreshSessions=()=>{ setSessions(SessionService.list()); setArchived(SessionService.listArchived()); setDeleted(SessionService.listDeleted()); };
  const [activeSessionId,setActiveSessionId]=useState<string|null>(()=> sessions[0]?.id || null);
  const allSessions=useMemo<SessionRow[]>(()=>[...sessions,...archived,...deleted],[sessions,archived,deleted]);
  const activeSession=useMemo(()=> allSessions.find((s)=>s.id===activeSessionId)||null,[allSessions,activeSessionId]);
  const [messages,setMessages]=useState<Message[]>(()=> activeSessionId? SessionService.messages(activeSessionId) : []);
  useEffect(()=>{ setMessages(activeSessionId? SessionService.messages(activeSessionId) : []); }, [activeSessionId]);

  // demo state
  const [running,setRunning]=useState(false);
  const [result,setResult]=useState<any>(null);
  const [answers,setAnswers]=useState<any[]|null>(null);
  const [events,setEvents]=useState<any[]>([]);
  const [uiSessionId]=useState(()=>genId().slice(0,8));

  const log=(action:string, meta:any={})=> setEvents(a=>[{ts:Date.now(),action,meta},...a].slice(0,120));

  const send=(text:string)=>{
    if(!activeSessionId){ const s=SessionService.create('New chat'); refreshSessions(); setActiveSessionId(s.id); }
    const sid=activeSessionId || SessionService.list()[0]?.id; if(!sid) return;
    const next=[...messages, { id:genId(), role:'user', text, ts:Date.now() } as Message];
    setMessages(next); SessionService.saveMessages(sid,next);
    setRunning(true); setResult(null); setAnswers(null);
    log('orchestrate.start',{ models:['grok','chatgpt','claude','perplexity']});
    setTimeout(()=>{
      const a=['grok','chatgpt','claude','perplexity'].map((id,i)=>({ model:id, ms:700+i*120+Math.floor(Math.random()*300), text:`Answer from ${id}: ${text}` }));
      const conf=Math.min(0.98, 0.55 + 4*0.08 + 0.06);
      const res={ confidence:+conf.toFixed(2), votes: a.map((ans)=>({ model: ans.model, agrees: true, score: +conf.toFixed(2) })), explanations:['Cross-checked claims.','Applied consensus threshold.'] };
      setResult(res); setAnswers(a); setRunning(false); log('orchestrate.finish',{confidence:res.confidence, models:res.votes.length});

      const normalized=a.map(x=> x.text.replace(/^Answer from [^:]+:\s*/, '').trim());
      const freq=new Map<string,{count:number; idxs:number[]}>();
      normalized.forEach((t,i)=>{const k=t.toLowerCase(); const v=freq.get(k)||{count:0,idxs:[]}; v.count++; v.idxs.push(i); freq.set(k,v);});
      let bestKey:string|null=null, bestCount=0; for(const [k,v] of freq.entries()){ if(v.count>bestCount){bestCount=v.count; bestKey=k;} }
      let bestIdx=0; if(bestKey!==null){ const c=freq.get(bestKey)!.idxs; bestIdx=c[0]; }
      const overall=normalized[bestIdx] || normalized[0] || '';
      const meta=`Consensus ${Math.round(res.confidence*100)}% • ${res.votes.length} models • tier: ${priorityTier(res.votes.length)}`;
      const final=[...next, { id:genId(), role:'assistant', text:overall, meta, ts:Date.now() } as Message];
      setMessages(final); SessionService.saveMessages(sid, final);
    }, 600);
  };

  useEffect(()=>{
    // Ensure at least one session exists
    if((sessions?.length??0)===0 && (archived?.length??0)===0 && (deleted?.length??0)===0){ const s=SessionService.create('New chat'); refreshSessions(); setActiveSessionId(s.id); }
  }, []);
  useEffect(()=>{ const exists=allSessions.some((s:any)=>s.id===activeSessionId); if(!exists){ const fb=(sessions?.[0]||archived?.[0]||deleted?.[0]||null) as any; setActiveSessionId(fb? fb.id : null); } }, [allSessions,sessions,archived,deleted,activeSessionId]);

  return (
    <div className="chatgpt-app">
      <ThemeStyles/>
      <div className="chatgpt-shell">
        <ChatSidebar
          sessions={sessions}
          archived={archived}
          deleted={deleted}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onNewChat={()=>{ const s=SessionService.create('New chat'); refreshSessions(); setActiveSessionId(s.id); }}
          onRename={(id)=>{ const cur=allSessions.find((s)=>s.id===id); const t=prompt('Rename session', cur?.title||''); if(t && t.trim()){ SessionService.update(id,{title:t.trim()}); refreshSessions(); } }}
          onArchive={(id)=>{ SessionService.archive(id); refreshSessions(); if(id===activeSessionId){ setActiveSessionId(SessionService.list()?.[0]?.id||null); } }}
          onRestore={(id)=>{ SessionService.restore(id); refreshSessions(); setActiveSessionId(id); }}
          onSoftDelete={(id)=>{ SessionService.softDelete(id); refreshSessions(); if(id===activeSessionId){ setActiveSessionId(SessionService.list()?.[0]?.id||null); } }}
          onDestroy={(id)=>{ if(!confirm('Permanently destroy this session?')) return; SessionService.remove(id); refreshSessions(); if(id===activeSessionId){ setActiveSessionId(SessionService.list()?.[0]?.id||null); } }}
          onOpenSettings={onOpenSettings}
          onToggleTheme={()=>setIsDark(!isDark)}
          isDark={isDark}
        />
        <main className="chatgpt-main">
          <TopBar
            isDark={isDark}
            onToggleTheme={()=>setIsDark(!isDark)}
            onOpenProfile={()=>setProfileOpen(true)}
            profileAvatar={profile.avatarDataUrl}
          />
          <ChatList messages={messages}/>
          <div className="chatgpt-composer-area">
            <Composer onSend={send} disabled={running}/>
            <p className="chatgpt-composer-hint">Nexus is an experimental AI platform—responses are verified but not guaranteed to be accurate or final.</p>
          </div>
        </main>
        <aside className="chatgpt-right-rail">
          <ResultCard running={running} result={result}/>
          <AnswersCard running={running} answers={answers}/>
          <AuditTrailCard events={events}/>
          <SecurityCard redactPII={true} uiSessionId={uiSessionId}/>
        </aside>
      </div>
      <Suspense fallback={null}>
        {profileOpen && (
          <ProfileModal
            open={profileOpen}
            onClose={()=>setProfileOpen(false)}
            profile={profile}
            onProfileChange={(next)=>{
              setProfile(next);
              writeProfile(next);
            }}
            onDeleteAccount={(feedback)=>{
              console.info('Account deletion requested', { feedback });
              setProfileOpen(false);
            }}
            onUpgradePlan={()=>{
              if(typeof window!=='undefined'){
                window.open('https://nexus-secure.ai/upgrade', '_blank', 'noopener,noreferrer');
              }
              console.info('Upgrade plan CTA triggered');
            }}
          />
        )}
      </Suspense>
    </div>
  );
};
export default ChatPage;
