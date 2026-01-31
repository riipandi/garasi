// FIXME: Toast not showing

import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { anchoredToast, toast, Toast } from '~/app/components/toast'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  argTypes: {},
  tags: [], // ['autodocs']
  args: {},
  decorators: [
    (Story) => (
      <div className='flex w-full min-w-md items-center justify-center'>
        <Story />
        <Toast />
      </div>
    )
  ]
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [copied, setCopied] = React.useState(false)

    return (
      <div className='flex items-center space-x-3'>
        <Button
          variant='tertiary'
          onClick={() =>
            toast.add({
              title: 'Added to cart',
              description: 'Item has been added to your cart',
              type: 'success',
              actionProps: {
                children: 'View Cart',
                onClick: () => {
                  console.log('View Cart')
                }
              }
            })
          }
        >
          Add to cart
        </Button>

        <Button
          ref={buttonRef}
          variant='secondary'
          onClick={() => {
            setCopied(true)
            anchoredToast.add({
              description: 'Copied',
              positionerProps: {
                anchor: buttonRef.current,
                sideOffset: 8
              },
              data: { size: 'sm' },
              onClose() {
                setCopied(false)
              },
              timeout: 1500
            })
          }}
          disabled={copied}
        >
          Copy Link
        </Button>
      </div>
    )
  }
}

export const VartiantShowcase: Story = {
  args: {},
  render: () => {
    return (
      <div className='flex items-center space-x-3'>
        <Button
          variant='outline'
          onClick={() =>
            toast.add({
              title: 'Default Toast',
              description: 'This is a default toast'
            })
          }
        >
          Default
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.add({
              title: 'Info Toast',
              description: 'This is a info toast',
              type: 'info'
            })
          }
        >
          Info
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.add({
              title: 'Success Toast',
              description: 'This is a success toast',
              type: 'success'
            })
          }
        >
          Success
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.add({
              title: 'Warning Toast',
              description: 'This is a warning toast',
              type: 'warning'
            })
          }
        >
          Warning
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.add({
              title: 'Error Toast',
              description: 'This is a error toast',
              type: 'error'
            })
          }
        >
          Error
        </Button>
      </div>
    )
  }
}

export const WithPromise: Story = {
  args: {},
  render: () => {
    return (
      <div className='flex items-center space-x-3'>
        <Button
          variant='primary'
          onClick={() => {
            toast.promise(
              new Promise<string>((_, reject) => {
                setTimeout(() => {
                  reject(new Error('Failed to add item to cart'))
                }, 2000)
              }),
              {
                loading: 'Adding to cart...',
                success: () => ({
                  title: 'Item Added',
                  description: 'Item has been added to your cart',
                  actionProps: {
                    children: 'View Cart',
                    onClick: () => {
                      console.log('View Cart')
                    }
                  }
                }),
                error: () => ({
                  title: 'Error',
                  description: 'Failed to add item to cart'
                })
              }
            )
          }}
        >
          Add to cart
        </Button>
      </div>
    )
  }
}
