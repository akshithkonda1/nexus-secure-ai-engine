import React, { useEffect } from 'react';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import { genId } from './lib/id';

export default function App(){
  const [route,setRoute]=React.useState<'chat'|'settings'>('chat');
  // runtime tests
  useEffect(()=>{
    if ((import.meta as any)?.env?.DEV) {
      try {
        const ids=new Set([genId(),genId(),genId(),genId()]);
        console.assert(ids.size===4,'genId uniqueness');
      } catch(e){ console.warn('Dev tests warning', e); }
    }
  },[]);

  return route==='chat' ? <ChatPage onOpenSettings={()=>setRoute('settings')} /> : <SettingsPage onBack={()=>setRoute('chat')} />
}
