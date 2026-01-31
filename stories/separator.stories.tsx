import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from '~/app/components/separator'
import { Text } from '~/app/components/typography'

const meta = {
  title: 'Components/Separator',
  component: Separator,
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
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='w-full max-w-sm'>
      <span>This is some text above the separator.</span>
      <Separator orientation='horizontal' className='my-4' />
      <span>This is some text below the separator.</span>
    </div>
  )
}

export const Vertical: Story = {
  args: {},
  render: () => (
    <div className='mx-auto flex w-full max-w-sm items-center justify-center gap-3'>
      <Text>Home</Text>
      <Text>About</Text>
      <Text>Services</Text>
      <Separator orientation='vertical' />
      <Text>Login</Text>
    </div>
  )
}
