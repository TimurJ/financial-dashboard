# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite dev server with HMR
pnpm build            # Type-check (tsc -b) then build with Vite
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Format all files with Prettier
pnpm format:check     # Check formatting without changes
pnpm preview          # Preview production build
```

**Testing**: Vitest + React Testing Library + jest-dom matchers. Globals enabled (`describe`/`it`/`expect` available without imports).

```bash
pnpm test              # Watch mode for development
pnpm test:run          # Single run (CI)
pnpm test:coverage     # With coverage
```

Test files: `src/**/*.{test,spec}.{ts,tsx}`. Setup file: `src/test/setup.ts`.

## Architecture

**Stack**: Vite 7 + React 19 + TypeScript 5.9 (strict mode)

This is a finance dashboard app in early setup phase. The project follows an 11-step setup plan in `SETUP_PLAN.md` — steps 1–7 are complete (git, path aliases, prettier/eslint, husky/lint-staged, vitest, TanStack Router, Tailwind v4 + shadcn/ui). Remaining steps add: Zustand, TanStack Query, env vars, boilerplate cleanup.

**Path alias**: `@/*` maps to `./src/*` (configured in both tsconfig.app.json and vite.config.ts).

**Routing**: TanStack Router with virtual file routes. Route-to-file mappings are defined in `routes.ts` (project root); route files live in `src/routes/`. The router plugin auto-generates `src/routeTree.gen.ts` (gitignored).

**Planned architecture** (from SETUP_PLAN.md):

- `src/routes/` — route files (dashboard, transactions, accounts, budgets, settings)
- `src/components/ui/` — shadcn/ui components
- `src/components/layout/` — Sidebar, Header, Footer
- `src/stores/` — Zustand stores (one per domain)
- `src/services/` — API service functions
- `src/hooks/` — Custom React hooks
- `src/types/` — Shared TypeScript interfaces
- `src/lib/` — Utilities (cn helper, formatCurrency, etc.)

## Code Style

- **Prettier**: No semicolons, single quotes, trailing commas, 100 char print width, single attribute per line
- **ESLint**: Flat config (v10) with typescript-eslint, react-hooks, react-refresh, and prettier integration
- **TypeScript**: Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- React 19 JSX transform — no `import React` needed
