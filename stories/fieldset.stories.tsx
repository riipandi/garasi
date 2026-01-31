import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, CheckboxGroup } from '~/app/components/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel, FieldItem } from '~/app/components/field'
import { Fieldset, FieldsetLegend } from '~/app/components/fieldset'
import { Input } from '~/app/components/input'
import { Radio, RadioGroup } from '~/app/components/radio'
import { Separator } from '~/app/components/separator'
import { Text } from '~/app/components/typography'

const meta = {
  title: 'Components/Fieldset',
  component: Fieldset,
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
} satisfies Meta<typeof Fieldset>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='xl:w-10/12 2xl:w-8/12'>
      <Fieldset>
        <FieldsetLegend>Personal Information</FieldsetLegend>
        <Text>
          This information will be used to create your account. You can always change this
          information later.
        </Text>
        <Field>
          <FieldLabel htmlFor='name1'>Name</FieldLabel>
          <Input id='name1' placeholder='Enter your name' required />
          <FieldError match='valueMissing'>This is required</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor='email1'>Email</FieldLabel>
          <Input id='email1' placeholder='Enter your email' required />
          <FieldError match='valueMissing'>This is required</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor='password1'>Password</FieldLabel>
          <Input id='password1' type='password' placeholder='Enter your password' required />
          <FieldError match='valueMissing'>This is required</FieldError>
          <FieldDescription>Password must be at least 8 characters long.</FieldDescription>
        </Field>
      </Fieldset>
    </div>
  )
}

export const Complex: Story = {
  args: {},
  render: () => (
    <div className='flex max-w-md flex-col gap-6 py-8 xl:w-10/12 2xl:w-8/12'>
      <Fieldset>
        <FieldsetLegend>Personal Information</FieldsetLegend>
        <Text>
          We need your name and email to create your account. <br />
          You can always change this information later.
        </Text>
        <Field>
          <FieldLabel htmlFor='name'>Name</FieldLabel>
          <Input id='name' placeholder='Enter your name' required />
          <FieldError match='valueMissing'>This is required</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor='email'>Email</FieldLabel>
          <Input id='email' placeholder='Enter your email' required />
          <FieldError match='valueMissing'>This is required</FieldError>
        </Field>
      </Fieldset>
      <Separator />
      <Fieldset>
        <FieldsetLegend>Security</FieldsetLegend>
        <Text>Set up your security preferences to protect your account.</Text>
        <Field>
          <FieldLabel htmlFor='password'>Password</FieldLabel>
          <Input id='password' type='password' placeholder='Enter your password' required />
          <FieldError match='valueMissing'>This is required</FieldError>
          <FieldDescription>Password must be at least 8 characters long.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor='confirm-password'>Confirm Password</FieldLabel>
          <Input
            id='confirm-password'
            type='password'
            placeholder='Confirm your password'
            required
          />
          <FieldError match='valueMissing'>This is required</FieldError>
          <FieldError match='valueMissing'>Passwords do not match</FieldError>
        </Field>
      </Fieldset>
      <Separator />
      <Field>
        <Fieldset render={<CheckboxGroup defaultValue={['email']} />}>
          <FieldsetLegend>Notifications</FieldsetLegend>
          <Text>
            We'll send you notifications about your account and important updates. Choose the ones
            you want to receive.
          </Text>
          <FieldItem>
            <Checkbox name='notifications' id='notifications-email' value='email' />
            <FieldLabel htmlFor='notifications-email'>Email</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Checkbox name='notifications' id='sms' value='sms' />
            <FieldLabel htmlFor='sms'>SMS</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Checkbox name='notifications' id='push' value='push' />
            <FieldLabel htmlFor='push'>Push</FieldLabel>
          </FieldItem>
        </Fieldset>
      </Field>
      <Separator />
      <Field>
        <Fieldset render={<RadioGroup defaultValue='system' />}>
          <FieldsetLegend>Theme</FieldsetLegend>
          <Text>Choose your preferred theme for the interface.</Text>
          <FieldItem>
            <Radio id='theme-light' value='light' />
            <FieldLabel htmlFor='theme-light'>Light</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Radio id='theme-dark' value='dark' />
            <FieldLabel htmlFor='theme-dark'>Dark</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Radio id='theme-system' value='system' />
            <FieldLabel htmlFor='theme-system'>System</FieldLabel>
            <FieldDescription>System theme will use the system default theme.</FieldDescription>
          </FieldItem>
          <FieldError match='valueMissing'>This is required</FieldError>
        </Fieldset>
      </Field>
    </div>
  )
}
