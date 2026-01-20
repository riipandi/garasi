import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fetcher } from '~/app/fetcher'

export const Route = createFileRoute('/(app)/')({
  // Ensure the data is in the cache before render
  loader: ({ context }) => context.queryClient.ensureQueryData(whoamiQuery),
  component: RouteComponent
})

interface WhoamiResponse {
  success: boolean
  message: string | null
  data: {
    user_id: string
    email: string
    name: string
  } | null
}

const whoamiQuery = queryOptions({
  queryKey: ['whoami'],
  queryFn: () => fetcher<WhoamiResponse>('/auth/whoami')
})

function RouteComponent() {
  // Prefer suspense for best SSR + streaming behavior
  const { data } = useSuspenseQuery(whoamiQuery)

  return (
    <div className='mx-auto w-full max-w-4xl'>
      {/* API Response */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <h2 className='mb-4 text-lg font-semibold sm:text-xl'>User Information</h2>

        <div className='space-y-2'>
          {data.success && data.data ? (
            <>
              <div className='rounded border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-700 sm:px-4 sm:py-3'>
                <p>
                  <strong>User ID:</strong> {data.data.user_id}
                </p>
              </div>
              <div className='rounded border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700 sm:px-4 sm:py-3'>
                <p>
                  <strong>Email:</strong> {data.data.email}
                </p>
              </div>
              <div className='rounded border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm text-purple-700 sm:px-4 sm:py-3'>
                <p>
                  <strong>Name:</strong> {data.data.name}
                </p>
              </div>
            </>
          ) : (
            <div className='rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 sm:px-4 sm:py-3'>
              <p>No user data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
