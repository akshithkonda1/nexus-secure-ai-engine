import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import ResultSkeleton from '../primitives/ResultSkeleton';
import Placeholder from '../primitives/Placeholder';
const ResultCard: React.FC<{ running:boolean; result: null | { confidence:number; explanations:string[]; votes:any[] } }>=({running,result})=> (
  <CollapsibleCard id="result" title="Consensus result" subtitle={result? <span>{Math.round(result.confidence*100)}% confidence</span>: running? <span>Running…</span> : undefined}>
    {!result && !running ? (<Placeholder label="No result yet. Send a message to run." />) : running && !result ? (<ResultSkeleton />) : (
      <div className="space-y-4" style={{ fontSize: '0.9rem' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Why this answer</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.4rem', lineHeight: 1.5 }}>
            {result!.explanations.map((e,i)=>(<li key={i}>{e}</li>))}
          </ul>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Model votes</div>
          <div className="chatgpt-votes-grid">
            {result!.votes.map((v:any,i:number)=>(
              <div key={i} className="chatgpt-vote-tile">
                <strong>{v.model}</strong>
                <div className={`chatgpt-vote-agreement ${v.agrees? 'agree':'disagree'}`}>
                  {v.agrees? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                  <span>{v.agrees? 'Agreed':'Disagreed'}</span>
                </div>
                <div className="chatgpt-vote-meta">Score: {v.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </CollapsibleCard>
);
export default ResultCard;
