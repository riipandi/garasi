import { Link, useLocation } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
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
import { Text } from '~/app/components/text'
import type { User } from '~/shared/schemas/user.schema'

interface NavItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  to?: string
  exact?: boolean
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

interface NavbarProps {
  user: User | null
  logoutFn: () => void
}

function renderNavItem(item: NavItem) {
  const location = useLocation()

  return (
    <SidebarItem key={item.label}>
      <SidebarItemButton
        render={<Link to={item.to} activeOptions={{ exact: item.exact }} />}
        active={location.pathname === item.to}
      >
        {item.icon ? <item.icon /> : null}
        {item.label}
      </SidebarItemButton>
    </SidebarItem>
  )
}

function renderNavGroup(group: NavGroup, index: number) {
  return (
    <SidebarGroup key={`${index}-${group.title}`}>
      {group.title ? <SidebarGroupTitle>{group.title}</SidebarGroupTitle> : null}
      <SidebarList>{group.items.map((item) => renderNavItem(item))}</SidebarList>
    </SidebarGroup>
  )
}

export function Navbar({ user, logoutFn }: NavbarProps) {
  const overviewGroup: NavGroup = {
    items: [{ to: '/', label: 'Overview', icon: Lucide.Warehouse, exact: true }]
  }

  const primaryGroup: NavGroup = {
    title: 'Manage',
    items: [
      { to: '/cluster', label: 'Cluster', icon: Lucide.ServerCog },
      { to: '/buckets', label: 'Buckets', icon: Lucide.Box, exact: true },
      { to: '/keys', label: 'Access Keys', icon: Lucide.KeyRound }
    ]
  }

  const secondaryGroup: NavGroup = {
    title: 'Settings',
    items: [{ to: '/profile', label: 'User Account', icon: Lucide.CircleUser, exact: true }]
  }

  const navGroups = [overviewGroup, primaryGroup, secondaryGroup]

  return (
    <Sidebar
      size='loose'
      className='bg-background border-border max-lg:border-r xl:bg-neutral-50 dark:xl:bg-neutral-950'
    >
      <SidebarHeader>
        <SidebarLogo className='-mx-4 -mt-2 px-6 pt-4'>
          <img src='/images/vite.svg' alt='Garasi' className='size-6' />
          <span className='font-semibold'>Garage S3 Console</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>{navGroups.map((group, index) => renderNavGroup(group, index))}</SidebarMenu>
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
