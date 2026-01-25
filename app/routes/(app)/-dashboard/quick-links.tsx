import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'

interface QuickLink {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const quickLinks: QuickLink[] = [
  {
    to: '/metrics',
    label: 'Metrics',
    icon: Lucide.GanttChartSquare,
    description: 'Monitor cluster metrics'
  },
  {
    to: '/cluster',
    label: 'Cluster',
    icon: Lucide.Server,
    description: 'Manage cluster nodes'
  },
  {
    to: '/buckets',
    label: 'Buckets',
    icon: Lucide.Database,
    description: 'Manage S3 buckets'
  },
  {
    to: '/keys',
    label: 'Access Keys',
    icon: Lucide.KeyRound,
    description: 'Manage API keys'
  }
]

export function QuickLinks() {
  return (
    <div className='flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6'>
      <h2 className='text-lg font-semibold text-gray-900'>Quick Links</h2>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-1'>
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className='flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100'
          >
            <link.icon className='size-5 text-gray-600' />
            <div className='flex-1'>
              <p className='font-medium text-gray-900'>{link.label}</p>
              <p className='text-sm text-gray-500'>{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
