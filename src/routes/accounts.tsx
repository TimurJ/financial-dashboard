import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accounts')({
  component: Accounts,
})

function Accounts() {
  return <h1>Accounts</h1>
}
