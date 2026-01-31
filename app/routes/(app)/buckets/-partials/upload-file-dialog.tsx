import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogPopup,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'

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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <Stack direction='row' className='items-start'>
            <IconBox variant='success' size='md' circle>
              <Lucide.UploadCloud className='size-5' />
            </IconBox>
            <div>
              <DialogTitle>Upload Files</DialogTitle>
              <Text className='text-muted-foreground text-sm'>Select files to upload</Text>
            </div>
          </Stack>
        </DialogHeader>

        <DialogBody>
          <form
            className={`space-y-4 ${isSubmitting ? 'animate-pulse' : ''}`}
            onSubmit={handleSubmit}
            onDragEnter={handleDrag}
            onDragLeave={handleDragLeave}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div
              className={`bg-muted/5 mt-4 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-all ${
                dragActive ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <Lucide.UploadCloud
                className={`mx-auto size-12 transition-all ${dragActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <Text className='mt-2 text-sm font-medium'>Click to upload or drag and drop</Text>
              <Text className='text-muted-foreground mt-1 text-xs'>Any file type is supported</Text>
              <input
                type='file'
                multiple
                onChange={handleFileSelect}
                className='absolute inset-0 size-full cursor-pointer opacity-0'
                disabled={isSubmitting}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className='border-border bg-muted/5 mt-4 rounded-lg border p-3'>
                <Text className='mb-2 text-sm font-medium'>
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </Text>
                <Stack>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`file-${index}`}
                      className='flex items-center justify-between text-sm'
                    >
                      <Text className='truncate'>{file.name}</Text>
                      <Text className='text-muted-foreground text-xs'>
                        {formatFileSize(file.size)}
                      </Text>
                    </div>
                  ))}
                </Stack>
              </div>
            )}
            <Stack>
              <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='primary'
                disabled={selectedFiles.length === 0 || isSubmitting}
                progress={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </Button>
            </Stack>
          </form>
        </DialogBody>

        <DialogFooter />
      </DialogPopup>
    </Dialog>
  )
}
