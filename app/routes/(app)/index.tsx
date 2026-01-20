import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetcher } from '~/app/fetcher'

export const Route = createFileRoute('/(app)/')({
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

function RouteComponent() {
  const [data, setData] = useState<WhoamiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetcher<WhoamiResponse>('/auth/whoami')
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className='mx-auto max-w-4xl'>
      {/* API Response */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-xl font-semibold'>User Information</h2>

        {loading && <div className='text-gray-500'>Loading...</div>}

        {error && (
          <div className='rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700'>
            Error: {error}
          </div>
        )}

        {data && !loading && (
          <div className='space-y-2'>
            {data.success && data.data ? (
              <>
                <div className='rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
                  <p>
                    <strong>User ID:</strong> {data.data.user_id}
                  </p>
                </div>
                <div className='rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
                  <p>
                    <strong>Email:</strong> {data.data.email}
                  </p>
                </div>
                <div className='rounded border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700'>
                  <p>
                    <strong>Name:</strong> {data.data.name}
                  </p>
                </div>
              </>
            ) : (
              <div className='rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700'>
                <p>No user data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
