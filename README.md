# StockPulse — Live Stock Dashboard (assignment)

Lightweight client/server demo that simulates real-time stock prices and provides a small React dashboard with per-user watchlists.

## Features
- Live simulated stock prices broadcast via Socket.IO
- Per-user subscriptions (persistence in `localStorage` keyed by email)
- Compact sparkline charts for each watched ticker
- Watchlist statistics (count, average, highest, lowest)
- Dark / Light mode toggle (persists preference)
- Responsive, modern UI built with React + Vite

## Architecture
- Backend: Node.js + Express + Socket.IO (streams simulated updates every second)
- Frontend: React (Vite) client that connects over WebSocket and renders live UI

## Requirements
- Node.js 18+ (tested with Node 24)
- npm

## Quickstart (development)
From the repository root run these commands in a terminal:

```bash
# Install server deps
cd stock-dashboard/server
npm install

# Install client deps
cd ../client
npm install

# Start the backend (default port 4000)
cd ../server
npm start

# In another terminal: start the frontend dev server (Vite)
cd ../client
npm run start
```

### One-command dev (start both servers)

From the repository root you can start both backend and frontend together with a single command (recommended for local development):

```bash
npm run dev
```

This uses the root `dev` script to run the server and Vite concurrently.

Notes:
- Vite usually serves on `http://localhost:5173`. If that port is occupied it will try the next available port (e.g. `5174`). Check the console output.
- The backend listens on port `4000`. If you see `EADDRINUSE` it means another process is already bound to that port.

## How to use
1. Open the client URL shown by Vite (e.g. `http://localhost:5174/`).
2. Enter any email address to identify your session (no password required).
3. Select one or more stocks in the watchlist, then click `View live dashboard`.
4. The dashboard shows live prices, tiny sparklines, and aggregated watchlist stats.

## Developer notes
- Live updates are simulated in `stock-dashboard/server/server.js` — the server updates all supported tickers every second and emits `stock_update` to subscribed sockets.
- The client tracks the last ~20 ticks per ticker and renders a small inline SVG sparkline in `stock-dashboard/client/src/components/Dashboard.full.jsx`.
- Subscriptions are persisted in `localStorage` under the key `subs:<email>`.
- Theme preference is stored under `localStorage` key `theme`.

## File structure (important files)
- `stock-dashboard/server/server.js` — backend simulator and Socket.IO hub
- `stock-dashboard/client/` — Vite React app
  - `src/App.full.jsx` — main application glue (socket management, theme)
  - `src/components/Dashboard.full.jsx` — dashboard and sparkline rendering
  - `src/App.css` — global styles + theme tokens

## Troubleshooting
- If the client shows a Vite overlay error about parsing, check the console and review `src/App.full.jsx` for syntax problems (recent edits are the most likely cause).
- If sockets don't connect, ensure the backend is running on port `4000` and `SOCKET_SERVER` in `App.full.jsx` points to the correct host.

## Next improvements (ideas)
- Add hover tooltips on sparklines with exact timestamps
- Add persistent user profiles and server-side subscription persistence
- Add price alerts (notifications) and a small virtual portfolio

---
If you'd like, I can also add a short CONTRIBUTING or TESTS section, or move this README to the repository root.
