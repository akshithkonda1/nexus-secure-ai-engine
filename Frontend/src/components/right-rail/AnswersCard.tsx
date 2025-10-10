import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import Placeholder from '../primitives/Placeholder';
import ResultSkeleton from '../primitives/ResultSkeleton';
const AnswersCard: React.FC<{ running:boolean; answers: Array<{model:string; ms:number; text:string}>|null }>=({running,answers})=> (
  <CollapsibleCard id="answers" title="Answers" subtitle={answers? <span className="text-xs" style={{color:'rgba(0,0,0,.5)'}}>{answers.length} models</span>:undefined}>
    {!answers? (running? <ResultSkeleton/> : <Placeholder label="Per-model answers (with latency) will appear here after you send a message." />) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{answers.map((a,i)=>(<div key={i} className="rounded-xl card-token p-3"><div className="flex items-center justify-between"><div className="text-sm font-semibold">{a.model}</div><div className="text-xs" style={{color:'rgba(0,0,0,.5)'}}>{a.ms} ms</div></div><div className="text-sm mt-2 whitespace-pre-wrap break-words">{a.text}</div></div>))}</div>
    )}
  </CollapsibleCard>
);
export default AnswersCard;
