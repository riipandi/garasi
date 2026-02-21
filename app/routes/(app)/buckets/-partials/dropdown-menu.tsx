import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { Menu, MenuPopup, MenuTrigger, MenuSeparator } from '~/app/components/menu'

interface DropdownMenuProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  trigger?: React.ReactNode
}

export function DropdownMenu({ children, isOpen, onClose, trigger }: DropdownMenuProps) {
  return (
    <Menu open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {trigger || (
        <MenuTrigger
          render={
            <Button
              type='button'
              variant='plain'
              size='sm-icon'
              className='text-dimmed hover:text-foreground'
            >
              <Lucide.MoreVertical className='size-4' />
            </Button>
          }
        />
      )}
      <MenuPopup className='animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-1 min-w-48'>
        {children}
      </MenuPopup>
    </Menu>
  )
}

export { DropdownItem } from './dropdown-item'
export { MenuSeparator }
