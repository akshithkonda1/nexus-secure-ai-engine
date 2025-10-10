import React from 'react';
export const ThemeStyles: React.FC = () => (
  <style>{`
    :root { --bg: 255 255 255; --fg: 17 24 39; --muted: 244 244 245; --card: 255 255 255; --border: 229 231 235; --ring: 59 130 246; }
    .dark { --bg: 17 24 39; --fg: 229 231 235; --muted: 31 41 55; --card: 24 31 44; --border: 55 65 81; --ring: 147 197 253; }
    .bg-token { background-color: rgb(var(--bg)); }
    .text-token { color: rgb(var(--fg)); }
    .muted-token { background-color: rgb(var(--muted)); }
    .card-token { background-color: rgb(var(--card)); border: 1px solid rgb(var(--border)); }
  `}</style>
);
