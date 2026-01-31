import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from '~/app/components/spinner'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
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
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='flex items-center gap-6'>
      <Spinner className='size-12' />
      <Spinner className='text-success size-12' />
      <Spinner className='text-warning size-12' />
      <Spinner className='text-danger size-12' />
      <Spinner className='text-dimmed size-12' />
      <Spinner className='text-muted size-12' />
    </div>
  )
}
