import { createFileRoute } from '@tanstack/react-router'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'

export const Route = createFileRoute('/(app)/metrics')({
  component: RouteComponent,
  staticData: { breadcrumb: 'Metrics' }
})

function RouteComponent() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Metrics
        </Heading>
        <Text className='text-muted'>This is metrics page</Text>
      </div>

      <div className='flex flex-wrap gap-2.5'>
        <Text>This should be a content</Text>
      </div>
    </div>
  )
}
