import React from 'react';
const ResultSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        style={{
          height: 10,
          borderRadius: 9999,
          background: 'linear-gradient(90deg, rgba(148,163,184,0.15), rgba(148,163,184,0.35), rgba(148,163,184,0.15))',
          backgroundSize: '200% 100%',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      />
    ))}
  </div>
);
export default ResultSkeleton;
