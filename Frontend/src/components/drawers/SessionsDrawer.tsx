import React from 'react';
import TabButton from '../primitives/TabButton';
import IconButton from '../primitives/IconButton';
import Card from '../primitives/Card';
import { formatRelative } from '../../lib/time';

const SessionsDrawer: React.FC<{ open:boolean; onClose:()=>void; sessionTab: 'active'|'archived'|'deleted'; setSessionTab:(t:'active'|'archived'|'deleted')=>void; filteredList:any[]; activeSessionId:string|null; setActiveSessionId:(id:string)=>void; onNewChat:()=>void; onRename:(id:string)=>void; onArchive:(id:string)=>void; onRestore:(id:string)=>void; onSoftDelete:(id:string)=>void; onDestroy:(id:string)=>void; counts:{active:number; archived:number; deleted:number} }>=({open,onClose,sessionTab,setSessionTab,filteredList,activeSessionId,setActiveSessionId,onNewChat,onRename,onArchive,onRestore,onSoftDelete,onDestroy,counts})=>{
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-token">
        <div className="h-full flex flex-col" style={{borderRight:'1px solid rgb(var(--border))'}}>
          <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
            <button onClick={onClose} className="p-2 rounded-xl card-token" aria-label="Close">←</button>
            <button onClick={onNewChat} className="px-2 py-1 rounded-xl bg-[rgb(var(--ring))] text-white text-xs">＋ New chat</button>
          </div>
          <div className="px-3 pt-2 flex items-center gap-2 text-xs">
            <TabButton active={sessionTab==='active'} label={`Active (${counts.active})`} onClick={()=>setSessionTab('active')} />
            <TabButton active={sessionTab==='archived'} label={`Archived (${counts.archived})`} onClick={()=>setSessionTab('archived')} />
            <TabButton active={sessionTab==='deleted'} label={`Deleted (${counts.deleted})`} onClick={()=>setSessionTab('deleted')} />
          </div>
          <div className="flex-1 overflow-auto">
            {filteredList.length===0? <div className="text-sm px-3 py-4 opacity-70">No sessions.</div> : (
              <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
                {filteredList.map((s:any)=> (
                  <li key={s.id} className="p-3 cursor-pointer" style={{backgroundColor: activeSessionId===s.id? 'rgba(0,0,0,.03)': 'transparent'}} onClick={()=>{ setActiveSessionId(s.id); onClose(); }}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.title}</div>
                        <div className="text-[11px] opacity-70">{formatRelative(s.updatedAt)}{s.archivedAt? ' • archived':''}{s.deletedAt? ' • deleted':''}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {sessionTab==='active' && (<>
                          <IconButton label="Rename" onClick={e=>{e.stopPropagation(); onRename(s.id);}}>✎</IconButton>
                          <IconButton label="Archive" onClick={e=>{e.stopPropagation(); onArchive(s.id);}}>🗄</IconButton>
                          <IconButton label="Delete" onClick={e=>{e.stopPropagation(); onSoftDelete(s.id);}}>🗑</IconButton>
                        </>)}
                        {sessionTab==='archived' && (<>
                          <IconButton label="Restore" onClick={e=>{e.stopPropagation(); onRestore(s.id);}}>↩</IconButton>
                          <IconButton label="Move to Deleted" onClick={e=>{e.stopPropagation(); onSoftDelete(s.id);}}>🗑</IconButton>
                        </>)}
                        {sessionTab==='deleted' && (<>
                          <IconButton label="Restore" onClick={e=>{e.stopPropagation(); onRestore(s.id);}}>↩</IconButton>
                          <IconButton label="Destroy permanently" onClick={e=>{e.stopPropagation(); onDestroy(s.id);}}>✖</IconButton>
                        </>)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3" style={{ borderTop: '1px solid rgb(var(--border))' }}>
            <Card>
              <div className="text-xs opacity-70">Session Memory</div>
              <div className="text-xs opacity-70">(Move your memory textarea here if desired)</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SessionsDrawer;
