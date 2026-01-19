import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetcher } from '~/app/fetcher'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent
})

interface HelloResponse {
  baseURL: string
  result: Array<{
    id: number
    email: string
    name: string
    created_at: number
    updated_at: number | null
  }> | null
}

function RouteComponent() {
  const [data, setData] = useState<HelloResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetcher<HelloResponse>('/hello')
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
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
        <h2 className='mb-4 text-xl font-semibold'>API Response</h2>

        {loading && <div className='text-gray-500'>Loading...</div>}

        {error && (
          <div className='rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700'>
            Error: {error}
          </div>
        )}

        {data && !loading && (
          <div className='space-y-2'>
            <pre className='rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
              <code>{data.baseURL}</code>
            </pre>
            <pre className='rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700'>
              <code>{data.result ? data.result[0]?.name : 'No data'}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
