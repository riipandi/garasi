import { createFileRoute, Outlet } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { NotFound } from '~/app/errors'

export const Route = createFileRoute('/(app)/profile')({
  component: RouteComponent,
  notFoundComponent: NotFound
})

function RouteComponent() {
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Profile</h1>
        <p className='mt-1 text-sm text-gray-500'>Manage your account settings and preferences</p>
      </div>

      {/* Profile Navigation Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8 overflow-x-auto' aria-label='Tabs'>
          <ProfileNavLink to='/profile' icon={Lucide.User} label='Profile' exact />
          <ProfileNavLink
            to='/profile/change-password'
            icon={Lucide.Lock}
            label='Change Password'
          />
          <ProfileNavLink to='/profile/sessions' icon={Lucide.Smartphone} label='Sessions' />
          <ProfileNavLink to='/profile/change-email' icon={Lucide.Mail} label='Change Email' />
        </nav>
      </div>

      {/* Page Content */}
      <div className='mt-6'>
        <Outlet />
      </div>
    </div>
  )
}

function ProfileNavLink({
  to,
  icon: Icon,
  label,
  exact = false
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  exact?: boolean
}) {
  return (
    <Route.Link
      to={to}
      className='flex items-center gap-2 border-b-2 border-transparent px-1 pb-4 text-sm font-medium whitespace-nowrap text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700'
      activeProps={{
        className: 'border-blue-500 text-blue-600'
      }}
      activeOptions={{ exact }}
    >
      <Icon className='h-4 w-4' />
      <span>{label}</span>
    </Route.Link>
  )
}
