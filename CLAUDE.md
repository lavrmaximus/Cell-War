# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CellWar is a real-time 2-player browser strategy game on a 20×20 grid. Players capture territory, build farms for income, and defend cells. Turn-based actions over WebSockets; first to eliminate all enemy territory wins.

## Development Commands

```bash
# Backend (hot reload, port 3000)
cd backend && npm run dev

# Frontend (Vite HMR, port 5173 — proxies /api and /socket.io to backend)
cd frontend && npm run dev

# Production build (from root)
npm run build   # builds frontend then backend
npm start       # runs backend/dist/server.js (also serves frontend/dist)

# Type check only
cd frontend && npx tsc --noEmit
cd backend  && npx tsc --noEmit
```

## Architecture

### Monorepo Layout
```
/
├── backend/src/
│   ├── server.ts          # Express + Socket.IO entry; dev auth endpoints
│   ├── game/
│   │   ├── GameManager.ts # Room lifecycle, matchmaking, all socket event handlers
│   │   └── Room.ts        # Per-match game logic, state machine, serialize()
│   └── middleware/auth.ts # JWT validation for WebSocket handshakes
└── frontend/src/
    ├── App.tsx                         # View router (hero|lobby|game) + AnimatePresence
    ├── context/
    │   ├── AuthContext.tsx             # Global auth state; dev vs external auth flow
    │   └── GameStateContext.tsx        # SINGLE source of truth for game state + socket
    ├── hooks/useGameState.ts           # Re-export from GameStateContext
    ├── services/
    │   ├── socket.ts                   # Singleton Socket.IO client (GameSocketService)
    │   └── api.ts                      # Axios (baseURL='' in dev via Vite proxy)
    ├── components/game/
    │   ├── GameArena.tsx               # Full-screen layout: header + grid + sidebar
    │   └── GridTile.tsx                # Individual cell (no framer-motion, pure CSS)
    └── types.ts                        # Shared types mirrored with backend
```

### Critical Design Decisions

**Single GameStateContext** — `useGameState()` returns context from `GameStateContext`, NOT a per-component hook. All socket listeners live in one place (`GameStateProvider`). Components call `useGameState()` but share the same state instance. Do NOT move socket logic back into a plain hook that's called from multiple components.

**Socket lifecycle** — socket connects when `user` is set in AuthContext (JWT ready), disconnects on logout. Token passed via `auth: { token }` in socket handshake. `activeSockets` Map in GameManager tracks userId→socketId; stale socket disconnects are ignored if a newer socket exists for that user.

**Player serialization** — backend `Room.serialize()` returns `players: Record<string, Player>` (object), NOT `Map.values()` array. Frontend `GameState.players` is typed as `Record<string, Player>`.

**Turn flow** — each `make_move` automatically ends the turn (server calls `nextTurn()` after processing). Separate `end_turn` event for passing without acting.

### Socket Events

**Client → Server:**
| Event | Payload | Purpose |
|---|---|---|
| `FIND_MATCH` | — | Join queue / reconnect to active game |
| `make_move` | `{ type, x, y, amount? }` | Capture / build_farm / defend — also ends turn |
| `end_turn` | — | Pass without acting |
| `leave_game` | — | Surrender |
| `GET_ROOMS` | — | Fetch waiting room list |
| `DEBUG_START` | — | Admin: start vs bot |

**Server → Client:**
| Event | Payload | Purpose |
|---|---|---|
| `GAME_START` | `{ roomId, state: GameState }` | Game started |
| `game_state` | `GameState` | After every move / turn advance |
| `game_over` | `{ winner, reason }` | Game ended (conquest/surrender/disconnect) |
| `joined_room` | `roomId` | Joined waiting room (< 2 players) |
| `ROOM_LIST` | `RoomInfo[]` | Response to GET_ROOMS |
| `error` | `string` | Move rejection message |

### Game State Shape

```ts
GameState {
    id: string
    players: Record<string, Player>   // keyed by userId
    grid: Cell[][]                    // [y][x]
    turn: string | null               // userId of current player
    status: 'waiting' | 'playing' | 'finished'
    playerOrder: string[]             // [p1Id, p2Id]
    width: 20, height: 20
}

Cell { x, y, type: 'grass'|'water'|'mountain'|'hill', owner: string|null, structure: 'farm'|null, defense: number }
Player { id, color, gold, ready, farms }
```

**Costs:** Capture: 1g (neutral grass), 2g (neutral hill), `defense+1` (enemy), +1g extra for hill. Farm: `floor(farms/10)+1`. Defend: 1–9g, adds that amount to cell.defense (capped at 9).

### Authentication

**Production:** JWT issued by external auth service (`api.lvrnvm.fun`). Cookie set on `.lvrnvm.fun` parent domain → shared with `cellwar.lvrnvm.fun`. Custom Railway domain required for cookie sharing.

**Development:** `POST /api/dev/auth` (only when `NODE_ENV !== production`) returns a JWT directly. Frontend uses this when `import.meta.env.DEV` is true. Token stored in `localStorage` under key `cw_token`, passed in socket `auth.token`.

**`/api/user/me`** — implemented in the game backend itself (validates JWT from Authorization header or cookie, returns user object). Also used in production for quick session check.

### Railway Deployment

`railway.toml` at repo root — builder: nixpacks, build: `npm run build`, start: `npm start`.

Set env vars in Railway dashboard: `JWT_SECRET`, `VITE_API_URL` (external auth URL for production), `NODE_ENV=production`.

### Vite Dev Proxy

`frontend/vite.config.ts` proxies `/api` and `/socket.io` to `localhost:3000` in development. This means the frontend uses `baseURL: ''` (same origin) and works with the local backend without CORS issues.

### Key Constraints

- **No database** — all game state in-memory; server restart wipes rooms
- **No tests** — no test suite
- **Debug bot** — passes turn after 1 second without making moves; admin-only via `DEBUG_START`
- **CORS whitelist** — `localhost:5173`, `localhost:3000`, `*.lvrnvm.fun`; update `server.ts` when adding origins

## Game Rules Reference

Full mechanics: `docs/GAME_RULES.md`. Short: capture adjacent non-water/mountain cells, build farms for income, defend cells. Starting territory: 3×3 at opposite corners, 10 gold each. Win by eliminating all enemy territory.
