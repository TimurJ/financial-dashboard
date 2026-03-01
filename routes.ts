import { rootRoute, index, route } from '@tanstack/virtual-file-routes'

export const routes = rootRoute('__root.tsx', [
  index('dashboard.tsx'),
  route('/transactions', 'transactions.tsx'),
  route('/accounts', 'accounts.tsx'),
  route('/budgets', 'budgets.tsx'),
  route('/settings', 'settings.tsx'),
])
