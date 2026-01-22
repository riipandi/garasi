import * as Lucide from 'lucide-react'
import * as React from 'react'

interface UploadFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
  isSubmitting?: boolean
}

export function UploadFileDialog({
  isOpen,
  onClose,
  onUpload,
  isSubmitting
}: UploadFileDialogProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

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
      setSelectedFiles([])
    }
  }, [isOpen])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
    }
  }

  if (!isOpen) return null

  return (
    <div className='animate-in zoom-in-95 fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm duration-200'>
      <div className='animate-in zoom-in-95 fade-in w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100'>
              <Lucide.UploadCloud className='size-5 text-green-600' />
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>Upload Files</h3>
              <p className='text-sm text-gray-500'>Select files to upload</p>
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
          onDragEnter={handleDrag}
          onDragLeave={handleDragLeave}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div
            className={`mt-4 rounded-lg border-2 border-dashed bg-gray-50 px-6 py-8 text-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <Lucide.UploadCloud
              className={`mx-auto size-12 transition-all ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className='mt-2 text-sm font-medium text-gray-700'>
              Click to upload or drag and drop
            </p>
            <p className='mt-1 text-xs text-gray-500'>Any file type is supported</p>
            <input
              type='file'
              multiple
              onChange={handleFileSelect}
              className='absolute inset-0 size-full cursor-pointer opacity-0'
              disabled={isSubmitting}
            />
          </div>
          {selectedFiles.length > 0 && (
            <div className='mt-4 rounded-md border border-gray-200 bg-gray-50 p-3'>
              <p className='mb-2 text-sm font-medium text-gray-700'>
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                {selectedFiles.map((file, index) => (
                  <li key={index} className='flex items-center justify-between'>
                    <span className='truncate'>{file.name}</span>
                    <span className='text-xs text-gray-500'>
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              disabled={selectedFiles.length === 0 || isSubmitting}
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
                  Uploading...
                </span>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
