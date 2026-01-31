import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '~/app/components/alert'
import { Button } from '~/app/components/button'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'centered' },
  argTypes: {},
  tags: [], // ['autodocs']
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  render: () => (
    <div className='w-full space-y-4'>
      <Alert>
        <Lucide.InfoIcon />
        Some neutral message here.
      </Alert>
      <Alert variant='success'>
        <Lucide.InfoIcon />
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    </div>
  )
}

export const VariantShowcase: Story = {
  render: () => (
    <div className='w-full space-y-4'>
      <Alert>
        <Lucide.InfoIcon />
        Some neutral message here.
      </Alert>
      <Alert variant='tertiary'>
        <Lucide.InfoIcon />
        Some neutral message here.
      </Alert>
      <Alert variant='danger'>
        <Lucide.XCircleIcon />
        Payment failed. Check your card details.
      </Alert>
      <Alert variant='info'>
        <Lucide.InfoIcon />
        Some useful information here.
      </Alert>
      <Alert variant='success'>
        <Lucide.CheckCircle2Icon />
        Your changes have been saved successfully.
      </Alert>
      <Alert variant='warning'>
        <Lucide.TriangleAlertIcon />
        Some features may not work.
      </Alert>
    </div>
  )
}

export const WithDescription: Story = {
  render: () => (
    <div className='w-full space-y-4'>
      <Alert>
        <Lucide.InfoIcon />
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    </div>
  )
}

export const WithActionButton: Story = {
  render: () => (
    <div className='w-full space-y-4'>
      <Alert>
        <Lucide.InfoIcon />
        Message deleted successfully.
        <AlertAction>
          <Button variant='tertiary' size='xs'>
            Undo
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}
