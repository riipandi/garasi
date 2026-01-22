import * as Lucide from 'lucide-react'
import * as React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isConfirming
}: ConfirmDialogProps) {
  if (!isOpen) return null

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  return (
    <div className='animate-in zoom-in-95 fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200'>
      <div className='w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-6'>
        <div className='mb-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100'>
              <Lucide.AlertTriangle className='size-5 text-red-600' />
            </div>
            <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>{title}</h2>
          </div>
          <p className='mb-6 text-sm text-gray-600'>{message}</p>
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              isConfirming ? 'animate-pulse' : ''
            }`}
          >
            {isConfirming ? (
              <span className='flex items-center gap-2'>
                <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Confirming...
              </span>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
