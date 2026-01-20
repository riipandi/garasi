import { createFileRoute, Outlet, redirect, type ParsedLocation } from '@tanstack/react-router'
import { NotFound } from '~/app/errors'
import type { GlobalContext } from '~/app/routes/__root'

interface BeforeLoadParams {
  search?: { redirect?: string }
  context: GlobalContext
  location: ParsedLocation
}

export const Route = createFileRoute('/(auth)')({
  component: AuthLayoutComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ search, context }: BeforeLoadParams) => {
    if (context.auth.atoken) {
      const redirectTo = search?.redirect || '/'
      throw redirect({ href: redirectTo })
    }
  }
})

function AuthLayoutComponent() {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <Outlet />
    </div>
  )
}
