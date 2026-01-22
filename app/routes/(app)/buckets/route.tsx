import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/buckets')({
  component: RouteComponent
})

function RouteComponent() {
  return <Outlet />
}
