import React from "react";

type SourceRef = { url: string; title?: string; snippet?: string };

export default function SourcesList({ sources }: { sources: SourceRef[] }) {
  return (
    <details className="sources">
      <summary>Sources verified by Nexus ({sources.length})</summary>
      <ul>
        {sources.map((source, index) => (
          <li key={index}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title || source.url}
            </a>
            {source.snippet ? <div className="snippet">{source.snippet}</div> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
