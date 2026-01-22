import * as React from 'react'

interface DropdownItemProps {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}

export function DropdownItem({ icon: Icon, onClick, children, danger = false }: DropdownItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-gray-50 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
      }`}
    >
      <Icon className='size-4' />
      {children}
    </button>
  )
}
