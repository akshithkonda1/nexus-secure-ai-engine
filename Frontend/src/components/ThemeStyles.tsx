import React from 'react';
export const ThemeStyles: React.FC = () => (
  <style>{`
    :root {
      --bg: 247 247 248;
      --fg: 32 33 35;
      --muted: 134 142 160;
      --surface: 255 255 255;
      --surface-alt: 244 245 248;
      --surface-strong: 255 255 255;
      --surface-muted: 237 238 244;
      --border: 215 217 226;
      --sidebar-bg: 248 248 250;
      --sidebar-border: 217 217 227;
      --accent: 59 130 246;
      --accent-contrast: 255 255 255;
      --assistant-bubble: 247 247 248;
      --user-bubble: 59 130 246;
      --user-bubble-text: 255 255 255;
      --danger: 220 38 38;
      --overlay: rgba(15, 18, 25, 0.55);
      --shadow: 15 23 42 / 10%;
      --glow-accent: rgba(59, 130, 246, 0.28);
      --app-gradient: radial-gradient(circle at top, rgba(255,255,255,0.85), rgba(247,247,248,0.95) 45%, rgba(239,239,244,0.9));
      color-scheme: light;
    }
    .dark {
      --bg: 22 23 28;
      --fg: 232 233 241;
      --muted: 126 132 153;
      --surface: 40 41 48;
      --surface-alt: 30 31 38;
      --surface-strong: 48 49 56;
      --surface-muted: 52 53 65;
      --border: 70 72 84;
      --sidebar-bg: 28 29 36;
      --sidebar-border: 58 59 70;
      --accent: 96 165 250;
      --accent-contrast: 236 236 241;
      --assistant-bubble: 55 56 68;
      --user-bubble: 96 165 250;
      --user-bubble-text: 236 236 241;
      --danger: 248 113 113;
      --overlay: rgba(6, 8, 15, 0.72);
      --shadow: 15 23 42 / 45%;
      --glow-accent: rgba(96, 165, 250, 0.35);
      --app-gradient: radial-gradient(circle at 20% 20%, rgba(63,63,80,0.6), rgba(14,15,22,0.92));
      color-scheme: dark;
    }
  `}</style>
);
