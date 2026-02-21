import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useCanGoBack, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { Component, useEffect, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, errorInfo: { componentStack: string }) => ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (!error.message && !error.stack) {
      console.warn('Ignoring empty error object, likely from library internals:', error)
      return { hasError: false, error: null }
    }

    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    if (error.message || error.stack) {
      console.error('Error caught by boundary:', error, errorInfo)
    } else {
      console.warn('Error boundary caught empty error object, likely from library internals:', {
        error,
        componentStack: errorInfo.componentStack
      })
    }
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, { componentStack: '' })
      }
      return this.props.fallback
    }

    const handleReload = () => {
      window.location.reload()
    }

    const handleBack = () => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }

    return (
      <>
        <title>Application Error</title>
        <div className='bg-background relative flex min-h-screen flex-col items-center justify-center'>
          <div className='from-muted/20 absolute inset-0 bg-gradient-to-b via-transparent to-transparent' />
          <div className='pointer-events-none fixed inset-0 z-10 flex items-center justify-center select-none'>
            <h2 className='text-danger/10 text-[12rem] font-black mix-blend-overlay sm:text-[16rem] md:text-[20rem]'>
              ERROR
            </h2>
          </div>
          <div className='relative z-20 px-4 py-16 text-center sm:px-6 lg:px-8'>
            <p className='text-danger text-2xl font-bold'>Application Error</p>
            <h1 className='text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
              Something went wrong
            </h1>
            <p className='text-dimmed mt-6 text-base leading-7 font-medium'>
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-4'>
              <button
                type='button'
                onClick={handleReload}
                className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary-border inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
              >
                Reload Page
              </button>
              <button
                type='button'
                onClick={handleBack}
                className='border-border bg-card text-foreground hover:bg-muted focus-visible:outline-border inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export function NotFound() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ href: '/' })
    }
  }

  return (
    <>
      <title>404 Not Found</title>
      <div className='bg-background relative flex min-h-screen flex-col items-center justify-center'>
        <div className='from-muted/20 absolute inset-0 bg-gradient-to-b via-transparent to-transparent' />
        <div className='pointer-events-none fixed inset-0 z-10 flex items-center justify-center select-none'>
          <h2 className='text-danger/10 text-[12rem] font-black mix-blend-overlay sm:text-[16rem] md:text-[20rem]'>
            404
          </h2>
        </div>
        <div className='relative z-20 px-4 py-16 text-center sm:px-6 lg:px-8'>
          <p className='text-danger text-2xl font-bold'>404</p>
          <h1 className='text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Page not found
          </h1>
          <p className='text-dimmed mt-6 text-base leading-7 font-medium'>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-4'>
            <button
              type='button'
              onClick={handleBack}
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary-border inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Go back
            </button>
            <a
              href='https://github.com/riipandi/garasi'
              className='border-border bg-card text-foreground focus-visible:outline-border hover:bg-secondary hover:text-secondary-foreground inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
              rel='noopener noreferrer'
              target='_blank'
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export function ErrorGeneral({ error, reset }: ErrorComponentProps) {
  const queryErrorResetBoundary = useQueryErrorResetBoundary()
  const isSessionExpired = error.message === 'Session expired'

  const router = useRouter()
  const canGoBack = useCanGoBack()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  useEffect(() => {
    if (isSessionExpired) {
      const currentPath = window.location.pathname
      if (currentPath !== '/signin') {
        window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`
      }
    }
  }, [isSessionExpired])

  const handleBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ href: '/' })
    }
  }

  if (isSessionExpired) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='border-border-t-foreground/30 border-t-primary size-8 animate-spin rounded-full border-4' />
          </div>
          <p className='text-dimmed text-sm'>Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <title>500 Error</title>
      <div className='bg-background relative flex min-h-screen flex-col items-center justify-center'>
        <div className='from-muted/20 absolute inset-0 bg-gradient-to-b via-transparent to-transparent' />
        <div className='pointer-events-none fixed inset-0 z-10 flex items-center justify-center select-none'>
          <h2 className='text-danger/10 text-[12rem] font-black mix-blend-overlay sm:text-[16rem] md:text-[20rem]'>
            500
          </h2>
        </div>
        <div className='relative z-20 px-4 py-16 text-center sm:px-6 lg:px-8'>
          <p className='text-danger text-2xl font-bold'>Error</p>
          <h1 className='text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Something went wrong
          </h1>
          <p className='text-dimmed mt-6 text-base leading-7 font-medium'>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-4'>
            <button
              type='button'
              onClick={() => reset()}
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary-border inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Try again
            </button>
            <button
              type='button'
              onClick={handleBack}
              className='border-border bg-card text-foreground hover:bg-muted focus-visible:outline-border inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
