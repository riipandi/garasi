import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Lucide from 'lucide-react'
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectGroupLabel
} from '~/app/components/select'

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered'
  },
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
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => {
    const options = [
      { value: 'liverpool', label: 'Liverpool' },
      { value: 'man-city', label: 'Manchester City' },
      { value: 'chelsea', label: 'Chelsea' },
      { value: 'arsenal', label: 'Arsenal' }
    ]

    return (
      <div className='w-full max-w-52'>
        <Select items={options}>
          <SelectTrigger>
            <SelectValue placeholder='Football club' />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {options.map((option) => (
                <SelectItem key={option.value} value={option}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
      </div>
    )
  }
}

export const MultiSelect: Story = {
  args: {},
  render: () => {
    const options = [
      { value: 'liverpool', label: 'Liverpool' },
      { value: 'man-city', label: 'Manchester City' },
      { value: 'chelsea', label: 'Chelsea' },
      { value: 'arsenal', label: 'Arsenal' }
    ]

    return (
      <div className='w-full max-w-52'>
        <Select items={options} multiple>
          <SelectTrigger>
            <SelectValue placeholder='Football club' />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {options.map((option) => (
                <SelectItem key={option.value} value={option}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
      </div>
    )
  }
}

export const GroupItems: Story = {
  args: {},
  render: () => {
    const optionsGrouped = [
      {
        label: 'Premier League',
        options: [
          { value: 'liverpool', label: 'Liverpool' },
          { value: 'man-city', label: 'Manchester City' },
          { value: 'chelsea', label: 'Chelsea' },
          { value: 'arsenal', label: 'Arsenal' }
        ]
      },
      {
        label: 'La Liga',
        options: [
          { value: 'real-madrid', label: 'Real Madrid' },
          { value: 'barcelona', label: 'Barcelona' },
          { value: 'atletico-madrid', label: 'Atletico Madrid' }
        ]
      },
      {
        label: 'Bundesliga',
        options: [
          { value: 'bayern-munich', label: 'Bayern Munich' },
          { value: 'borussia-dortmund', label: 'Borussia Dortmund' },
          { value: 'leverkusen', label: 'Leverkusen' }
        ]
      }
    ]

    return (
      <div className='w-full max-w-64'>
        <Select>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Your favorite football club' />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {optionsGrouped.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectGroupLabel>{group.label}</SelectGroupLabel>
                  {group.options.map((option) => (
                    <SelectItem key={option.value} value={option}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
      </div>
    )
  }
}

export const ItemWithIcon: Story = {
  args: {},
  render: () => {
    const optionsWithIcon = [
      { value: 'reading', label: 'Reading', icon: <Lucide.BookIcon /> },
      { value: 'writing', label: 'Writing', icon: <Lucide.PencilIcon /> },
      { value: 'gaming', label: 'Gaming', icon: <Lucide.Gamepad2Icon /> }
    ]

    return (
      <div className='w-full max-w-52'>
        <Select items={optionsWithIcon}>
          <SelectTrigger>
            <SelectValue placeholder='Your hobby' />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {optionsWithIcon.map((option) => (
                <SelectItem key={option.value} value={option}>
                  {option.icon}
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
      </div>
    )
  }
}

export const DisabledItem: Story = {
  args: {},
  render: () => {
    const options = [
      { value: 'liverpool', label: 'Liverpool' },
      { value: 'man-city', label: 'Manchester City' },
      { value: 'chelsea', label: 'Chelsea' },
      { value: 'arsenal', label: 'Arsenal' },
      { value: 'manchester-united', label: 'Manchester United', disabled: true }
    ]
    return (
      <div className='w-full max-w-52'>
        <Select items={options}>
          <SelectTrigger>
            <SelectValue placeholder='Football club' />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {options.map((option) => (
                <SelectItem key={option.value} value={option} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
      </div>
    )
  }
}
