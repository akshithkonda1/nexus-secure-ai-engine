import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const baseClass = "h-6 w-6 text-cyan-100/90";

export const NeuralLoadIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? baseClass}
    {...props}
  >
    <path d="M10.2 4.75c-1.6.35-3.2 1.58-3.7 3.32-.16.55-.5 1.01-.98 1.3A3.2 3.2 0 0 0 4 11.8c0 1.28.73 2.45 1.87 3.03.49.25.83.71.98 1.24.6 2.07 2.66 3.18 4.65 3.18h.98c2.82 0 5.52-2.06 5.52-4.9 0-1.23.05-1.93-.46-2.9-.36-.7-.6-1.46-.6-2.26 0-2.11-1.7-3.96-3.74-4.42" />
    <path d="M10.75 12V8.5a1.25 1.25 0 0 0-2.5 0c0 .69.56 1.25 1.25 1.25h3.5a1.5 1.5 0 1 1 0 3H12.5" />
    <path d="M12 13.5v1.75" />
    <circle cx="9.25" cy="12.75" r=".55" />
    <circle cx="14.75" cy="12.75" r=".55" />
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
    className={className ?? baseClass}
    {...props}
  >
    <rect x="3.5" y="5.5" width="5" height="5" rx="1.2" />
    <rect x="15.5" y="13.5" width="5" height="5" rx="1.2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" />
    <path d="M8.5 8H12a1.5 1.5 0 0 1 1.5 1.5V12" />
    <path d="M12 15.5h2.75A1.75 1.75 0 0 0 16.5 13v-2.75" />
    <path d="M9 13H6.25A1.75 1.75 0 0 1 4.5 11.25V10" />
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
    className={className ?? baseClass}
    {...props}
  >
    <rect x="3.5" y="4" width="8" height="6.5" rx="1.4" />
    <rect x="12.5" y="4" width="8" height="4.5" rx="1.4" />
    <rect x="3.5" y="13.5" width="7" height="6" rx="1.4" />
    <rect x="12.5" y="12" width="8" height="7.5" rx="1.4" />
    <path d="M6 10.5V14" />
    <path d="M15.5 8.5V12" />
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
    className={className ?? baseClass}
    {...props}
  >
    <path d="M8.25 4.75h5.1l3.9 4V19a1.75 1.75 0 0 1-1.75 1.75H8.25A1.75 1.75 0 0 1 6.5 19V6.5c0-.97.78-1.75 1.75-1.75z" />
    <path d="M13.25 4.75V9H17.5" />
    <path d="M9.25 12.25h5.5" />
    <path d="M9.25 15.25H13" />
    <path d="M11 4.75h-2A2.25 2.25 0 0 0 6.75 7v11.5" />
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
    className={className ?? baseClass}
    {...props}
  >
    <path d="M4 16.5 7.5 11l2.5 5 3-7 2.5 5.5 2.5-4.5" />
    <path d="M4 18.75h16" />
    <circle cx="7.5" cy="11" r=".85" />
    <circle cx="10" cy="16" r=".85" />
    <circle cx="13" cy="9" r=".85" />
    <circle cx="15.5" cy="14.5" r=".85" />
    <circle cx="18" cy="10" r=".85" />
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
    className={className ?? baseClass}
    {...props}
  >
    <path d="M5 12H3l1.6-2.6" />
    <circle cx="13" cy="12" r="7" />
    <path d="M13 8v4l2.5 1.5" />
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
