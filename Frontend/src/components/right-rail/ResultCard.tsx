import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import ResultSkeleton from '../primitives/ResultSkeleton';
import Placeholder from '../primitives/Placeholder';
const ResultCard: React.FC<{ running:boolean; result: null | { confidence:number; explanations:string[]; votes:any[] } }>=({running,result})=> (
  <CollapsibleCard id="result" title="Result" subtitle={result? <span className="text-xs" style={{color:'rgba(0,0,0,.5)'}}>{Math.round(result.confidence*100)}% consensus</span>:undefined}>
    {!result && !running ? (<Placeholder label="No result yet. Send a message to run." />) : running && !result ? (<ResultSkeleton />) : (
      <div className="space-y-4 text-sm">
        <div className="font-medium mb-1">Why this answer</div>
        <ul className="list-disc ml-5 space-y-1">{result!.explanations.map((e,i)=>(<li key={i}>{e}</li>))}</ul>
        <div>
          <div className="font-medium mb-1">Model votes</div>
          <div className="grid grid-cols-2 gap-2">{result!.votes.map((v:any,i:number)=>(<div key={i} className="rounded-xl card-token p-2"><div className="font-semibold">{v.model}</div><div className="text-xs">Agreement: {v.agrees? '✔':'✖'}</div><div className="text-xs">Score: {v.score}</div></div>))}</div>
        </div>
      </div>
    )}
  </CollapsibleCard>
);
export default ResultCard;
