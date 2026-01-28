import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { NotFound } from '~/app/errors'
import { Heading } from '~/app/components/heading'
import { Text } from '~/app/components/text'
import { Item, ItemContent, ItemMedia, ItemTitle } from '~/app/components/item'
import { Stack } from '~/app/components/stack'

export const Route = createFileRoute('/(app)/profile')({
  component: RouteComponent,
  notFoundComponent: NotFound
})

function RouteComponent() {
  const location = useRouterState().location.pathname

  const getActiveTab = () => {
    if (location === '/profile') return 'profile'
    if (location === '/profile/change-password') return 'change-password'
    if (location === '/profile/sessions') return 'sessions'
    if (location === '/profile/change-email') return 'change-email'
    return 'profile'
  }

  const activeTab = getActiveTab()

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      <div className='space-y-2 pb-4'>
        <Heading size='lg'>Profile</Heading>
        <Text>Manage your account settings and preferences</Text>
      </div>

      <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
        <div className='w-full lg:w-64'>
          <Stack>
            <ProfileNavLink
              to='/profile'
              icon={Lucide.User}
              label='Profile'
              isActive={activeTab === 'profile'}
            />
            <ProfileNavLink
              to='/profile/change-password'
              icon={Lucide.Lock}
              label='Change Password'
              isActive={activeTab === 'change-password'}
            />
            <ProfileNavLink
              to='/profile/sessions'
              icon={Lucide.Smartphone}
              label='Sessions'
              isActive={activeTab === 'sessions'}
            />
            <ProfileNavLink
              to='/profile/change-email'
              icon={Lucide.Mail}
              label='Change Email'
              isActive={activeTab === 'change-email'}
            />
          </Stack>
        </div>

        <div className='min-w-0 flex-1'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function ProfileNavLink({
  to,
  label,
  icon: Icon,
  isActive
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}) {
  return (
    <Route.Link
      to={to}
      className='w-full'
    >
      <Item
        variant={isActive ? 'info' : 'plain'}
        className='cursor-pointer w-full'
      >
        <ItemMedia>
          <Icon className='size-4' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
        </ItemContent>
      </Item>
    </Route.Link>
  )
}
