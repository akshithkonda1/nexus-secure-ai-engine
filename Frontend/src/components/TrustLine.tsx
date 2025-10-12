export function TrustLine({ models, sources, ms, confidence }:{
  models:number; sources:number; ms:number; confidence:number;
}) {
  return (
    <div className="text-xs opacity-70">
      {models} models • {sources} sources • {(ms/1000).toFixed(1)}s • confidence {confidence.toFixed(2)}
    </div>
  );
}
