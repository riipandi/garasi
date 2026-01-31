import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarFallbackInitial,
  AvatarImage,
  AvatarIndicator
} from '~/app/components/avatar'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
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
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='inline-flex space-x-2'>
      <Avatar>
        <AvatarImage
          src='https://api.dicebear.com/9.x/adventurer-neutral/svg?radius=50&seed=john@example.com'
          alt='John Doe'
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src='https://api.dicebear.com/9.x/adventurer-neutral/svg?radius=50&seed=Jane@example.com'
          alt='Jane Doe'
        />
        <AvatarFallbackInitial name='Jane Doe' />
      </Avatar>
      <Avatar className='bg-blue-500 text-white'>
        <AvatarFallbackInitial name='John Doe' />
      </Avatar>
      <Avatar className='bg-orange-500 text-white'>
        <AvatarFallbackInitial name='Jane' />
      </Avatar>
      <Avatar>
        <AvatarFallbackInitial />
      </Avatar>
      <Avatar>NA</Avatar>
    </div>
  )
}

export const Indicator: Story = {
  args: {},
  render: () => (
    <div className='inline-flex space-x-2'>
      <Avatar size='md'>
        <AvatarImage
          src='https://api.dicebear.com/9.x/adventurer-neutral/svg?radius=50&seed=john@example.com'
          alt='John Doe'
        />
        <AvatarFallback>RF</AvatarFallback>
        <AvatarIndicator
          position='bottom'
          className='outline-background bg-green-500 outline'
          size='sm'
        />
      </Avatar>
      <Avatar size='md'>
        <AvatarImage
          src='https://api.dicebear.com/9.x/adventurer-neutral/svg?radius=50&seed=Jane@example.com'
          alt='Jane Doe'
        />
        <AvatarFallback>NA</AvatarFallback>
        <AvatarIndicator position='top' className='bg-red-500 text-white' size='lg'>
          3
        </AvatarIndicator>
      </Avatar>
      <Avatar size='md' className='bg-blue-500 text-white'>
        <AvatarFallback>JD</AvatarFallback>
        <AvatarIndicator position='bottom' className='bg-green-500 text-white' size='lg'>
          <Lucide.VerifiedIcon />
        </AvatarIndicator>
      </Avatar>
    </div>
  )
}
