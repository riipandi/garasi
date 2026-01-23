import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, redirect, useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn as clx } from 'tailwind-variants'
import { NotFound } from '~/app/errors'
import { listBuckets } from '~/app/fetcher'
import { useAuth } from '~/app/guards'
import type { BucketListItem } from '~/app/routes/(app)/buckets/-partials/types'
import { uiStore } from '~/app/stores'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ location, context }) => {
    if (!context.auth.atoken) {
      throw redirect({ to: '/signin', search: { redirect: location.href } })
    }
  }
})

function RouteComponent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const ui = uiStore.get()
    setIsMobileSidebarOpen(ui.sidebar === 'show')
  }, [])

  // Fetch buckets for quick access
  const { data, isLoading, error } = useQuery<BucketListItem[]>({
    queryKey: ['buckets'],
    queryFn: listBuckets,
    staleTime: 60000 // Cache for 1 minute
  })
  const buckets = Array.isArray(data) ? data : []

  // Debug logging
  if (error) {
    console.error('Error fetching buckets:', error)
  }
  console.info('BUCKETS_DATA', { data, buckets, isLoading, error })
  const handleLogout = () => {
    logout()
      .then(() => router.navigate({ to: '/signin', search: { redirect: '/' } }))
      .catch((error) => console.error('Logout failed', error))
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => {
      const newState = !prev
      uiStore.set({ ...uiStore.get(), sidebar: newState ? 'show' : 'hide' })
      return newState
    })
  }

  return (
    <div className='flex h-screen flex-col bg-gray-50 text-gray-900'>
      {/* Mobile Header */}
      <header className='border-b border-gray-200 bg-white px-4 py-3 lg:hidden'>
        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={toggleMobileSidebar}
            className='rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            aria-label='Toggle sidebar'
          >
            <Lucide.Menu className='size-6' />
          </button>
          <h1 className='text-lg font-semibold text-gray-900'>Garasi Console</h1>
          <div className='size-6' /> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className='flex-1 overflow-hidden bg-gray-50'>
        <div className='flex h-full'>
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className='fixed inset-0 z-40 bg-black/50 lg:hidden'
              onClick={toggleMobileSidebar}
              aria-hidden='true'
            />
          )}

          {/* Sidebar Navigation */}
          <aside
            className={clx(
              'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className='flex h-full flex-col justify-between overflow-y-auto px-4 pt-5 pb-3'>
              <div>
                <div className='mb-6 flex items-center justify-between p-1'>
                  <div className='flex flex-col items-start justify-center'>
                    <h2 className='text-lg font-semibold text-gray-900'>Garasi Console</h2>
                    <p className='mt-0.5 text-xs font-medium text-gray-500'>
                      Manage your Garage S3
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={toggleMobileSidebar}
                    className='rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 lg:hidden'
                    aria-label='Close sidebar'
                  >
                    <Lucide.X className='size-5' />
                  </button>
                </div>

                <nav className='space-y-0.5'>
                  <NavLink to='/' icon={Lucide.LayoutDashboard} label='Dashboard' exact />
                  <NavLink to='/metrics' icon={Lucide.GanttChartSquare} label='Metrics' />
                  <NavLink to='/cluster' icon={Lucide.Server} label='Cluster' />
                  <NavLink to='/buckets' icon={Lucide.Database} label='Buckets' exact />
                  <NavLink to='/keys' icon={Lucide.KeyRound} label='Access Keys' />
                  <NavDivider />
                  <NavSection title='Quick Access' />
                  <QuickAccessBuckets buckets={buckets} />
                </nav>
              </div>

              <div className='flex items-center justify-between gap-2 border-t border-gray-200 pt-2.5'>
                <NavLink
                  to='/profile'
                  icon={Lucide.UserCircle}
                  label={user?.name || 'Account'}
                  exact
                />
                <button
                  type='button'
                  className='flex h-full w-10 items-center justify-center rounded-lg text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900'
                  onClick={handleLogout}
                >
                  <Lucide.LogOut className='size-4' strokeWidth={2.0} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1 overflow-auto bg-gray-50'>
            <div className='mx-auto h-auto max-w-7xl px-4 py-8 lg:px-8 lg:pb-10'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Reusable navlink component
function NavLink({
  to,
  icon: Icon,
  label,
  exact = false,
  onClick
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  exact?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      className={clx(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900'
      )}
      activeProps={{
        className: clx(
          'bg-gray-200 font-medium text-gray-900 hover:bg-gray-200 hover:text-gray-900'
        )
      }}
      activeOptions={{ exact }}
      onClick={() => {
        onClick?.()
        // Close mobile sidebar on navigation
        if (window.innerWidth < 1024) {
          const ui = uiStore.get()
          if (ui.sidebar === 'show') {
            uiStore.set({ ...ui, sidebar: 'hide' })
          }
        }
      }}
    >
      <Icon className='size-4' />
      <span>{label}</span>
    </Link>
  )
}

// Navbar section header
function NavSection({ title }: { title: string }) {
  return (
    <div className='mt-5 mb-2 px-3'>
      <h3 className='text-xs font-semibold tracking-wider text-gray-500 uppercase'>{title}</h3>
    </div>
  )
}

// Reusable navbar divider
function NavDivider() {
  return <div className='my-3 border-t border-gray-200' />
}

// Quick access buckets component
function QuickAccessBuckets({
  buckets,
  onBucketClick
}: {
  buckets: BucketListItem[]
  onBucketClick?: () => void
}) {
  // Handle loading state
  if (!Array.isArray(buckets)) {
    return <div className='px-3 py-2 text-xs text-gray-500'>Loading buckets...</div>
  }

  if (buckets.length === 0) {
    return <div className='px-3 py-2 text-xs text-gray-500'>No buckets available</div>
  }

  return (
    <div className='space-y-0.5 px-3'>
      {buckets.map((bucket) => {
        // Use global alias if available, otherwise use bucket id
        const displayName = bucket.globalAliases[0] || bucket.id
        const bucketPath = `/buckets/${bucket.id}`

        return (
          <Link
            key={bucket.id}
            to={bucketPath}
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900'
            activeProps={{
              className:
                'bg-gray-200 font-medium text-gray-900 hover:bg-gray-200 hover:text-gray-900'
            }}
            onClick={() => {
              onBucketClick?.()
              // Close mobile sidebar on navigation
              if (window.innerWidth < 1024) {
                const ui = uiStore.get()
                if (ui.sidebar === 'show') {
                  uiStore.set({ ...ui, sidebar: 'hide' })
                }
              }
            }}
          >
            <Lucide.Database className='size-4' />
            <span className='truncate'>{displayName}</span>
          </Link>
        )
      })}
    </div>
  )
}
