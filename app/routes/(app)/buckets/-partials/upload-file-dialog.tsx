import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Item, ItemContent, ItemMeta, ItemTitle } from '~/app/components/item'
import { ScrollArea } from '~/app/components/scroll-area'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { clx } from '~/app/utils'

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

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setSelectedFiles([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className='w-xl'>
        <DialogHeader>
          <IconBox variant='success' size='sm'>
            <Lucide.UploadCloud className='size-4' />
          </IconBox>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='border-border mt-3 border-t pt-1'>
          <form
            className={clx('space-y-4', isSubmitting ? 'animate-pulse' : '')}
            onSubmit={handleSubmit}
            onDragEnter={handleDrag}
            onDragLeave={handleDragLeave}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className='space-y-4'>
              {selectedFiles.length > 0 ? (
                <div className='border-border bg-muted/5 mt-4 rounded-lg border'>
                  <div className='border-border flex items-center justify-between border-b py-2 pr-3 pl-4'>
                    <Text className='text-xs font-medium'>
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    </Text>
                    <Button variant='plain' size='xs' className='text-xs' onClick={handleClearAll}>
                      Clear All
                    </Button>
                  </div>
                  <ScrollArea
                    scrollbar='vertical'
                    className={clx(selectedFiles.length > 3 && 'h-80 pr-2')}
                  >
                    <Stack className='p-3' spacing='sm'>
                      {selectedFiles.map((file, index) => {
                        const fileKey = `${file.name}-${file.size}-${index}`
                        return (
                          <Item
                            key={fileKey}
                            variant='plain'
                            className='border-border bg-background items-start justify-between rounded-lg border'
                            size='sm'
                          >
                            <div className='flex w-full items-start gap-1'>
                              <div className='flex size-8 items-center justify-center rounded'>
                                <Lucide.FileText className='text-primary size-5' />
                              </div>
                              <ItemContent className='w-full px-1'>
                                <ItemTitle className='text-xs'>{file.name}</ItemTitle>
                                <ItemMeta className='mt-1 text-xs'>
                                  {formatFileSize(file.size)}
                                </ItemMeta>
                              </ItemContent>
                            </div>
                            <Button
                              type='button'
                              variant='plain'
                              size='xs-icon'
                              onClick={() => handleRemoveFile(index)}
                              disabled={isSubmitting}
                              className='text-dimmed hover:text-danger'
                            >
                              <Lucide.X className='size-3.5' />
                            </Button>
                          </Item>
                        )
                      })}
                    </Stack>
                  </ScrollArea>
                </div>
              ) : (
                <div
                  className={clx(
                    'bg-muted/5 relative mt-4 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-all',
                    dragActive ? 'border-primary bg-primary/10' : 'border-border'
                  )}
                >
                  <Lucide.UploadCloud
                    className={clx(
                      'mx-auto size-12 transition-all',
                      dragActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <Text className='mt-2 text-sm font-medium'>Click to upload or drag and drop</Text>
                  <Text className='text-muted-foreground mt-1 text-xs'>
                    Any file type is supported
                  </Text>
                  <input
                    type='file'
                    multiple
                    onChange={handleFileSelect}
                    className='absolute inset-0 size-full cursor-pointer opacity-0'
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <Button
            type='submit'
            size='sm'
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || isSubmitting}
            progress={isSubmitting}
            block
          >
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
