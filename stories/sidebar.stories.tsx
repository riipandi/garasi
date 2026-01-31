import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/app/components/avatar'
import { Menu, MenuPopup, MenuItem, MenuTrigger } from '~/app/components/menu'
import {
  Sidebar,
  SidebarCollapsible,
  SidebarCollapsiblePanel,
  SidebarCollapsibleTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupTitle,
  SidebarHeader,
  SidebarItem,
  SidebarItemButton,
  SidebarList,
  SidebarLogo,
  SidebarMenu,
  SidebarSubmenu
} from '~/app/components/sidebar'

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
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
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <Sidebar className='lg:w-72'>
      <SidebarHeader>
        <SidebarLogo>
          <img src='https://selia.earth/selia.png' alt='Selia' className='size-6' />
          <span className='font-semibold'>Selia</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle>Navigation</SidebarGroupTitle>
            <SidebarGroupAction>
              <button>
                <Lucide.PlusIcon />
              </button>
            </SidebarGroupAction>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton active>
                  <Lucide.HomeIcon />
                  Dashboard
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>
                  <Lucide.ShoppingBagIcon />
                  Products
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>
                  <Lucide.TagsIcon />
                  Categories
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarCollapsible>
                  <SidebarCollapsibleTrigger
                    render={
                      <SidebarItemButton>
                        <Lucide.ChartAreaIcon />
                        Reports
                      </SidebarItemButton>
                    }
                  />
                  <SidebarCollapsiblePanel>
                    <SidebarSubmenu>
                      <SidebarList>
                        <SidebarItem>
                          <SidebarItemButton>Sales</SidebarItemButton>
                        </SidebarItem>
                        <SidebarItem>
                          <SidebarItemButton>Traffic</SidebarItemButton>
                        </SidebarItem>
                        <SidebarItem>
                          <SidebarItemButton>Conversion</SidebarItemButton>
                        </SidebarItem>
                      </SidebarList>
                    </SidebarSubmenu>
                  </SidebarCollapsiblePanel>
                </SidebarCollapsible>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupTitle>Settings</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>
                  <Lucide.SettingsIcon />
                  Settings
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>
                  <Lucide.UserIcon />
                  Profile
                </SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarList>
            <SidebarItem>
              <Menu>
                <MenuTrigger
                  data-slot='sidebar-item-button'
                  render={
                    <SidebarItemButton>
                      <Avatar size='sm'>
                        <AvatarImage
                          src='https://pbs.twimg.com/profile_images/1881314507865411584/aXlN8o5e_400x400.jpg'
                          alt='Avatar'
                        />
                        <AvatarFallback>RF</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>Rizal Fakhri</span>
                        <span className='text-muted text-sm'>rizal@yayan.com</span>
                      </div>
                      <Lucide.ChevronsUpDownIcon className='ml-auto' />
                    </SidebarItemButton>
                  }
                />
                <MenuPopup className='w-(--anchor-width)' side='top'>
                  <MenuItem>
                    <Lucide.UserIcon />
                    Profile
                  </MenuItem>
                  <MenuItem>
                    <Lucide.SettingsIcon />
                    Settings
                  </MenuItem>
                  <MenuItem>
                    <Lucide.LogOutIcon />
                    Logout
                  </MenuItem>
                </MenuPopup>
              </Menu>
            </SidebarItem>
          </SidebarList>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export const Compact: Story = {
  args: {},
  render: () => (
    <Sidebar className='border-border rounded-2xl border lg:w-72' size='compact'>
      <SidebarHeader>
        <SidebarLogo>
          <img src='https://selia.earth/selia.png' alt='Selia' className='size-6' />
          <span className='font-semibold'>Selia</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle>Prologue</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton active>Introduction</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Installation</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Customization</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Upgrade Guide</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupTitle>Components</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>Button</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Card</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Input</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Select</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Table</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Tabs</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export const Loose: Story = {
  args: {},
  render: () => (
    <Sidebar className='border-border rounded-2xl border lg:w-72' size='loose'>
      <SidebarHeader>
        <SidebarLogo>
          <img src='https://selia.earth/selia.png' alt='Selia' className='size-6' />
          <span className='font-semibold'>Selia</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle>Prologue</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>Introduction</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Installation</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Customization</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Upgrade Guide</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupTitle>Components</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>Button</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Card</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Input</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Select</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Table</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Tabs</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export const Background: Story = {
  args: {},
  render: () => (
    <Sidebar className='border-border shadow-card bg-card rounded-2xl border lg:w-72'>
      <SidebarHeader>
        <SidebarLogo>
          <img src='https://selia.earth/selia.png' alt='Selia' className='size-6' />
          <span className='font-semibold'>Selia</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle>Prologue</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>Introduction</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Installation</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Customization</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Upgrade Guide</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupTitle>Components</SidebarGroupTitle>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>Button</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Card</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Input</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Select</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton active>Sidebar</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Table</SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton>Tabs</SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
