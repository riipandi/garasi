import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogPopup,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Textarea } from '~/app/components/textarea'

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
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
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open Dialog</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>Please provide your feedback.</DialogDescription>
          <Textarea placeholder='Enter your feedback' className='h-28' />
        </DialogBody>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
          <DialogClose render={<Button>Send Feedback</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

export const WithIconHeader: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open Dialog</Button>} />
      <DialogPopup>
        <DialogHeader>
          <IconBox size='sm'>
            <Lucide.MessageSquareIcon />
          </IconBox>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>Please provide your feedback.</DialogDescription>
          <Textarea placeholder='Enter your feedback' />
        </DialogBody>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
          <DialogClose render={<Button>Send Feedback</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
