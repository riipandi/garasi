import { MenuItem } from '~/app/components/menu'

interface DropdownItemProps {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}

export function DropdownItem({ icon: Icon, onClick, children, danger = false }: DropdownItemProps) {
  return (
    <MenuItem
      onClick={onClick}
      className={danger ? 'text-danger data-[highlighted]:bg-danger/10' : ''}
    >
      <Icon className='size-4' />
      {children}
    </MenuItem>
  )
}
