import { createFileRoute, Outlet, useLocation, useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Heading } from '~/app/components/heading'
import { Tabs, TabsItem, TabsList } from '~/app/components/tabs'
import { Text } from '~/app/components/text'

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
    <div className='mx-auto space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Cluster
        </Heading>
        <Text className='text-muted'>Manage and monitor your Garage cluster</Text>
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
