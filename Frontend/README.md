# Nexus Frontend

The `Frontend/` directory contains a drop-in React + Vite bundle that powers the Nexus chat demo. You can interact with it in two ways:

## 1. Run the interactive app with Vite
1. Install dependencies (requires npm registry access):
   ```bash
   cd Frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev -- --host
   ```
3. Open the printed URL (defaults to `http://127.0.0.1:5173/`). The chat UI, drawers, modals, and lazy-loaded chunks are all interactive here.

## 2. Preview the static HTML snapshot
`preview.html` is a static capture of the lazy-loaded experience that works without installing dependencies. Serve the folder over HTTP so that relative asset paths resolve:

```bash
cd Frontend
python3 -m http.server 4173
```

Then open [http://localhost:4173/preview.html](http://localhost:4173/preview.html) in your browser. This uses the built `preview.html` file plus the shared styles from `src/index.css`, so you can inspect layout, theming, and lazy-loaded surfaces without running the dev server.

> **Tip:** Double-clicking `preview.html` to open it directly from the filesystem may block some assets in certain browsers. Using a lightweight HTTP server (like the Python command above) avoids those restrictions.

## Project layout
```
Frontend/
├── index.html        # Vite entrypoint (mounts React at #root)
├── preview.html      # Static snapshot (no JS bundler required)
├── package.json      # Scripts: dev, build, preview
├── src/              # React source (chat, settings, drawers, modals, hooks)
└── vite.config.ts    # Vite + React configuration
```

## Testing
Optional Vitest specs live under `src/__tests__/`. Run them via:
```bash
npm run test
```

(You can also run them with `vitest` directly if it is installed globally.)
