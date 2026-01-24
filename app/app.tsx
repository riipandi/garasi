import { TanStackDevtools, type TanStackDevtoolsReactInit } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type AnyRouter, RouterProvider } from '@tanstack/react-router'
import type { LogType } from 'consola'
import { Suspense, useEffect, useState } from 'react'
import { SessionExpiredAlert } from '~/app/components/session-expired-alert'
import { AuthProvider } from '~/app/guards'
import type { GlobalContext } from '~/app/routes/__root'
import { authStore, uiStore } from '~/app/stores'

interface AppProps {
  basePath?: string
  apiUrl: string
  logLevel?: LogType
  queryClient: QueryClient
  routes: AnyRouter
  devTools?: Partial<TanStackDevtoolsReactInit>
}

export default function App(props: AppProps) {
  // Define the global router context to be passed to all routes.
  // Use state to make context reactive to store changes
  const [routerContext, setRouterContext] = useState<GlobalContext>({
    queryClient: props.queryClient,
    auth: authStore.get(),
    ui: uiStore.get()
  })

  // Listen to auth store changes and update context
  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setRouterContext((prev) => ({ ...prev, auth: authStore.get() }))
    })

    return unsubscribe
  }, [])

  // Listen to ui store changes and update context
  useEffect(() => {
    const unsubscribe = uiStore.subscribe(() => {
      setRouterContext((prev) => ({ ...prev, ui: uiStore.get() }))
    })

    return unsubscribe
  }, [])

  return (
    <QueryClientProvider client={props.queryClient}>
      <AuthProvider>
        <SessionExpiredAlert />
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={props.routes} context={routerContext} basepath={props.basePath} />
        </Suspense>
        <TanStackDevtools {...props.devTools} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
