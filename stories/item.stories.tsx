import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/app/components/avatar'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemMeta,
  ItemTitle
} from '~/app/components/item'
import { Separator } from '~/app/components/separator'
import { Stack } from '~/app/components/stack'

const meta = {
  title: 'Components/Item',
  component: Item,
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
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <div className='flex w-full min-w-md flex-col gap-4'>
      <Item className='items-center rounded-full'>
        <ItemMedia>
          <img
            src='https://cdn.svglogos.dev/logos/claude-icon.svg'
            alt='Avatar'
            className='size-11 rounded'
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Claude</ItemTitle>
          <ItemDescription>AI chatbot</ItemDescription>
        </ItemContent>
        <ItemAction>
          <Button size='sm' pill>
            Install
          </Button>
        </ItemAction>
      </Item>
      <Item variant='plain'>
        <ItemMedia>
          <IconBox>
            <Lucide.Code2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Plain</ItemTitle>
          <ItemDescription>You can put this item in a list.</ItemDescription>
        </ItemContent>
        <ItemAction>
          <Button size='sm' variant='secondary' pill>
            Action
          </Button>
        </ItemAction>
      </Item>
    </div>
  )
}

export const VariantShowcase: Story = {
  args: {},
  render: () => (
    <div className='flex w-full flex-col gap-4 xl:w-8/12'>
      <Item>
        <ItemMedia>
          <IconBox>
            <Lucide.Code2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Regular</ItemTitle>
          <ItemDescription>Just a simple item with an icon.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='primary'>
        <ItemMedia>
          <IconBox variant='primary'>
            <Lucide.SettingsIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Setting</ItemTitle>
          <ItemDescription>You can change the settings of the app.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='info'>
        <ItemMedia>
          <IconBox variant='info'>
            <Lucide.InfoIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Information</ItemTitle>
          <ItemDescription>This item is good.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='success'>
        <ItemMedia>
          <IconBox variant='success'>
            <Lucide.CheckCircle2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Success</ItemTitle>
          <ItemDescription>This item is working as expected.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='warning'>
        <ItemMedia>
          <IconBox variant='warning'>
            <Lucide.TriangleAlertIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Warning</ItemTitle>
          <ItemDescription>This item is not working as expected.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='danger'>
        <ItemMedia>
          <IconBox variant='danger'>
            <Lucide.Trash2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Danger</ItemTitle>
          <ItemDescription>This item is dangerous.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export const OutlineVariants: Story = {
  args: {},
  render: () => (
    <div className='flex w-full flex-col gap-4 xl:w-8/12'>
      <Item variant='outline'>
        <ItemMedia>
          <IconBox>
            <Lucide.SettingsIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Regular</ItemTitle>
          <ItemDescription>Just a simple item with an icon.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='primary-outline'>
        <ItemMedia>
          <IconBox variant='primary'>
            <Lucide.SettingsIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Setting</ItemTitle>
          <ItemDescription>You can change the settings of the app.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='info-outline'>
        <ItemMedia>
          <IconBox variant='info'>
            <Lucide.InfoIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Information</ItemTitle>
          <ItemDescription>This item is good.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='success-outline'>
        <ItemMedia>
          <IconBox variant='success'>
            <Lucide.CheckCircle2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Success</ItemTitle>
          <ItemDescription>This item is working as expected.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='warning-outline'>
        <ItemMedia>
          <IconBox variant='warning'>
            <Lucide.TriangleAlertIcon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Warning</ItemTitle>
          <ItemDescription>This item is not working as expected.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant='danger-outline'>
        <ItemMedia>
          <IconBox variant='danger'>
            <Lucide.Trash2Icon />
          </IconBox>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Danger</ItemTitle>
          <ItemDescription>This item is dangerous.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export const WithItemMeta: Story = {
  args: {},
  render: () => (
    <div className='flex w-full flex-col gap-4 xl:w-8/12'>
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=200&fit=crop&crop=top'
              alt='Avatar'
            />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Joseph Cooper</ItemTitle>
          <ItemMeta className='mb-2.5'>5 minutes ago</ItemMeta>
          <ItemDescription>Don't let me leave, Murph!</ItemDescription>
          <div className='-mx-2 mt-2.5'>
            <Button size='xs' variant='plain' pill>
              Reply
            </Button>
          </div>
        </ItemContent>
        <ItemAction>
          <Button size='xs-icon' variant='plain' pill>
            <Lucide.HeartIcon />
          </Button>
        </ItemAction>
      </Item>
    </div>
  )
}

export const ItemStack: Story = {
  args: {},
  render: () => (
    <Stack className='w-full xl:w-8/12'>
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
        <ItemAction>
          <Button variant='tertiary' size='xs'>
            Follow
          </Button>
        </ItemAction>
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
        <ItemAction>
          <Button variant='tertiary' size='xs'>
            Follow
          </Button>
        </ItemAction>
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
        <ItemAction>
          <Button variant='tertiary' size='xs'>
            Follow
          </Button>
        </ItemAction>
      </Item>
      <Separator />
      <Item variant='plain'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&h=200&auto=format&fit=crop'
              alt='Avatar'
            />
            <AvatarFallback>Olivia Nam</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Olivia Nam</ItemTitle>
          <ItemDescription>olivia@example.com</ItemDescription>
        </ItemContent>
        <ItemAction>
          <Button variant='tertiary' size='xs'>
            Follow
          </Button>
        </ItemAction>
      </Item>
      <Separator />
      <Item variant='plain'>
        <ItemMedia>
          <Avatar>
            <AvatarImage
              src='https://images.unsplash.com/photo-1522556189639-b150ed9c4330?q=80&w=200&h=200&auto=format&fit=crop&crop=top'
              alt='Avatar'
            />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Edward Cook</ItemTitle>
          <ItemDescription>edward@example.com</ItemDescription>
        </ItemContent>
        <ItemAction>
          <Button variant='tertiary' size='xs'>
            Follow
          </Button>
        </ItemAction>
      </Item>
    </Stack>
  )
}
