import { Card, CardBody } from '~/app/components/card'
import { IconBox } from '~/app/components/icon-box'

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo'
  subtitle: string
}

const iconBoxSubtleVariant = {
  green: 'success-subtle' as const,
  yellow: 'warning-subtle' as const,
  red: 'danger-subtle' as const,
  blue: 'primary-subtle' as const,
  purple: 'info-subtle' as const,
  indigo: 'secondary-subtle' as const
}

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 space-y-1'>
            <p className='text-dimmed text-sm font-medium'>{title}</p>
            <p className='text-foreground text-2xl font-semibold capitalize'>{value}</p>
            <p className='text-dimmed text-sm'>{subtitle}</p>
          </div>
          <IconBox variant={iconBoxSubtleVariant[color]} circle size='lg'>
            <Icon className='size-5.5' />
          </IconBox>
        </div>
      </CardBody>
    </Card>
  )
}
