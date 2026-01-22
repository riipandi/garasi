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
    label: 'View Metrics',
    icon: Lucide.GanttChartSquare,
    description: 'Monitor detailed cluster metrics'
  },
  {
    to: '/cluster',
    label: 'Manage Cluster',
    icon: Lucide.Server,
    description: 'View and manage cluster nodes'
  },
  {
    to: '/buckets',
    label: 'Manage Buckets',
    icon: Lucide.Database,
    description: 'Create and manage S3 buckets'
  },
  {
    to: '/keys',
    label: 'Access Keys',
    icon: Lucide.KeyRound,
    description: 'Manage API access keys'
  }
]

export function QuickLinks() {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold sm:text-xl'>Quick Links</h2>
        <Lucide.Zap className='size-5 text-gray-400' />
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className='flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300 hover:bg-gray-100'
          >
            <div className='rounded-lg bg-blue-50 p-2.5'>
              <link.icon className='size-5 text-blue-600' />
            </div>
            <div className='flex-1'>
              <p className='font-medium text-gray-900'>{link.label}</p>
              <p className='mt-1 text-sm text-gray-500'>{link.description}</p>
            </div>
            <Lucide.ArrowRight className='mt-1 size-5 text-gray-400' />
          </Link>
        ))}
      </div>
    </div>
  )
}
