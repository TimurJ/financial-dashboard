import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/budgets')({
  component: Budgets,
})

function Budgets() {
  return <h1>Budgets</h1>
}
