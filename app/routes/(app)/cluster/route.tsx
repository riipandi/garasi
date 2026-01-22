import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'

export const Route = createFileRoute('/(app)/cluster')({
  component: RouteComponent
})

type TabType = 'overview' | 'layout' | 'nodes'

function RouteComponent() {
  const location = useLocation()

  // Determine active tab from current path
  const getActiveTab = (): TabType => {
    const pathname = location.pathname
    if (pathname.includes('/layout')) return 'layout'
    if (pathname.includes('/nodes')) return 'nodes'
    return 'overview'
  }

  const activeTab = getActiveTab()

  const tabs: { id: TabType; label: string; icon: any; path: string }[] = [
    { id: 'overview', label: 'Overview', icon: Lucide.LayoutDashboard, path: '/cluster' },
    { id: 'layout', label: 'Layout', icon: Lucide.LayoutGrid, path: '/cluster/layout' },
    { id: 'nodes', label: 'Nodes', icon: Lucide.Server, path: '/cluster/nodes' }
  ]

  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Cluster</h1>
          <p className='text-normal mt-2 text-gray-500'>Manage and monitor your Garage cluster</p>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center gap-2 border-b-2 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className='size-4' />
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  )
}
