import * as React from 'react'
import { Menu, MenuPopup } from '~/app/components/menu'
import { Stack } from '~/app/components/stack'

interface DropdownMenuProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export function DropdownMenu({ children, isOpen, onClose }: DropdownMenuProps) {
  if (!isOpen) return null

  return (
    <Menu open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <MenuPopup className='animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-1 min-w-48'>
        <Stack>{children}</Stack>
      </MenuPopup>
    </Menu>
  )
}
