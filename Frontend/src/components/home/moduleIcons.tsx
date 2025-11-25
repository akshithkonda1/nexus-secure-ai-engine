import React from "react";

export const NeuralLoadIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

// Pipelines
export const PipelinesIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Connectors
export const ConnectorsIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="12" r="3" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
);

// Workspace
export const WorkspaceIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
  </svg>
);

// Telemetry
export const TelemetryIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 14 8 9 13 15 16 11 20 14" />
  </svg>
);

// Resume Engine
export const ResumeEngineIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 22 8 12 14 2 8 12 2" />
    <line x1="12" y1="14" x2="12" y2="22" />
  </svg>
);

// Feedback
export const FeedbackIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-3.4-11.4" />
    <path d="M22 4l-10 10" />
  </svg>
);
