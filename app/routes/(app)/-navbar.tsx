import { Link, useLocation } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import { ScrollArea } from '~/app/components/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupTitle,
  SidebarHeader,
  SidebarItem,
  SidebarItemButton,
  SidebarList,
  SidebarLogo,
  SidebarMenu
} from '~/app/components/sidebar'
import { Text } from '~/app/components/typography'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'
import type { User } from '~/shared/schemas/user.schema'

interface NavItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  to?: string
  exact?: boolean
  params?: { id: string }
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

interface NavbarProps {
  user: User | null
  logoutFn: () => void
  sidebarOpen: boolean
  sidebarFn: () => void
  buckets?: ListBucketsResponse[]
  isLoading?: boolean
}

function renderNavItem(item: NavItem, location: string) {
  return (
    <SidebarItem key={item.label}>
      <SidebarItemButton
        render={
          item.params ? (
            <Link
              to={item.to}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              params={item.params as any}
              activeOptions={{ exact: item.exact }}
            />
          ) : (
            <Link to={item.to} activeOptions={{ exact: item.exact }} />
          )
        }
        active={location === item.to}
      >
        {item.icon ? <item.icon /> : null}
        {item.label}
      </SidebarItemButton>
    </SidebarItem>
  )
}

function renderNavGroup(group: NavGroup, index: number, location: string) {
  return (
    <SidebarGroup key={`${index}-${group.title}`}>
      {group.title ? (
        <SidebarGroupTitle className='text-sm'>{group.title}</SidebarGroupTitle>
      ) : null}
      <SidebarList>{group.items.map((item) => renderNavItem(item, location))}</SidebarList>
    </SidebarGroup>
  )
}

function BucketQuickAccess({
  buckets,
  isLoading
}: {
  buckets?: ListBucketsResponse[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupTitle className='text-sm'>Quick Access</SidebarGroupTitle>
        <SidebarList>
          {[1, 2, 3].map((i) => (
            <SidebarItem key={i}>
              <div className='flex w-full items-center gap-2.5 px-2.5 py-1.5'>
                <div className='bg-dimmed/30 h-4 w-4 animate-pulse rounded' />
                <div className='bg-dimmed/30 h-4 w-36 animate-pulse rounded' />
              </div>
            </SidebarItem>
          ))}
        </SidebarList>
      </SidebarGroup>
    )
  }

  const bucketItems =
    buckets?.map((bucket) => ({
      to: '/buckets/$id' as const,
      label: bucket.globalAliases[0] || bucket.id,
      params: { id: bucket.id }
    })) ?? []

  if (bucketItems.length === 0) {
    return (
      <SidebarGroup className='mt-2'>
        <SidebarGroupTitle className='text-sm'>Quick Access</SidebarGroupTitle>
        <SidebarList>
          <SidebarItem className='px-2.5 py-2'>
            <Text className='text-muted text-xs'>No buckets yet</Text>
          </SidebarItem>
        </SidebarList>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className='mt-2 flex min-h-0 flex-1 flex-col'>
      <SidebarGroupTitle className='text-sm'>Quick Access</SidebarGroupTitle>
      <ScrollArea scrollbar='vertical' render={<SidebarList className='min-h-0 flex-1' />}>
        {bucketItems.map((item) => (
          <SidebarItem key={item.label}>
            <SidebarItemButton
              render={
                <Link
                  to={item.to}
                  params={item.params}
                  search={{ prefix: undefined, key: undefined }}
                />
              }
            >
              <Lucide.Box className='size-4' />
              {item.label}
            </SidebarItemButton>
          </SidebarItem>
        ))}
      </ScrollArea>
    </SidebarGroup>
  )
}

export function Navbar({
  user,
  logoutFn,
  sidebarOpen,
  sidebarFn,
  buckets,
  isLoading
}: NavbarProps) {
  const location = useLocation()

  const mainMenu: NavGroup = {
    items: [
      { to: '/', label: 'Overview', icon: Lucide.Warehouse, exact: true },
      { to: '/nodes', label: 'Nodes', icon: Lucide.KeyRound, exact: false },
      { to: '/keys', label: 'Keys', icon: Lucide.KeyRound, exact: false },
      { to: '/buckets', label: 'Buckets', icon: Lucide.Box, exact: false },
      { to: '/profile', label: 'Account', icon: Lucide.UserCircle, exact: false }
    ]
  }

  const navGroups = [mainMenu]

  return (
    <Sidebar
      size='loose'
      className='bg-background border-border/50 border-r xl:bg-neutral-50 dark:xl:bg-neutral-950'
    >
      <SidebarHeader className='inline-flex items-center justify-between'>
        <SidebarLogo className='flex-1 p-1'>
          <img src='/logo.png' alt='Garasi' className='h-8 w-auto' />
          <span className='sr-only'>Garage Console</span>
        </SidebarLogo>
        <Button
          variant='plain'
          size='sm-icon'
          className={!sidebarOpen ? 'lg:hidden' : ''}
          onClick={sidebarFn}
        >
          {sidebarOpen ? <Lucide.SidebarCloseIcon /> : <Lucide.SidebarOpenIcon />}
        </Button>
      </SidebarHeader>
      <SidebarContent className='overflow-hidden'>
        <SidebarMenu>
          {navGroups.map((group, index) => renderNavGroup(group, index, location.pathname))}
        </SidebarMenu>
        <BucketQuickAccess buckets={buckets} isLoading={isLoading} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarList>
            <SidebarItem className='flex w-full items-center space-x-1 rounded-lg py-1 pr-1 pl-2'>
              <div className='min-w-0 flex-1'>
                <Text className='truncate font-medium'>{user?.name || 'User'}</Text>
                <Text className='text-muted -mt-0.5 truncate text-xs font-normal'>
                  {user?.email || 'User'}
                </Text>
              </div>
              <Button variant='plain' size='icon' onClick={logoutFn}>
                <Lucide.LogOutIcon />
              </Button>
            </SidebarItem>
          </SidebarList>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
