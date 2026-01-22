import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/keys')({
  component: RouteComponent
})

function RouteComponent() {
  return <Outlet />
}
