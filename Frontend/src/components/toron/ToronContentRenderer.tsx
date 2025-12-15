import React, { useMemo } from "react";

export type RenderFormat = "text" | "code" | "json" | "table" | "diff";

export interface ToronContentRendererProps {
  content: string;
  formatHint?: RenderFormat;
}

const isJson = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object";
  } catch {
    return false;
  }
};

const detectFormat = (content: string, hint?: RenderFormat): RenderFormat => {
  if (hint) return hint;
  if (/```/.test(content)) return "code";
  if (/^\{[\s\S]*\}$/.test(content.trim()) && isJson(content)) return "json";
  if (/^diff\n/.test(content.trim()) || /^[-+@]/m.test(content)) return "diff";
  if (/\|/.test(content) && /\n\|/.test(content)) return "table";
  return "text";
};

const renderCode = (content: string) => {
  const normalized = content.replace(/```[a-zA-Z]*/g, "").trim();
  return (
    <pre className="toron-render code" aria-label="Code output">
      <code>{normalized}</code>
    </pre>
  );
};

const renderJson = (content: string) => {
  let formatted = content;
  try {
    formatted = JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    // keep original payload for fidelity
  }
  return (
    <pre className="toron-render json" aria-label="JSON output">
      <code>{formatted}</code>
    </pre>
  );
};

const renderTable = (content: string) => {
  const rows = content
    .trim()
    .split("\n")
    .map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length > 0);

  if (rows.length === 0) return <div className="toron-render text">{content}</div>;

  const [header, ...body] = rows;
  return (
    <div className="toron-render table" role="table" aria-label="Tabular output">
      <div className="toron-render-row header" role="row">
        {header.map((cell, idx) => (
          <div key={idx} className="toron-render-cell" role="columnheader">
            {cell}
          </div>
        ))}
      </div>
      {body.map((row, rowIndex) => (
        <div key={rowIndex} className="toron-render-row" role="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className="toron-render-cell" role="cell">
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const renderDiff = (content: string) => {
  const lines = content.trim().split("\n");
  return (
    <pre className="toron-render diff" aria-label="Diff output">
      <code>
        {lines.map((line, idx) => (
          <span key={idx} className={`diff-line ${line.startsWith("+") ? "added" : line.startsWith("-") ? "removed" : ""}`}>
            {line}
            {"\n"}
          </span>
        ))}
      </code>
    </pre>
  );
};

const renderText = (content: string) => {
  return (
    <div className="toron-render text" aria-label="Text output">
      <pre>{content}</pre>
    </div>
  );
};

const ToronContentRenderer: React.FC<ToronContentRendererProps> = ({ content, formatHint }) => {
  const format = useMemo(() => detectFormat(content, formatHint), [content, formatHint]);

  switch (format) {
    case "code":
      return renderCode(content);
    case "json":
      return renderJson(content);
    case "table":
      return renderTable(content);
    case "diff":
      return renderDiff(content);
    default:
      return renderText(content);
  }
};

export default ToronContentRenderer;
