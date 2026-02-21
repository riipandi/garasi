import { createFileRoute, Outlet } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { NotFound } from '~/app/errors'
import { requireAuthentication, useAuth } from '~/app/guards'
import { clx } from '~/app/utils'
import { Navbar } from './-navbar'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: async ({ location }) => {
    return requireAuthentication(location)
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
          'fixed top-0 z-50 h-dvh w-full transition-all *:h-full lg:w-64 lg:max-w-64',
          sidebarOpen ? 'left-0' : '-left-full'
        )}
      >
        <Navbar
          user={user}
          logoutFn={handleLogout}
          sidebarOpen={sidebarOpen}
          sidebarFn={handleSidebarOpen}
        />
      </div>
      <main className={clx('transition-all', sidebarOpen ? 'lg:ml-64' : 'lg:ml-0')}>
        <nav className='flex h-16 items-center gap-2.5 bg-transparent px-2 lg:h-12'>
          <React.Activity mode={sidebarOpen ? 'hidden' : 'visible'}>
            <Button variant='plain' size='sm-icon' onClick={handleSidebarOpen}>
              {sidebarOpen ? <Lucide.SidebarCloseIcon /> : <Lucide.SidebarOpenIcon />}
            </Button>
          </React.Activity>
        </nav>
        <div className='min-h-[calc(100vh-4rem)] lg:-mt-12'>
          <div
            className={clx(
              'mx-auto h-full w-full flex-1 overflow-auto pt-2 pb-8 lg:block lg:py-8',
              sidebarOpen ? 'px-8' : 'px-4 lg:px-8'
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}
