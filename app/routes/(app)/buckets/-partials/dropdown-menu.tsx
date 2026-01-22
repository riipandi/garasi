import * as React from 'react'

interface DropdownMenuProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export function DropdownMenu({ children, isOpen, onClose }: DropdownMenuProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className='animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-1 min-w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg duration-200'
    >
      {children}
    </div>
  )
}
