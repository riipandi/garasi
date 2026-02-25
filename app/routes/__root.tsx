import { ThemeProvider } from '@lonik/themer'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ErrorGeneral, NotFound } from '~/app/errors'
import type { AuthStore, UIStore } from '~/app/stores'

export interface GlobalContext {
  queryClient: QueryClient
  auth: AuthStore
  ui: UIStore
}

export const Route = createRootRouteWithContext<GlobalContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorGeneral,
  loader({ context }) {
    const { queryClient, auth, ui } = context
    return { queryClient, auth, ui }
  }
})

function RootComponent() {
  return (
    <ThemeProvider
      themes={['light', 'dark']}
      attribute='data-theme'
      storage='localStorage'
      defaultTheme='system'
      disableTransitionOnChange={true}
      enableColorScheme={false}
      enableSystem={true}
    >
      <Outlet />
    </ThemeProvider>
  )
}
