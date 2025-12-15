import React, { useState } from "react";
import { Copy, Edit3, Ellipsis, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import ToronContentRenderer from "./ToronContentRenderer";

export interface ToronMessageMetadata {
  confidenceScore?: number;
  agreementLevel?: "aligned" | "divergent" | "neutral";
  evidenceDensity?: "low" | "medium" | "high";
  escalationNote?: string;
  warnings?: string[];
  sources?: string[];
}

export interface ToronAdvancedMessageProps {
  label: string;
  content: string;
  role: "assistant" | "user";
  metadata?: ToronMessageMetadata;
  onRegenerate?: () => void;
}

const formatConfidence = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
};

const ToronAdvancedMessage: React.FC<ToronAdvancedMessageProps> = ({
  label,
  content,
  role,
  metadata,
  onRegenerate,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = Boolean(
    metadata?.confidenceScore !== undefined ||
      metadata?.agreementLevel ||
      metadata?.evidenceDensity ||
      metadata?.escalationNote ||
      (metadata?.warnings && metadata.warnings.length > 0) ||
      (metadata?.sources && metadata.sources.length > 0)
  );

  return (
    <article className={`toron-message ${role}`}>
      <div className="toron-message-top">
        <span className="toron-label" aria-label={label}>
          {label}
        </span>
        <div className="toron-actions" aria-label="message actions">
          {role === "assistant" ? (
            <>
              <button type="button" className="toron-action" aria-label="Copy Toron message">
                <Copy size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="Mark good response">
                <ThumbsUp size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="Mark bad response">
                <ThumbsDown size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="Regenerate Toron message" onClick={onRegenerate}>
                <RefreshCw size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="Read message aloud">
                <Volume2 size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="More actions">
                <Ellipsis size={14} strokeWidth={2} aria-hidden />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="toron-action" aria-label="Edit message">
                <Edit3 size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="Copy message">
                <Copy size={14} strokeWidth={2} aria-hidden />
              </button>
              <button type="button" className="toron-action" aria-label="More actions">
                <Ellipsis size={14} strokeWidth={2} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="toron-message-body">
        <ToronContentRenderer content={content} />
      </div>
      {hasMetadata && (
        <div className="toron-meta-shell">
          <button
            type="button"
            className="toron-meta-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span>Signal</span>
            <span className="toron-meta-status">{expanded ? "Hide" : "Show"} process transparency</span>
          </button>
          {expanded && (
            <div className="toron-meta-panel" role="list">
              {metadata?.confidenceScore !== undefined && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Confidence</span>
                  <span className="toron-meta-value">{formatConfidence(metadata.confidenceScore)}</span>
                </div>
              )}
              {metadata?.agreementLevel && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Agreement</span>
                  <span className="toron-meta-value">{metadata.agreementLevel}</span>
                </div>
              )}
              {metadata?.evidenceDensity && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Evidence density</span>
                  <span className="toron-meta-value">{metadata.evidenceDensity}</span>
                </div>
              )}
              {metadata?.escalationNote && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Escalation</span>
                  <span className="toron-meta-value">{metadata.escalationNote}</span>
                </div>
              )}
              {metadata?.warnings && metadata.warnings.length > 0 && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Warnings</span>
                  <div className="toron-meta-badges">
                    {metadata.warnings.map((warning) => (
                      <span key={warning} className="toron-meta-pill">
                        {warning}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {metadata?.sources && metadata.sources.length > 0 && (
                <div className="toron-meta-item" role="listitem">
                  <span className="toron-meta-label">Sources</span>
                  <div className="toron-meta-badges">
                    {metadata.sources.map((source) => (
                      <span key={source} className="toron-meta-pill">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default ToronAdvancedMessage;
