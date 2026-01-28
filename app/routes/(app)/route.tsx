import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { Heading } from '~/app/components/heading'
import { NotFound } from '~/app/errors'
import { useAuth } from '~/app/guards'
import { clx } from '~/app/utils'
import { Navbar } from './-navbar'

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

  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    const windowResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    windowResize()
    window.addEventListener('resize', windowResize)
    return () => window.removeEventListener('resize', windowResize)
  }, [])

  function handleSidebarOpen() {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = () => {
    logout()
      .then(() => {
        window.location.href = '/signin'
      })
      .catch((error) => console.error('Logout failed', error))
  }

  return (
    <>
      <div
        className={clx(
          'fixed inset-0 z-10 hidden bg-black backdrop-blur-sm transition-all max-lg:block',
          sidebarOpen ? 'visible opacity-40' : 'invisible opacity-0'
        )}
        onClick={handleSidebarOpen}
      />
      <div
        className={clx(
          'fixed top-0 z-50 h-dvh w-full max-w-72 transition-all *:h-full md:w-72',
          sidebarOpen ? 'left-0' : '-left-full'
        )}
      >
        <Navbar user={user} logoutFn={handleLogout} />
      </div>
      <main className={clx('transition-all', sidebarOpen ? 'xl:ml-72' : 'xl:ml-0')}>
        <nav
          className={clx(
            'flex h-14 items-center gap-2.5 max-lg:px-4',
            sidebarOpen ? 'xl:pr-4 xl:pl-2' : 'xl:px-4'
          )}
        >
          <Button variant='plain' size='sm-icon' onClick={handleSidebarOpen}>
            {sidebarOpen ? <Lucide.SidebarCloseIcon /> : <Lucide.SidebarOpenIcon />}
          </Button>
          <Heading size='sm'>Dashboard</Heading>
        </nav>
        <div className='flex min-h-[calc(100vh-4rem)] flex-col gap-6 px-8 pt-4 pb-6 max-lg:px-4 lg:pb-8'>
          <div
            className={clx(
              'mx-auto h-full w-full flex-1 overflow-auto lg:block',
              sidebarOpen ? 'pr-8 pl-4' : 'px-4 lg:px-8'
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}
