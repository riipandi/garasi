import type { Meta, StoryObj } from '@storybook/react-vite'
import { Item, ItemAction, ItemContent, ItemDescription, ItemTitle } from '~/app/components/item'
import { Label } from '~/app/components/label'
import { Radio, RadioGroup, RadioGroupLabel } from '~/app/components/radio'

const meta = {
  title: 'Components/Radio',
  component: Radio,
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
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: { value: null },
  render: () => (
    <RadioGroup defaultValue='pink-floyd' aria-labelledby='radio-example'>
      <RadioGroupLabel id='radio-example'>Select your favorite band</RadioGroupLabel>
      <Label>
        <Radio value='pink-floyd' />
        Pink Floyd
      </Label>
      <Label>
        <Radio value='the-beatles' />
        The Beatles
      </Label>
      <Label>
        <Radio value='led-zeppelin' />
        Led Zeppelin
      </Label>
    </RadioGroup>
  )
}

export const WithItem: Story = {
  args: { value: null },
  render: () => (
    <RadioGroup className='w-full gap-4'>
      <Item render={<Label />}>
        <ItemContent className='px-1'>
          <ItemTitle>Standard Plan</ItemTitle>
          <ItemDescription>You will get 1000 credits per month</ItemDescription>
        </ItemContent>
        <ItemAction className='p-2'>
          <Radio value='standard' />
        </ItemAction>
      </Item>
      <Item render={<Label />}>
        <ItemContent className='px-1'>
          <ItemTitle>Premium Plan</ItemTitle>
          <ItemDescription>You will get 10000 credits per month</ItemDescription>
        </ItemContent>
        <ItemAction className='p-2'>
          <Radio value='premium' />
        </ItemAction>
      </Item>
    </RadioGroup>
  )
}
