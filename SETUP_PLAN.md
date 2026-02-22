# Finance Dashboard - Project Setup Plan

## Context

This is a fresh Vite 7 + React 19 + TypeScript 5.9 project (scaffolded via `pnpm create vite`) that still contains the default template boilerplate (counter demo, spinning logos, placeholder CSS). The goal is to set it up with industry best practices before building any dashboard features. The project uses pnpm as its package manager.

**Current state:** No git repo, no Prettier, no testing, no routing, no state management, no UI library, plain CSS only.

---

## Step 1: Initialize Git

- Run `git init`, add all files, create initial commit
- Update `.gitignore` to include `coverage/`, `.env`, `.env.local`, `.env.*.local`

## Step 2: Path Aliases (`@/`)

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

## Step 3: Prettier + ESLint Integration

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
  "endOfLine": "lf"
}
```

> Note: `prettier-plugin-tailwindcss` will be added to the plugins array in Step 8.

**Create `.prettierignore`:**

```
dist
node_modules
pnpm-lock.yaml
```

**Update `eslint.config.js`** — add `eslint-config-prettier` as the **last** entry so it disables any ESLint rules that conflict with Prettier:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs['flat/recommended'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
]
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

## Step 4: Husky + lint-staged (Pre-commit Hooks)

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
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,html,yml,yaml}": ["prettier --write"]
  }
}
```

> Husky requires a git repo — make sure Step 1 is done first.

## Step 5: Vitest + React Testing Library

**Install:**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Update `vite.config.ts`** — add the test configuration:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // added in Step 8
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

**Create `src/test/setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest'
```

**Create `src/test/example.test.ts`** (sanity check):

```ts
import { describe, it, expect } from 'vitest'

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

## Step 6: Folder Structure

Create this directory structure under `src/`:

```
src/
  components/
    ui/                # shadcn/ui components (populated by CLI in Step 8)
    layout/            # Sidebar, Header, Footer
  pages/
    dashboard/         # Dashboard page
    transactions/      # Transactions page
    accounts/          # Accounts page
    budgets/           # Budgets page
    settings/          # Settings page
  hooks/               # Custom React hooks
  lib/                 # Utilities (utils.ts with cn(), formatCurrency, etc.)
  services/            # API service functions
  stores/              # Zustand stores
  types/               # Shared TypeScript interfaces
  test/                # Test setup (created in Step 5)
  assets/              # Static assets (already exists)
```

**Conventions:**
- Page-specific sub-components live inside their page directory (e.g., `pages/dashboard/BalanceCard.tsx`)
- Components used by 2+ pages go in `components/`
- One store per domain concept in `stores/`
- API functions in `services/`, query hooks in `hooks/`

## Step 7: React Router v7

**Install:**

```bash
pnpm add react-router
```

> In React Router v7, the package is `react-router` (not `react-router-dom`).

**Create placeholder page components** in each page directory (e.g., `src/pages/dashboard/DashboardPage.tsx`):

```tsx
export default function DashboardPage() {
  return <div>Dashboard</div>
}
```

Do the same for `TransactionsPage`, `AccountsPage`, `BudgetsPage`, `SettingsPage`.

**Replace `src/App.tsx`:**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TransactionsPage from '@/pages/transactions/TransactionsPage'
import AccountsPage from '@/pages/accounts/AccountsPage'
import BudgetsPage from '@/pages/budgets/BudgetsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

## Step 8: Tailwind CSS v4 + shadcn/ui

### Tailwind CSS

**Install:**

```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm add -D prettier-plugin-tailwindcss
```

**Update `vite.config.ts`** — add `tailwindcss()` to plugins (see Step 5 for full file).

**Replace `src/index.css` contents:**

```css
@import 'tailwindcss';

@theme {
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-accent: #f1f5f9;
  --color-accent-foreground: #0f172a;
  --color-destructive: #ef4444;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-card: #ffffff;
  --color-card-foreground: #0f172a;
  --color-border: #e2e8f0;
  --color-input: #e2e8f0;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

**Delete `src/App.css`** — all styling is now via Tailwind utility classes.

**Update `.prettierrc.json`** — add the Tailwind plugin:

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
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### shadcn/ui

**Initialize:**

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**
- Components location: `src/components/ui`
- Utils location: `src/lib/utils.ts`

**Add starter components:**

```bash
pnpm dlx shadcn@latest add button card table badge input select dialog tabs separator skeleton
```

Components most useful for a finance dashboard:
- `card` — dashboard widgets, account summaries, balance displays
- `table` — transaction lists
- `badge` — status indicators (paid, pending, overdue)
- `button`, `input`, `select`, `dialog` — basic interactions
- `tabs` — switching views within a page
- `skeleton` — loading states

## Step 9: Zustand (State Management)

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
  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),
}))
```

**Convention:** One store per domain — `useAccountStore`, `useTransactionStore`, `useBudgetStore`, etc.

## Step 10: TanStack Query + Mock Data

**Install:**

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

**Update `src/main.tsx`:**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '@/index.css'
import App from '@/App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
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

## Step 11: Environment Variables

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

## Step 12: Clean Up Boilerplate

- Delete `src/assets/react.svg`
- Delete `public/vite.svg`
- Update `index.html` — change `<title>` to "Finance Dashboard", remove Vite favicon reference
- `App.tsx`, `main.tsx`, and `index.css` are already rewritten in previous steps

---

## All Dependencies Summary

**Production:**

```bash
pnpm add react-router zustand @tanstack/react-query
```

**Dev:**

```bash
pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss husky lint-staged vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom tailwindcss @tailwindcss/vite @tanstack/react-query-devtools
```

**CLI (run once):**

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card table badge input select dialog tabs separator skeleton
```

---

## Verification Checklist

- [ ] `pnpm dev` — dev server starts, dashboard page renders with Tailwind styles
- [ ] `pnpm build` — production build succeeds with no TypeScript errors
- [ ] `pnpm test:run` — Vitest runs the sanity test and passes
- [ ] `pnpm lint` — ESLint runs with no errors
- [ ] `pnpm format:check` — Prettier reports all files formatted
- [ ] Make a test commit — Husky pre-commit hook runs lint-staged successfully
- [ ] Navigate between routes (`/`, `/transactions`, etc.) — React Router works
