import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'

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
    label: 'AccessKeys',
    icon: Lucide.KeyRound,
    description: 'Manage API keys'
  }
]

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack spacing='sm'>
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className='border-border bg-accent hover:bg-accent/80 flex items-center gap-3 rounded-lg border p-3 transition-colors'
            >
              <link.icon className='text-dimmed size-5' />
              <div className='flex-1'>
                <p className='text-foreground font-medium'>{link.label}</p>
                <Text className='text-dimmed text-sm'>{link.description}</Text>
              </div>
              <Lucide.ChevronRight className='text-dimmed size-4' />
            </Link>
          ))}
        </Stack>
      </CardBody>
    </Card>
  )
}
