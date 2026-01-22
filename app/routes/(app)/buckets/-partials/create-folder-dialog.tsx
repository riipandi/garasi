import * as Lucide from 'lucide-react'
import * as React from 'react'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (folderName: string) => void
  isSubmitting?: boolean
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreate,
  isSubmitting
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = React.useState('')

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  React.useEffect(() => {
    if (isOpen) {
      setFolderName('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreate(folderName.trim())
      setFolderName('')
    }
  }

  if (!isOpen) return null

  return (
    <div className='animate-in zoom-in-95 fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm duration-200'>
      <div className='animate-in zoom-in-95 fade-in w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
              <Lucide.FolderPlus className='size-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>Create Folder</h3>
              <p className='text-sm text-gray-500'>Enter a name for new folder</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            aria-label='Close dialog'
          >
            <Lucide.X className='size-5' />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className={`space-y-4 ${isSubmitting ? 'animate-pulse' : ''}`}
        >
          <div>
            <input
              type='text'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='Folder name'
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!folderName.trim() || isSubmitting}
              className={`rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                isSubmitting ? 'animate-pulse' : ''
              }`}
            >
              {isSubmitting ? (
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
                  Creating...
                </span>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
