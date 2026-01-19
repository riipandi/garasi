import type { ReactNode } from 'react'

interface AlertProps {
  type?: 'success' | 'error' | 'info' | 'warning'
  children: ReactNode
  className?: string
}

const alertStyles = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-700'
}

export function Alert({ type = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`rounded border px-4 py-3 ${alertStyles[type]} ${className}`}>{children}</div>
  )
}
