import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const NeuralLoadIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M9 9l-2-2M15 9l2-2M9 15l-2 2M15 15l2 2" />
  </svg>
);

export const PipelinesIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <rect x="3" y="7" width="6" height="10" rx="2" />
    <rect x="15" y="4" width="6" height="16" rx="2" />
  </svg>
);

export const WorkspaceIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="5" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <path d="M13 13h7M13 17h4" />
  </svg>
);

export const DocumentsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <path d="M7 4h7l3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M14 4v4h4" />
    <path d="M9 13h6M9 16h3" />
  </svg>
);

export const TelemetryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <path d="M4 14l3-4 4 6 4-7 5 8" />
    <path d="M4 19h16" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5 text-cyan-100/90"}
    {...props}
  >
    <path d="M4 12h4" />
    <path d="M12 4v4" />
    <path d="M12 16v4" />
    <path d="M16 12h4" />
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export const moduleIcons = {
  neuralLoad: NeuralLoadIcon,
  pipelines: PipelinesIcon,
  workspace: WorkspaceIcon,
  documents: DocumentsIcon,
  telemetry: TelemetryIcon,
  history: HistoryIcon,
} as const;

export type ModuleKey = keyof typeof moduleIcons;
