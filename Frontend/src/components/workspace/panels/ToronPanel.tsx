import React, { useState } from 'react';

const ToronPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(
    'Toron will synthesize insights, trends, and reasoning here once analysis is triggered.'
  );

  const handleAnalyze = () => {
    setAnalysis(`Analyzing: ${prompt || 'latest workspace signals'}...`);
  };

  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-2xl font-semibold">Toron Analysis</h3>
        <p className="text-white/70">Inspect activity streams and reasoning traces.</p>
      </div>
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Toron to analyze your workspace..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          onClick={handleAnalyze}
          className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 font-semibold"
        >
          Analyze
        </button>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 min-h-[160px] text-white/80">
        {analysis}
      </div>
    </div>
  );
};

export default ToronPanel;
