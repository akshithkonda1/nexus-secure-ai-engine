import React from 'react';
const ResultSkeleton: React.FC = () => (
  <div className="space-y-3">{[...Array(3)].map((_,i)=>(<div key={i} className="h-3 rounded" style={{background:'linear-gradient(90deg, rgba(148,163,184,0.2), rgba(148,163,184,0.35), rgba(148,163,184,0.2))',backgroundSize:'200% 100%',animation:'pulse 1.2s ease-in-out infinite'}}/>))}</div>
);
export default ResultSkeleton;
