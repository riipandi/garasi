import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useCanGoBack, useRouter } from '@tanstack/react-router'
import * as React from 'react'

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
        <div className='from-muted absolute inset-0 bg-linear-to-b via-transparent to-transparent' />
        <div className='pointer-events-none fixed inset-0 z-10 flex items-center justify-center select-none'>
          <h2 className='text-destructive/20 text-[12rem] font-black mix-blend-overlay sm:text-[16rem] md:text-[20rem]'>
            404
          </h2>
        </div>
        <div className='relative z-20 px-4 py-16 text-center sm:px-6 lg:px-8'>
          <p className='text-destructive-foreground text-2xl font-bold'>404</p>
          <h1 className='text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Page not found
          </h1>
          <p className='text-muted-foreground mt-6 text-base leading-7 font-medium'>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-4'>
            <button
              type='button'
              onClick={handleBack}
              className='bg-primary text-primary-foreground hover:bg-primary/90 min-w-35 cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-200'
            >
              Go back
            </button>
            <a
              href='https://reactrouter.com/home'
              className='border-input bg-secondary text-secondary-foreground hover:bg-secondary/90 min-w-35 rounded-md border px-4 py-2.5 text-sm font-semibold transition-all duration-200'
              rel='noopener noreferrer'
              target='_blank'
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export function ErrorGeneral({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  React.useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className='bg-background flex min-h-full flex-1 items-center justify-center'>
      <div className='border-destructive/20 bg-card w-full max-w-md rounded-lg border px-8 py-6 text-center shadow-md'>
        <h2 className='text-destructive mb-2 text-xl font-semibold'>Something went wrong</h2>
        <p className='text-muted-foreground mb-4 text-sm'>{error.message}</p>
        <button
          type='button'
          onClick={() => router.invalidate()}
          className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition'
        >
          Retry
        </button>
      </div>
    </div>
  )
}
