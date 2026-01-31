import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { Checkbox, CheckboxGroup, CheckboxGroupLabel } from '~/app/components/checkbox'
import { Label } from '~/app/components/label'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
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
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Label>
      <Checkbox />
      <span>I agree that Liverpool is the best football club in the world.</span>
    </Label>
  )
}

export const Grouped: Story = {
  args: {},
  render: () => (
    <div>
      <CheckboxGroup defaultValue={['email', 'sms']} aria-labelledby='notifications-label'>
        <CheckboxGroupLabel id='notifications-label'>Notifications</CheckboxGroupLabel>
        <Label>
          <Checkbox value='email' />
          Email
        </Label>
        <Label>
          <Checkbox value='sms' />
          SMS
        </Label>
        <Label>
          <Checkbox value='push' />
          Push
        </Label>
      </CheckboxGroup>
    </div>
  )
}
export const GroupNested: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState<string[]>([])

    const permissions = [
      { label: 'Read', value: 'read' },
      { label: 'Write', value: 'write' },
      { label: 'Execute', value: 'execute' }
    ]

    return (
      <CheckboxGroup
        value={value}
        onValueChange={setValue}
        aria-labelledby='permissions-label'
        allValues={permissions.map((p) => p.value)}
      >
        <CheckboxGroupLabel id='permissions-label'>Permissions</CheckboxGroupLabel>
        <Label>
          <Checkbox parent name='user-permissions' />
          User Permissions
        </Label>
        {permissions.map((permission) => (
          <Label key={permission.value} className='pl-4'>
            <Checkbox value={permission.value} />
            {permission.label}
          </Label>
        ))}
      </CheckboxGroup>
    )
  }
}
