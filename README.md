# Travel Activity Ranker

Tell it a city, and it ranks skiing, surfing, outdoor sightseeing, and indoor sightseeing for the next 7 days based on real weather data.

## Overview

Travel Activity Ranker helps you decide what to do on a trip based on the weather. Search for any city, and the app pulls a 7-day forecast and scores each day for four activities:

- **Skiing** — snow, temperature, and wind conditions
- **Surfing** — wave height and period
- **Outdoor sightseeing** — rain, wind, and temperature
- **Indoor sightseeing** — a stable baseline, only penalized by extreme weather

Each day shows a recommended activity plus a full breakdown of all four scores, with a short explanation of why a day scored the way it did.

## Tech Stack

**Backend:** Node.js, NestJS, GraphQL (Apollo Server), TypeScript, Jest
**Frontend:** React, Vite, Apollo Client, GraphQL Codegen, TypeScript, Vitest + React Testing Library
**Infra:** Docker, Docker Compose, nginx
**Data source:** [Open-Meteo](https://open-meteo.com/)

## Getting Started

### Prerequisites
- Node.js 24+
- npm
- Docker and Docker Compose (for the containerized path)

### Run with Docker Compose (fastest)
```bash
docker compose up --build
```
- Frontend: http://localhost:5174
- Backend (GraphQL): http://localhost:3000/graphql

### Run in dev mode
```bash
npm install

npm run dev --workspace=backend    # http://localhost:3000/graphql
npm run dev --workspace=frontend   # http://localhost:5174
```

### Environment variables
Each app has its own `.env.example`. The backend reads `PORT` and `CORS_ORIGIN` via `@nestjs/config`; the frontend reads `VITE_GRAPHQL_URI` via Vite's built-in env handling. Both fall back to sane local defaults if no `.env` is present.

## Architecture

### Structure

This is an npm workspaces monorepo with two apps:

```
apps/
  backend/   NestJS + GraphQL API
  frontend/  React + Vite SPA
```

**Backend** (`apps/backend/src`)
- `weather/` — `LocationProvider`/`WeatherProvider` interfaces plus their Open-Meteo implementations (geocoding, forecast, marine data), normalized into a single per-day weather shape
- `scoring/` — one `ActivityScorer` per activity (skiing, surfing, outdoor sightseeing, indoor sightseeing), orchestrated by `RankingService`
- `forecast/` — the GraphQL resolver that ties location lookup, weather fetching, and scoring together into a single `cityForecast` query
- `common/` — cross-cutting concerns (GraphQL error formatting)

**Frontend** (`apps/frontend/src`)
- `components/` — the search form, forecast results, and per-day/per-activity cards
- `graphql/` — the query definition and Codegen-generated types
- `hooks/`, `utils/`, `styles/` — supporting logic and shared styling

**Data flow:** city name → `LocationProvider` resolves coordinates → `WeatherProvider` fetches a 7-day forecast (+ marine data) → each `ActivityScorer` scores every day → `RankingService` assembles the ranked result → served over GraphQL → rendered by the frontend. See [Key Decisions](#key-decisions) below for the reasoning behind these choices.

### Key Decisions

**Monorepo via npm workspaces, not separate repos or Nx/Turborepo.** The classic monorepo-vs-polyrepo trade-off (independent deploys, isolated CI, teams at different speeds) doesn't really apply to a project graded by a single evaluator — separate repos would just mean two links and two disconnected histories, losing the story of the backend's schema feeding the frontend's codegen. Nx/Turborepo pay off around 5+ services or larger teams; pulling them in here would be complexity for its own sake.

**Port/adapter pattern for weather and location data.** `LocationProvider` and `WeatherProvider` are interfaces — `forecast.resolver.ts` depends only on those contracts via injection tokens, agnostic to the fact that `OpenMeteoLocationProvider`/`OpenMeteoWeatherProvider` are the ones actually talking to Open-Meteo. This paid off directly during testing: `test/forecast.e2e-spec.ts` swaps in fakes for both tokens, exercising the real GraphQL resolution and scoring logic end-to-end without needing Open-Meteo to actually be up.

**Strategy pattern for activity scoring, without extracting shared rule helpers.** Each activity has its own `ActivityScorer` (skiing, surfing, outdoor sightseeing, indoor sightseeing), orchestrated by `RankingService`. I considered pulling common checks (rain, wind, sunshine) into shared helper functions, but after some consideration I realized I couldn't reuse the same check across different activities: skiing's rain check also depends on temperature, outdoor sightseeing's doesn't. Each scorer's rules are a tiered, mutually-exclusive `if/else` chain that extraction would only add indirection to, not clarity.

**Scoring thresholds read through a typed getter, not direct imports.** `getScoringParameters(activity)` is the only way scorers read their thresholds. It's a deliberate seam: if thresholds ever need to move to a database instead of being hardcoded, this is the one function whose signature has to change.

**NestJS as the backend framework.** Chosen for familiarity and its ecosystem — `@nestjs/apollo`, `@nestjs/config`, `@nestjs/throttler`, and `@nestjs/axios` all plug directly into the framework's DI system, so adding things like config loading or rate limiting later was a few lines of wiring instead of assembling each piece by hand.

**Apollo Server for GraphQL.** Apollo is the more prevalent choice, and NestJS already ships a dedicated wrapper for it (`@nestjs/apollo`) built for code-first GraphQL. It also keeps the stack on one ecosystem — Apollo Server on the backend, Apollo Client on the frontend — one mental model and one set of docs, useful on a first GraphQL project.

**GraphQL Codegen with `client-preset`, after `typescript-react-apollo` broke on Apollo Client v4.** I first tried the hooks-generating plugin most tutorials use, but it only supports Apollo Client v2/v3, so I switched to `client-preset`, which is version-agnostic. Worth being honest: for a project this size (one query), hand-writing the query and its types would have been simpler and would have sidestepped the whole issue — I kept Codegen for the compiler-enforced type sync between frontend and backend, which matters more as queries are added.

**Docker Compose with two stateless services, no database.** Both backend and frontend use multi-stage Dockerfiles; the frontend's production stage serves the Vite build as static files through nginx, so it doesn't need a Node runtime at runtime. The build context for both is the monorepo root, since npm workspaces need the root lockfile to resolve dependencies correctly.

**API hardening pass: rate limiting, request timeouts, and input validation.** A review pass surfaced these as real gaps, so I added three targeted fixes: `@nestjs/throttler` limits `cityForecast` to 20 requests/minute per IP (verified live — the 21st request in a 60s window gets rejected with a `RATE_LIMITED` error); `HttpModule` now times out Open-Meteo requests after 5s instead of hanging indefinitely; and the resolver rejects empty or over-100-character city names before they reach geocoding. Wiring the rate limiter also surfaced a real bug in `formatGraphQLError`: it only read `extensions.status` at the top level, which works for `NotFoundException` but not `BadRequestException` (whose status is nested in `extensions.originalError.statusCode` instead) — caught by testing the actual error shape live rather than trusting the existing unit tests, which had only ever exercised hand-crafted mocks already in the shape that happened to work.

**Apollo Client's default cache, no custom cache policy on the frontend.** Repeating a search for the same city is served instantly from cache instead of a network round-trip. That's fine here — weather data doesn't meaningfully change within a browsing session, and a search for a different city always fires a real request regardless.

**Custom drag-to-scroll for the day-card carousel, mouse-only.** `useDragScroll` only listens for mouse events; touch devices already get native horizontal scrolling on the same `overflow-x: auto` container without any extra code — verified at a 375px mobile viewport with no layout breakage.

## Testing

**Backend:** unit tests per scorer, provider, resolver, and service (`apps/backend/src/**/*.spec.ts`) cover business-rule correctness, for example: `surfing.scorer.spec.ts` asserts flat swells and dangerous wave heights are scored (and never fabricated) correctly.
Two e2e suites (`apps/backend/test/*.e2e-spec.ts`) cover a different concern: wiring correctness. They boot the full Nest app, mock only the external providers at the DI level, and confirm the real scorers, resolver, and GraphQL error formatting are actually connected, something a unit test that mocks `RankingService` itself could never catch. I verified it by deliberately breaking the DI wiring once and confirming the e2e suite failed, then reverted.
```bash
npm run test --workspace=backend       # unit
npm run test:e2e --workspace=backend   # e2e
```

**Frontend:** unit tests for components and utilities, plus an integration suite (`App.integration.test.tsx`) using `MockedProvider` to exercise the real scoring pipeline against mocked network data, including both GraphQL-level and network-level error states.
```bash
npm run test --workspace=frontend
```

## AI Collaboration

I used Claude Code throughout this project, but as a pairing collaborator, not an autopilot. I made the architecture and design calls and used Claude Code to boilerplate, research, iterate and debug, all under my supervision and review.

Claude Code handled most of the initial scaffolding: the NestJS module structure, the Vite/React setup, GraphQL module wiring, and the Jest/Vitest test configs. It also helped research domain specifics I didn't have on hand, like realistic wave-height and period thresholds for the surfing scorer (flat under 0.3m, a good swell in the 0.6-2.5m range, long-period swells above 9s).

Some of the design decisions I made include: the monorepo-over-polyrepo call, the choice not to extract shared helper functions across activity scorers (see [Key Decisions](#key-decisions) for why), and rejecting the geocoding `elevation` field as an input to the skiing scorer (see [Omissions & Trade-offs](#omissions--trade-offs)).

Claude Code first generated GraphQL Codegen output using the `typescript-react-apollo` plugin, which is what most tutorials show. It looked fine until I ran `tsc` against it and got real compile errors: Apollo Client v4 had broken that plugin's assumptions. I confirmed the incompatibility myself before switching to `client-preset`.

Every commit message and PR description in this repo's history was drafted by Claude Code but reviewed and approved by me before anything was committed or merged. The repo's history is meant to be readable as my own record of decisions, not a generated log.

## Omissions & Trade-offs

**Skiing is scored off the city's forecast, not the resort's.** I considered adding Open-Meteo's geocoding `elevation` field as an extra input to the skiing scorer, but rejected it: elevation is for the city center (e.g. Bariloche town, ~770m), not the actual ski resort nearby (Cerro Catedral, 2000m+), so it wouldn't fix the real gap and has weak correlation with "is there a resort nearby" either way. Fixing this properly would need a ski-resort location dataset to query weather at the resort's own coordinates, which is out of scope here.

**No browser-level end-to-end tests.** The full stack was verified manually against the running Docker Compose setup (built both containers, ran a real search through the browser), but there's no Cypress/Playwright suite automating that. For the current scope, backend e2e tests plus a frontend integration suite cover the meaningful wiring risk; a full browser e2e suite would mostly be testing Docker networking and nginx config, not application logic.

**No caching of Open-Meteo responses.** Every search re-fetches geocoding, forecast, and marine data, even for a repeated query. Fine for this project's traffic, but a real product would cache by city/day to reduce latency and avoid hitting Open-Meteo's rate limits under load.

**No CI pipeline.** Tests and linting run locally on demand, not automatically on every push or PR.

**If I kept building this, in priority order:** first, moving scoring parameters from hardcoded values into a database, so thresholds can be tuned without a redeploy (`getScoringParameters` is already the one seam this would go through, see [Key Decisions](#key-decisions)). Second, authentication and an admin dashboard to actually manage those parameters, since persisting them without a controlled way to edit them just moves the hardcoding problem into a database. Third, and only once that foundation exists, a user-facing page breaking down how each activity's score is calculated, sourced from the same (by then dynamic) parameters, so it can never drift from the real values.
