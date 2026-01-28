import * as Lucide from 'lucide-react'
import * as React from 'react'
import {
  Dialog,
  DialogBody,
  DialogPopup,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from '~/app/components/dialog'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <Stack direction='row' className='items-start'>
            <IconBox variant='info' size='md' circle>
              <Lucide.FolderPlus className='size-5' />
            </IconBox>
            <div>
              <DialogTitle>Create Folder</DialogTitle>
              <Text className='text-sm text-muted-foreground'>Enter a name for new folder</Text>
            </div>
          </Stack>
        </DialogHeader>

        <DialogBody>
          <form
            className={`space-y-4 ${isSubmitting ? 'animate-pulse' : ''}`}
            onSubmit={handleSubmit}
          >
            <Stack>
              <Input
                type='text'
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder='Folder name'
                disabled={isSubmitting}
                autoFocus
              />
            </Stack>

            <Stack>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='primary'
                disabled={!folderName.trim() || isSubmitting}
                progress={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </Stack>
          </form>
        </DialogBody>

        <DialogFooter />
      </DialogPopup>
    </Dialog>
  )
}
