import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/buckets/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Buckets</h1>
        <p className='text-normal mt-2 text-gray-500'>Manage bucket</p>
      </div>

      {/* Page Content */}
      <div className='min-w-0 flex-1'>
        <p>
          <Link to='/buckets/$id' params={{ id: 'a1a28c81d925514c8e357ad39fd539f2' }}>
            Go to Demo Bucket
          </Link>
        </p>
      </div>
    </div>
  )
}
