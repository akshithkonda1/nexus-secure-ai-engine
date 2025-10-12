import React from 'react';
export const ThemeStyles: React.FC = () => (
  <style>{`
    :root {
      --bg: 247 247 248;
      --fg: 32 33 35;
      --muted: 236 236 241;
      --surface: 255 255 255;
      --surface-alt: 247 247 248;
      --border: 222 222 226;
      --sidebar-bg: 248 248 248;
      --sidebar-border: 217 217 227;
      --accent: 59 130 246;
      --accent-contrast: 255 255 255;
      --assistant-bubble: 247 247 248;
      --user-bubble: 59 130 246;
      --user-bubble-text: 255 255 255;
      --shadow: 15 23 42 / 8%;
      --app-gradient: radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(247,247,248,0.95) 45%, rgba(239,239,244,0.85));
      color-scheme: light;
    }
    .dark {
      --bg: 30 31 35;
      --fg: 236 236 241;
      --muted: 52 53 65;
      --surface: 48 49 55;
      --surface-alt: 64 65 73;
      --border: 70 72 84;
      --sidebar-bg: 32 33 35;
      --sidebar-border: 54 56 68;
      --accent: 96 165 250;
      --accent-contrast: 236 236 241;
      --assistant-bubble: 52 53 65;
      --user-bubble: 59 130 246;
      --user-bubble-text: 236 236 241;
      --shadow: 15 23 42 / 35%;
      --app-gradient: radial-gradient(circle at 20% 20%, rgba(63,63,80,0.45), rgba(17,18,24,0.92));
      color-scheme: dark;
    }
  `}</style>
);
