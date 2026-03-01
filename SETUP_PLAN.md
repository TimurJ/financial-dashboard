# Finance Dashboard - Project Setup Plan

## Context

This is a fresh Vite 7 + React 19 + TypeScript 5.9 project (scaffolded via `pnpm create vite`) that still contains the default template boilerplate (counter demo, spinning logos, placeholder CSS). The goal is to set it up with industry best practices before building any dashboard features. The project uses pnpm as its package manager.

**Current state:** Steps 1–7 are complete (git, path aliases, prettier/eslint, husky/lint-staged, vitest, TanStack Router, Tailwind v4 + shadcn/ui). Remaining steps: Zustand (8), TanStack Query (9), env vars (10), boilerplate cleanup (11).

---

## Step 1: Initialize Git ✅

- Run `git init`, add all files, create initial commit
- Update `.gitignore` to include `coverage/`, `.env`, `.env.local`, `.env.*.local`

**Verify:**

```bash
git log --oneline     # Confirm initial commit exists
```

## Step 2: Path Aliases (`@/`) ✅

- **`tsconfig.app.json`** — add `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`
- **`vite.config.ts`** — add `resolve.alias` mapping `@` to `./src`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`@types/node` is already installed, so the `path` import works out of the box.

**Verify:**

```bash
pnpm build            # Alias resolves, no type errors
```

## Step 3: Prettier + ESLint Integration ✅

**Install:**

```bash
pnpm add -D prettier eslint-config-prettier
```

**Create `.prettierrc.json`:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "singleAttributePerLine": true
}
```

> Note: `prettier-plugin-tailwindcss` will be added to the plugins array in Step 7.

**Create `.prettierignore`:**

```
dist
node_modules
pnpm-lock.yaml
.claude
```

**Update `eslint.config.js`** — add `eslint-config-prettier` as the **last** entry so it disables any ESLint rules that conflict with Prettier:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
])
```

**Add scripts to `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm format:check     # Prettier reports all files formatted
```

## Step 4: Husky + lint-staged (Pre-commit Hooks) ✅

**Install:**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Replace `.husky/pre-commit` contents with:**

```bash
pnpm exec lint-staged
```

**Add to `package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,html,yml,yaml}": ["prettier --write"]
  }
}
```

> The JS glob (`js,mjs,cjs`) ensures config files like `eslint.config.js` are also linted and formatted on commit.

**Create `.husky/pre-push` for type-checking:**

```bash
pnpm exec tsc -b
```

> `tsc` is project-wide and can't meaningfully check individual staged files, so a pre-push hook (which runs less frequently) is the right place for it. This catches type errors before they reach the remote.

> Husky requires a git repo — make sure Step 1 is done first.

**Verify:**

```bash
# Make a test commit to confirm hooks run lint-staged successfully
```

## Step 5: Vitest + React Testing Library ✅

**Install:**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Update `vite.config.ts`** — add the Vitest triple-slash reference and test configuration:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

**Update `tsconfig.app.json`** — add `"vitest/globals"` to the `types` array so TypeScript recognizes `describe`, `it`, `expect`, etc. as globals:

```json
"types": ["vite/client", "vitest/globals"]
```

**Create `src/test/setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest'
```

**Create `src/test/setup.test.ts`** (sanity check):

```ts
describe('setup verification', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Add scripts to `package.json`:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Verify:**

```bash
pnpm test:run         # Vitest runs the sanity test and passes
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
```

## Step 6: TanStack Router (Virtual File Routes) ✅

**Install:**

```bash
pnpm add @tanstack/react-router
pnpm add -D @tanstack/router-plugin @tanstack/router-devtools @tanstack/virtual-file-routes
```

**Update `vite.config.ts`** — add the TanStack Router plugin **before** the React plugin, using `virtualRouteConfig` to point at a `routes.ts` config file:

```diff
 /// <reference types="vitest/config" />
 import { defineConfig } from 'vite'
+import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
 import react from '@vitejs/plugin-react'
 import path from 'path'

 export default defineConfig({
-  plugins: [react()],
+  plugins: [
+    TanStackRouterVite({
+      quoteStyle: 'single',
+      virtualRouteConfig: './routes.ts',
+    }),
+    react(),
+  ],
   resolve: {
```

> The TanStack Router plugin must come **before** `react()`. It auto-generates `src/routeTree.gen.ts` from the virtual route config. The `quoteStyle: 'single'` option matches our Prettier config. The `virtualRouteConfig` option enables virtual file routes — route-to-file mappings are defined explicitly in `routes.ts` instead of relying on filesystem naming conventions.

**Create `routes.ts`** (project root) — defines route-to-file mappings:

```ts
import { rootRoute, index, route } from '@tanstack/virtual-file-routes'

export const routes = rootRoute('__root.tsx', [
  index('dashboard.tsx'),
  route('/transactions', 'transactions.tsx'),
  route('/accounts', 'accounts.tsx'),
  route('/budgets', 'budgets.tsx'),
  route('/settings', 'settings.tsx'),
])
```

> File paths are relative to `src/routes/`. You control the URL-to-file mapping explicitly — no filesystem naming conventions required.

**Add `src/routeTree.gen.ts` to `.gitignore`** — this file is auto-generated on `pnpm dev`.

**Create `src/routes/__root.tsx`:**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
```

**Create placeholder route files** — `src/routes/dashboard.tsx`, `transactions.tsx`, `accounts.tsx`, `budgets.tsx`, `settings.tsx`:

```tsx
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardComponent,
})

function DashboardComponent() {
  return <div>Dashboard</div>
}
```

Same pattern for each route, changing the path and component name.

**Replace `src/main.tsx`:**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

**Delete `src/App.tsx`** — routing is now handled by TanStack Router; no App component needed.

**ESLint override:** An override was added to `eslint.config.js` to disable `react-refresh/only-export-components` for `src/routes/**/*.{ts,tsx}`, since TanStack Router route files export a `Route` config object alongside the component.

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
pnpm dev              # Navigate between /, /transactions, /accounts, /budgets, /settings
```

## Step 7: Tailwind CSS v4 + shadcn/ui ✅

### Tailwind CSS

**Installed** `tailwindcss` + `@tailwindcss/vite` and added `tailwindcss()` plugin to `vite.config.ts` (after `react()`).

**Replaced `src/index.css`** with the shadcn-generated stylesheet containing OKLch theme tokens, dark mode variables (`.dark` class), sidebar tokens, chart colors, and base layer styles. Uses `tw-animate-css` for animation utilities and `shadcn/tailwind.css` for component base styles.

**Deleted `src/App.css`** — all styling is now via Tailwind utility classes.

### Prettier Tailwind plugin

**Installed** `prettier-plugin-tailwindcss` and added it to `.prettierrc.json` with `tailwindStylesheet: "./src/index.css"` so class sorting works correctly.

### shadcn/ui

**Initialized** with `pnpm dlx shadcn@latest init`:

- Style: **base-mira** (Base UI)
- Base color: **zinc**
- CSS variables: **Yes**
- Icon library: **lucide**
- Config written to `components.json`

**Added `cn()` utility** at `src/lib/utils.ts` (uses `clsx` + `tailwind-merge`).

**Installed `button` component** via `pnpm dlx shadcn@latest add button` → `src/components/ui/button.tsx`.

### Ignore configs

- Added `src/components/ui` to `.prettierignore` so shadcn-generated files keep their original format
- Added `src/components/ui` to ESLint `globalIgnores` in `eslint.config.js`

### Dependencies added

**Production:**

```
tailwindcss, @tailwindcss/vite, @base-ui/react, class-variance-authority, clsx, tailwind-merge, lucide-react
```

**Dev:**

```
prettier-plugin-tailwindcss, shadcn, tw-animate-css
```

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
pnpm dev              # Tailwind styles render correctly
```

## Step 8: Zustand (State Management)

**Install:**

```bash
pnpm add zustand
```

**Create example store `src/stores/useAccountStore.ts`:**

```ts
import { create } from 'zustand'

interface Account {
  id: string
  name: string
  balance: number
  type: 'checking' | 'savings' | 'credit' | 'investment'
}

interface AccountState {
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  addAccount: (account: Account) => void
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
}))
```

**Convention:** One store per domain — `useAccountStore`, `useTransactionStore`, `useBudgetStore`, etc.

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
```

## Step 9: TanStack Query + Mock Data

**Install:**

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

**Update `src/main.tsx`** — wrap `RouterProvider` with `QueryClientProvider`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

**Create mock data `src/lib/mock-data.ts`** with sample accounts, transactions, and budgets for development.

**Create a service example `src/services/transactions.ts`:**

```ts
import type { Transaction } from '@/types/transaction'
import { mockTransactions } from '@/lib/mock-data'

export async function fetchTransactions(): Promise<Transaction[]> {
  // Replace with real API call when backend is ready
  return Promise.resolve(mockTransactions)
}
```

**Create a query hook `src/hooks/useTransactions.ts`:**

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '@/services/transactions'

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  })
}
```

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
pnpm dev              # Dev server starts, devtools accessible
```

## Step 10: Environment Variables

**Create `.env.example`** (commit this):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Finance Dashboard
```

**Create `.env`** (gitignored) with same contents.

**Create `src/vite-env.d.ts`** for TypeScript autocompletion:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
```

## Step 11: Clean Up Boilerplate

- Delete `src/assets/react.svg`
- Delete `public/vite.svg`
- Update `index.html` — change `<title>` to "Finance Dashboard", remove Vite favicon reference
- `main.tsx` and `index.css` are already rewritten in previous steps

**Verify:**

```bash
pnpm lint             # ESLint clean
pnpm build            # No type errors, production build succeeds
pnpm dev              # Dev server starts, app renders correctly
```

---

## All Dependencies Summary

### Already installed (Steps 1–7)

**Production:**

```bash
pnpm add @tanstack/react-router tailwindcss @tailwindcss/vite @base-ui/react class-variance-authority clsx tailwind-merge lucide-react
```

**Dev:**

```bash
pnpm add -D prettier eslint-config-prettier husky lint-staged vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @tanstack/router-plugin @tanstack/router-devtools @tanstack/virtual-file-routes prettier-plugin-tailwindcss shadcn tw-animate-css
```

**CLI (already run):**

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
```

### Remaining (Steps 8–11)

**Production:**

```bash
pnpm add zustand @tanstack/react-query
```

**Dev:**

```bash
pnpm add -D @tanstack/react-query-devtools
```

---

## Verification Checklist

- [x] `pnpm build` — production build succeeds with no TypeScript errors
- [x] `pnpm test:run` — Vitest runs the sanity test and passes
- [x] `pnpm lint` — ESLint runs with no errors
- [x] `pnpm format:check` — Prettier reports all files formatted
- [x] Make a test commit — Husky pre-commit hook runs lint-staged successfully
- [x] `pnpm dev` — dev server starts, dashboard page renders with Tailwind styles
- [x] Navigate between routes (`/`, `/transactions`, etc.) — TanStack Router works
