import { createFileRoute } from '@tanstack/react-router'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'

export const Route = createFileRoute('/(app)/metrics')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <Stack spacing='lg'>
      <div className='min-w-0 flex-1'>
        <Heading level={1}>Metrics</Heading>
        <Text className='mt-2'>Metrics</Text>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardBody>
          <Text>This is page content</Text>
        </CardBody>
      </Card>
    </Stack>
  )
}
