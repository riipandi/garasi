import { createFileRoute } from '@tanstack/react-router'
import { NodeDetail } from './-partials/node-detail'

export const Route = createFileRoute('/(app)/cluster/nodes/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { id } = Route.useParams()

  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      <NodeDetail queryClient={queryClient} nodeId={id} />
    </div>
  )
}
