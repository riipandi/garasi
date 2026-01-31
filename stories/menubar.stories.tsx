import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '~/app/components/button'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuSubmenuPopup,
  MenuTrigger
} from '~/app/components/menu'
import { Menubar } from '~/app/components/menubar'

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
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
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Menubar>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>File</MenuTrigger>
        <MenuPopup size='default'>
          <MenuItem>New File</MenuItem>
          <MenuItem>Open</MenuItem>
          <MenuItem>Save</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
            <MenuSubmenuPopup size='default'>
              <MenuItem>PNG</MenuItem>
              <MenuItem>JPG</MenuItem>
              <MenuItem>PDF</MenuItem>
            </MenuSubmenuPopup>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem>Exit App</MenuItem>
        </MenuPopup>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>Edit</MenuTrigger>
        <MenuPopup size='default'>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuPopup>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>View</MenuTrigger>
        <MenuPopup size='default'>
          <MenuItem>Zoom In</MenuItem>
          <MenuItem>Zoom Out</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Layout</MenuSubmenuTrigger>
            <MenuSubmenuPopup size='default'>
              <MenuItem>Single Page</MenuItem>
              <MenuItem>Two Pages</MenuItem>
              <MenuItem>Continous</MenuItem>
            </MenuSubmenuPopup>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem>Full Screen</MenuItem>
        </MenuPopup>
      </Menu>
    </Menubar>
  )
}

export const Compact: Story = {
  args: {},
  render: () => (
    <Menubar>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>File</MenuTrigger>
        <MenuPopup size='compact'>
          <MenuItem>New File</MenuItem>
          <MenuItem>Open</MenuItem>
          <MenuItem>Save</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Export</MenuSubmenuTrigger>
            <MenuSubmenuPopup size='compact'>
              <MenuItem>PNG</MenuItem>
              <MenuItem>JPG</MenuItem>
              <MenuItem>PDF</MenuItem>
            </MenuSubmenuPopup>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem>Exit App</MenuItem>
        </MenuPopup>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>Edit</MenuTrigger>
        <MenuPopup size='compact'>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuPopup>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button variant='plain' />}>View</MenuTrigger>
        <MenuPopup size='compact'>
          <MenuItem>Zoom In</MenuItem>
          <MenuItem>Zoom Out</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Layout</MenuSubmenuTrigger>
            <MenuSubmenuPopup size='compact'>
              <MenuItem>Single Page</MenuItem>
              <MenuItem>Two Pages</MenuItem>
              <MenuItem>Continous</MenuItem>
            </MenuSubmenuPopup>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem>Full Screen</MenuItem>
        </MenuPopup>
      </Menu>
    </Menubar>
  )
}
