import { Link } from '@tanstack/react-router'

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo'
  subtitle: string
  to?: string
}

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconText: 'text-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconText: 'text-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconText: 'text-red-600'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconText: 'text-blue-600'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconText: 'text-purple-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconText: 'text-indigo-600'
  }
}

export function StatCard({ title, value, icon: Icon, color, subtitle, to }: StatCardProps) {
  const cardContent = (
    <div
      className={`rounded-lg border ${colorClasses[color].border} ${colorClasses[color].bg} p-4 ${to ? 'cursor-pointer hover:shadow-sm' : ''}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-500'>{title}</p>
          <p className='mt-1 text-lg font-semibold text-gray-900'>{value}</p>
          <p className='mt-1 text-sm text-gray-600'>{subtitle}</p>
        </div>
        <Icon className={`size-5 ${colorClasses[color].iconText}`} />
      </div>
    </div>
  )

  if (to) {
    return <Link to={to}>{cardContent}</Link>
  }

  return cardContent
}
