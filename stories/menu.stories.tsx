import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import { Kbd } from '~/app/components/kbd'
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuTrigger,
  MenuSeparator,
  MenuSubmenuTrigger,
  MenuSubmenu,
  MenuSubmenuPopup,
  MenuGroup,
  MenuRadioItem,
  MenuRadioGroup,
  MenuGroupLabel
} from '~/app/components/menu'

const meta = {
  title: 'Components/Menu',
  component: Menu,
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
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant='outline' />}>
        Menu <Lucide.ChevronDownIcon />
      </MenuTrigger>
      <MenuPopup>
        <MenuItem>Add to library</MenuItem>
        <MenuItem>Add to queue</MenuItem>
        <MenuSeparator />
        <MenuItem>Play next</MenuItem>
        <MenuItem>Play last</MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export const WithItemIcon: Story = {
  args: {},
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant='outline' />}>
        Menu <Lucide.ChevronDownIcon />
      </MenuTrigger>
      <MenuPopup className='w-48'>
        <MenuItem>
          <Lucide.FolderIcon />
          Upload File
        </MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>
            <Lucide.Layers2Icon />
            Select Project
          </MenuSubmenuTrigger>
          <MenuPopup>
            <MenuItem>Acme Inc.</MenuItem>
            <MenuItem>Widgets Corp.</MenuItem>
            <MenuItem>Demo Project</MenuItem>
            <MenuSeparator />
            <MenuItem>New Project</MenuItem>
          </MenuPopup>
        </MenuSubmenu>
        <MenuItem>
          <Lucide.CameraIcon />
          Screenshot
        </MenuItem>
        <MenuItem>
          <Lucide.VideoIcon />
          Webcam
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export const NestedSubMenu: Story = {
  args: {},
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant='outline' />}>
        Menu <Lucide.ChevronDownIcon />
      </MenuTrigger>
      <MenuPopup>
        <MenuItem>Add to library</MenuItem>
        <MenuSubmenu>
          <MenuSubmenuTrigger>Add to playlist</MenuSubmenuTrigger>
          <MenuSubmenuPopup>
            <MenuItem>Recently added</MenuItem>
            <MenuItem>Recently played</MenuItem>
            <MenuSeparator />
            <MenuSubmenu>
              <MenuSubmenuTrigger>More</MenuSubmenuTrigger>
              <MenuSubmenuPopup>
                <MenuItem>Rock Playlist</MenuItem>
                <MenuItem>Pop Playlist</MenuItem>
                <MenuItem>Country Playlist</MenuItem>
                <MenuItem>Indie Playlist</MenuItem>
              </MenuSubmenuPopup>
            </MenuSubmenu>
          </MenuSubmenuPopup>
        </MenuSubmenu>
        <MenuItem>Add to queue</MenuItem>
        <MenuSeparator />
        <MenuItem>Play next</MenuItem>
        <MenuItem>Play last</MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export const AdvanceMenu: Story = {
  args: {},
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant='outline' />}>
        Menu <Lucide.ChevronDownIcon />
      </MenuTrigger>
      <MenuPopup className='min-w-48'>
        <MenuGroup>
          <MenuGroupLabel>Account</MenuGroupLabel>
          <MenuItem>
            <Lucide.UserIcon />
            Profile
          </MenuItem>
          <MenuItem>
            <Lucide.RocketIcon />
            Upgrade Plan
          </MenuItem>
          <MenuItem>
            <Lucide.Settings2Icon />
            Settings
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Appearances</MenuGroupLabel>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Theme</MenuSubmenuTrigger>
            <MenuPopup>
              <MenuItem>Light</MenuItem>
              <MenuItem>Dark</MenuItem>
              <MenuItem>System</MenuItem>
            </MenuPopup>
          </MenuSubmenu>
          <MenuItem>
            Toggle Sidebar
            <Kbd variant='outline' className='ml-auto rounded-xs text-xs'>
              ⌘ B
            </Kbd>
          </MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Sidebar Position</MenuSubmenuTrigger>
            <MenuPopup>
              <MenuRadioGroup defaultValue='left'>
                <MenuRadioItem value='left'>Left</MenuRadioItem>
                <MenuRadioItem value='right'>Right</MenuRadioItem>
              </MenuRadioGroup>
            </MenuPopup>
          </MenuSubmenu>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem className='text-danger'>
          Quit App
          <Kbd variant='outline' className='ml-auto rounded-xs text-xs'>
            ⌘ Q
          </Kbd>
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export const CompactMenu: Story = {
  args: {},
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant='outline' size='sm' />}>
        Menu <Lucide.ChevronDownIcon />
      </MenuTrigger>
      <MenuPopup size='compact'>
        <MenuItem>
          <Lucide.SunIcon />
          Light
        </MenuItem>
        <MenuItem>
          <Lucide.MoonIcon />
          Dark
        </MenuItem>
        <MenuItem>
          <Lucide.Laptop2Icon />
          System
        </MenuItem>
        <MenuSeparator />
        <MenuSubmenu>
          <MenuSubmenuTrigger>
            <Lucide.PaletteIcon />
            Custom
          </MenuSubmenuTrigger>
          <MenuSubmenuPopup size='compact'>
            <MenuItem>
              <Lucide.PaletteIcon />
              Tokyo Night
            </MenuItem>
            <MenuItem>
              <Lucide.PaletteIcon />
              Dracula
            </MenuItem>
            <MenuItem>
              <Lucide.PaletteIcon />
              Nord
            </MenuItem>
            <MenuItem>
              <Lucide.PaletteIcon />
              Gruvbox
            </MenuItem>
            <MenuItem>
              <Lucide.PaletteIcon />
              Catppuccin
            </MenuItem>
          </MenuSubmenuPopup>
        </MenuSubmenu>
      </MenuPopup>
    </Menu>
  )
}
