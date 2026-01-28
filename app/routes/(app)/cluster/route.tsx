import { createFileRoute, Outlet, useLocation, useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Tabs, TabsItem, TabsList } from '~/app/components/tabs'

export const Route = createFileRoute('/(app)/cluster')({
  component: RouteComponent
})

type TabType = 'overview' | 'layout' | 'nodes'

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()

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

  const handleTabChange = (tabId: TabType) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      router.navigate({ to: tab.path })
    }
  }

  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      <div className='min-w-0 flex-1'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Cluster</h1>
          <p className='text-normal mt-2 text-gray-500'>Manage and monitor your Garage cluster</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabType)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsItem key={tab.id} value={tab.id}>
              <tab.icon className='size-4' />
              {tab.label}
            </TabsItem>
          ))}
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  )
}
