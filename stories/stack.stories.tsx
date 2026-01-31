import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback, AvatarImage } from '~/app/components/avatar'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '~/app/components/item'
import { Separator } from '~/app/components/separator'
import { Stack } from '~/app/components/stack'

const meta = {
  title: 'Components/Stack',
  component: Stack,
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
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Stack className='w-full min-w-md xl:w-6/12'>
      <Item variant='plain'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=880'
              alt='Avatar'
            />
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jane Randy</ItemTitle>
          <ItemDescription>jane@example.com</ItemDescription>
        </ItemContent>
      </Item>
      <Separator />
      <Item variant='plain'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=200&fit=crop&crop=top'
              alt='Avatar'
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Andy Daniel</ItemTitle>
          <ItemDescription>andy@example.com</ItemDescription>
        </ItemContent>
      </Item>
      <Separator />
      <Item variant='plain'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&auto=format&fit=crop'
              alt='Avatar'
            />
            <AvatarFallback>MH</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Maggie Hudson</ItemTitle>
          <ItemDescription>maggie@example.com</ItemDescription>
        </ItemContent>
      </Item>
    </Stack>
  )
}

export const DirectionRow: Story = {
  args: {},
  render: () => (
    <Stack direction='row' className='w-full min-w-md items-center justify-center xl:w-6/12'>
      <Item direction='column'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=880'
              alt='Avatar'
            />
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jane Randy</ItemTitle>
          <ItemDescription>jane@example.com</ItemDescription>
        </ItemContent>
      </Item>
      <Item direction='column'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=200&fit=crop&crop=top'
              alt='Avatar'
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Andy Daniel</ItemTitle>
          <ItemDescription>andy@example.com</ItemDescription>
        </ItemContent>
      </Item>
    </Stack>
  )
}
