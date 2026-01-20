import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/metrics')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Metrics</h1>
        <p className='text-normal mt-2 text-gray-500'>Metrics</p>
      </div>

      {/* Page Content */}
      <div className='min-w-0 flex-1'>
        <p>This is page content</p>
      </div>
    </div>
  )
}
