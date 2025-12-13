import React from "react";

interface Insight {
  title: string;
  description: string;
}

const mockInsights: Insight[] = [
  { title: "Temporal reasoning", description: "Built your schedule from tasks and calendar." },
  { title: "Priority mapping", description: "Connected intentions to actions across lists." },
];

const ToronInsights: React.FC = () => {
  return (
    <section className="toron-insights">
      <h3>Toron Insights</h3>
      <ul>
        {mockInsights.map((insight) => (
          <li key={insight.title}>
            <strong>{insight.title}</strong>
            <p>{insight.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ToronInsights;
