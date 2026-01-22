interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo'
  subtitle: string
}

const colorClasses = {
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500'>{title}</p>
          <p className='mt-2 text-3xl font-bold text-gray-900'>{value}</p>
          <p className='mt-1 text-sm text-gray-500'>{subtitle}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color].split(' ')[0]}`}>
          <Icon className={`size-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  )
}
