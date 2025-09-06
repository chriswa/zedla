# Repository Guidelines

## Project Structure & Organization
- Source: `src/` split by domain — `app/` (bootstrap, input), `game/` (controllers, ECS, room), `game/ecs/{components,systems}/`, `gfx/` (canvas, camera, loader), `math/`, `resources/` (asset defs), `types/`, `util/` (fsm, events, timing, assertions). Entry: `src/main.ts`.
- Assets: `public/` (images, music, sfx). Root `index.html` bootstraps Vite.
- Config: `tsconfig.json`, `vite.config.js`, `eslint.config.js`, `.prettierrc`.

## Build, Test, and Development Commands
- `pnpm dev`: Run the Vite dev server with HMR.
- `pnpm build`: Production build (`tsc && vite build`).
- `pnpm preview`: Serve the built app locally.
- `pnpm typecheck`: TypeScript check without emit.
- `pnpm lint` / `pnpm lint:fix`: Lint (and auto-fix) with ESLint.
- `pnpm format`: Format code with Prettier.

## Architecture & Priorities
- Modular game engine with DI (`tsyringe`) and container scoping per room; prefer `@singleton()` and explicit lifecycles.
- ECS for behavior; systems live in `game/ecs/systems` and operate over simple data components.
- FSM for game/app flow (`util/fsm.ts`) and a `GameStrategy` abstraction for modes.
- DX first: minimal boilerplate, sharp separation of concerns, and strong typing. Build helpers/types when they improve clarity and IntelliSense.

## Coding Style & Naming
- Language: TypeScript (strict), ESM, path alias `@/` for imports.
- Formatting: Prettier — single quotes, no semicolons, trailing commas, 100-char width; 2-space indent.
- Linting: Type-aware ESLint with import ordering, Promise/Unicorn/RegExp best practices; avoid `console` except `warn`/`error`.
- Files: lower camelCase (`tileCollisionService.ts`, `imageLoader.ts`). Patterns: `*System.ts` for ECS systems; `*Def.ts` for resource/types; helpers in `util/`.

## Security & Configuration Tips
- Prefer `pnpm` (lockfile present). Do not commit `dist/` or large unoptimized binaries.
- Keep third-party assets licensed and documented; place new assets under `public/`.
- Maintain stable public types in `types/` and avoid leaking internal DI tokens across module boundaries.
