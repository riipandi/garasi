import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '~/app/components/alert-dialog'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
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
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='danger'>Delete File</Button>} />
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            Are you sure you want to delete this file?
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant='danger'>Delete File</Button>} />
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}

export const WithIconHeader: Story = {
  args: {},
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='danger'>Delete</Button>} />
      <AlertDialogPopup>
        <AlertDialogHeader>
          <IconBox variant='danger' size='sm'>
            <Lucide.Trash2Icon />
          </IconBox>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant='danger'>Delete</Button>} />
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
