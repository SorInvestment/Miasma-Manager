# Miasma Manager

A browser-based, scientifically-grounded plague simulation game. Built from the design spec
in `plague_simulation_game_design.pdf` (uploaded with this project).

Two game modes share a single SEIR-based epidemiological engine:

- **The Pathogen** — Plague Inc.-style. You evolve a virus, bacterium, or fungus across
  ~46 major world cities. Spend DNA points on mutations (transmission, symptoms, abilities,
  lethality) and try to infect-and-kill the planet before scientists complete a cure.
- **The Defender** — You play humanity. Spend public-health budget on lockdowns, healthcare
  surges, travel bans, public-information campaigns, and cure research. The AI evolves
  the pathogen against you. Win if fewer than 6% of the population dies.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS for styling
- Zustand for state management
- HTML5 Canvas + d3-geo + offline TopoJSON world map (no API keys)
- Recharts for SEIR / cure-progress curves
- Vitest + Testing Library + Playwright for the test pyramid

## Getting Started

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built bundle at `http://localhost:4173` |
| `npm test` | Run all Vitest suites (unit + component + integration) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests headless |

## Project Layout

```
src/
  sim/                    # Pure simulation core (no React)
    types.ts              # City, Pathogen, GameState, Mutation, Intervention
    constants.ts          # All tuning knobs
    seir.ts               # Per-city SEIR step
    transport.ts          # Inter-city infected flux (air/sea/land)
    mutation.ts           # Pathogen mutation application
    government.ts         # Detection, cure progress, interventions
    engine.ts             # tick(state) → state
    __tests__/            # Vitest unit tests
  data/
    cities.ts             # 46 hand-authored major world cities
    mutations.ts          # ~28 mutations across 4 categories
    interventions.ts      # 6 defender-mode interventions
  state/
    gameStore.ts          # Zustand store wraps the engine
  components/             # React UI
  hooks/
    useGameLoop.ts        # rAF-driven tick scheduler
e2e/                       # Playwright E2E specs
public/world-110m.json     # Offline country outlines
```

## Gameplay Notes

### Time Controls
- ⏸ / 1× / 2× / 5× / 10× speed buttons in the top bar
- Auto-pause fires at: first detection, cure crossing 25%/50%/75%

### Pathogen Mode
- Starts with 4 DNA. DNA accrues from new infections and bonuses for first
  detection in a country.
- The Mutation Tree groups mutations by category; prerequisites greyed; affordable
  ones glow.
- Government AI auto-deploys lockdowns / healthcare surges / air bans as infection
  ratios rise; the cure progresses passively once detection occurs anywhere.

### Defender Mode
- Starts with $10M. Budget grows daily, scaled by living global population.
- Click a city, open Interventions, deploy lockdown / healthcare / travel ban for that
  city. Public-info campaigns and (implicit) cure funding work globally.
- The "Fund Research" buttons in the side panel raise the funding level, which
  multiplies the cure progress rate.
- Pathogen auto-mutates every ~18 days; you must adapt.

## Manual Smoke Checklist

1. `npm install` succeeds
2. `npm run dev` opens at `http://localhost:5173`
3. Start screen shows both mode buttons
4. Pathogen mode: select virus + London, click Start
5. Press 5× — infection visibly spreads from London within ~30 sim-days
6. DNA points increment in the top bar
7. Open mutation tree, buy "Airborne 1" — confirm spread accelerates afterwards
8. Cure bar starts after first detection (auto-pause should trigger)
9. Lockdown ring appears in heavily-infected cities (cyan dashed)
10. Game ends with a win/lose end screen → "Play Again" returns to Start screen
11. Defender mode: budget grows; can deploy lockdown on a selected city
12. Charts modal shows non-empty SEIR + cure curves

## Test Coverage

```
72 unit + component + integration tests (Vitest)
 9 end-to-end tests (Playwright + Chromium)
```

## Spec Compliance

This implementation covers a meaningful subset of the design PDF. Implemented:
- SEIR per-city epidemiological model with stochastic-feeling tick math
- City-level spreading with air/sea/land transport networks
- Mutation system with prereqs, categories, and trade-offs
- Government detection + auto-AI interventions
- Win/lose conditions for both pathogen and defender modes
- Time controls with smart auto-pause
- Real-time event log
- SEIR + cure-progress charts

Explicitly out of scope for the MVP (and noted in the original plan):
- Multiplayer / WHO / Socket.io / Express backend
- Three.js 3D globe
- Mapbox real maps
- Stochastic Gillespie simulation
- Phylogenetic trees / genome map / epistatic interactions
- Real-world demographic data integration
- Historical pandemic scenarios
- Docker / Postgres / Redis
