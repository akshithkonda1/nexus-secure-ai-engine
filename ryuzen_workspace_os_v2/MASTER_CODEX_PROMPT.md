# Ryuzen Deep-Glass Tile v3 — Master Codex Prompt

Copy/paste this prompt into your assistant or code generation tool to refactor the entire Ryuzen Workspace UI to the ultra-solid, deep-glass aesthetic.

---

## Prompt

You are refactoring the ENTIRE **Ryuzen Workspace UI** to match the style shown in the reference screenshot:

**OPAQUE, SOLID, FUTURISTIC MODULE PANELS**
(95–98% opacity, soft gradient shading, deep shadow, vignette lighting, clean curved edges)

Your job is to **rewrite every panel and widget component** to use the **Ryuzen Deep Glass Tile v3** aesthetic.

### HARD RULES

* Do NOT change the layout.
* Do NOT change component structure.
* Do NOT change spacing or grid systems.
* Do NOT remove functionality.
* Do NOT break React or TSX syntax.
* Do NOT break Tailwind.
* The final code MUST pass `npm run build` with zero errors.

### A. UPDATE GLOBAL TOKENS (REQUIRED)

Replace or add in `globals.css`:

```css
/* ----------------------------- */
/* RYŪZEN DEEP-GLASS TILE v3     */
/* (Fully opaque, sci-fi density) */
/* ----------------------------- */

:root {
  --tile-bg: rgba(20, 20, 26, 0.96); /* nearly opaque */
  --tile-bg-strong: rgba(20, 20, 26, 0.985);

  --tile-gradient: linear-gradient(
    135deg,
    rgba(70, 30, 140, 0.35),
    rgba(0, 180, 150, 0.30),
    rgba(25, 25, 32, 0.40)
  );

  --tile-border: rgba(255, 255, 255, 0.08);
  --tile-border-strong: rgba(255, 255, 255, 0.14);

  --tile-inner: rgba(255, 255, 255, 0.04);

  --tile-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  --tile-shadow-strong: 0 28px 65px rgba(0, 0, 0, 0.75);

  --text-primary: #FFFFFF;
  --text-secondary: #D8D8D8;
  --text-muted: #909090;
}

[data-theme="light"] {
  --tile-bg: rgba(255, 255, 255, 0.95);
  --tile-bg-strong: rgba(255, 255, 255, 0.98);

  --tile-gradient: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.70),
    rgba(240, 240, 255, 0.65),
    rgba(245, 245, 255, 0.55)
  );

  --tile-border: rgba(0, 0, 0, 0.12);
  --tile-border-strong: rgba(0, 0, 0, 0.18);

  --tile-inner: rgba(255, 255, 255, 0.25);

  --tile-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  --tile-shadow-strong: 0 24px 55px rgba(0, 0, 0, 0.25);

  --text-primary: #0A0A0A;
  --text-secondary: #2A2A2A;
  --text-muted: #6A6A6A;
}
```

### B. UPDATE TAILWIND CONFIG (REQUIRED)

Add the following `extend` settings:

```js
extend: {
  colors: {
    tile: "var(--tile-bg)",
    tileStrong: "var(--tile-bg-strong)",
    tileInner: "var(--tile-inner)",
    tileBorder: "var(--tile-border)",
    tileBorderStrong: "var(--tile-border-strong)",

    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    textMuted: "var(--text-muted)",
  },
  boxShadow: {
    tile: "var(--tile-shadow)",
    tileStrong: "var(--tile-shadow-strong)",
  },
  backgroundImage: {
    tileGradient: "var(--tile-gradient)",
  },
}
```

### C. APPLY THIS TILE CLASS TO ALL WIDGETS/PANELS

Every widget, panel, container, or block must replace its wrapper `<div>` with:

```tsx
<div className="
  relative
  rounded-3xl
  bg-tile
  bg-tileGradient
  border border-tileBorder
  shadow-tile
  px-6 py-5

  before:absolute before:inset-0
  before:rounded-3xl
  before:bg-tileInner
  before:pointer-events-none

  transition-all duration-300
  hover:shadow-tileStrong
  hover:border-tileBorderStrong
">
```

Apply to all panels, cards, boards, flows, mini widgets, and sidebars.

### D. REMOVE NESTED GLASS/TILE PANELS

Inner components should use a simpler container, not the outer tile style:

```tsx
<div className="rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 shadow-tile">
```

No double gradients, shadows, or glass effects.

### E. UPDATE ALL TEXT CLASSES

Replace typical text classes with theme tokens:

* `text-textPrimary`
* `text-textSecondary`
* `text-textMuted`

### F. BUILD VALIDATION REQUIREMENT

1. Run `npm run build`.
2. Fix JSX, TypeScript, Tailwind, and import issues until build succeeds with zero errors.

### G. OUTPUT FORMAT

Return updated `globals.css`, `tailwind.config.js`, all affected components, and the confirmation:

> "Ryuzen Deep-Glass UI applied successfully. Build passes with zero errors."

---

Use this to enforce consistent, opaque, futuristic tiles throughout the Ryuzen Workspace.
