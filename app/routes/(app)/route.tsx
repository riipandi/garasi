import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { NotFound } from '~/app/errors'
import { useAuth } from '~/app/guards'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ location, context }) => {
    if (!context.auth.accessToken) {
      throw redirect({ to: '/signin', search: { redirect: location.href } })
    }
  }
})

function RouteComponent() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
      .then(() => router.navigate({ to: '/signin', search: { redirect: '/' } }))
      .catch((error) => console.error('Logout failed', error))
  }

  return (
    <div className='p-4'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-6 text-3xl font-bold'>Welcome!</h1>

        {/* Auth Status */}
        <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>Authentication Status</h2>
          <div>
            <p className='mb-2 text-green-600'>✓ You are logged in</p>
            <p className='mb-4 text-gray-600'>Welcome, {user?.name}!</p>
            <button
              type='button'
              className='rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600'
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Auth Info */}
        {user && (
          <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>User Information</h2>
            <div className='space-y-2'>
              <div>
                <span className='font-medium'>ID:</span>
                <span className='ml-2 text-gray-600'>{user.id}</span>
              </div>
              <div>
                <span className='font-medium'>Email:</span>
                <span className='ml-2 text-gray-600'>{user.email}</span>
              </div>
              <div>
                <span className='font-medium'>Name:</span>
                <span className='ml-2 text-gray-600'>{user.name}</span>
              </div>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  )
}
