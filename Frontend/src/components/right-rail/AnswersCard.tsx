import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import Placeholder from '../primitives/Placeholder';
import ResultSkeleton from '../primitives/ResultSkeleton';
const AnswersCard: React.FC<{ running:boolean; answers: Array<{model:string; ms:number; text:string}>|null }>=({running,answers})=> (
  <CollapsibleCard id="answers" title="Model answers" subtitle={answers? <span>{answers.length} models</span>:undefined}>
    {!answers? (running? <ResultSkeleton/> : <Placeholder label="Per-model answers (with latency) will appear here after you send a message." />) : (
      <div className="chatgpt-answer-grid">
        {answers.map((a,i)=>(
          <div key={i} className="chatgpt-answer-tile">
            <h5>{a.model}</h5>
            <div className="chatgpt-answer-meta">{a.ms} ms</div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{a.text}</p>
          </div>
        ))}
      </div>
    )}
  </CollapsibleCard>
);
export default AnswersCard;
