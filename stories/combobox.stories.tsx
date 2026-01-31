import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import {
  Combobox,
  ComboboxPopup,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSearch,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxInput,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxCollection
} from '~/app/components/combobox'

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
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
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { value: 'software-engineering', label: 'Software Engineering' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'network-engineering', label: 'Network Engineering' },
  { value: 'database-management', label: 'Database Management' }
]

export const Example: Story = {
  args: {},
  render: () => {
    return (
      <Combobox items={options} defaultValue={options[0]}>
        <ComboboxTrigger className='w-64'>
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxPopup>
          <ComboboxSearch />
          <ComboboxEmpty>No results found</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    )
  }
}

// FIXME: variant not working
export const VariantShowcase: Story = {
  args: {},
  render: () => {
    return (
      <div className='flex flex-col gap-3'>
        <Combobox items={options} defaultValue={options[0]}>
          <ComboboxTrigger className='w-64' variant='default'>
            <ComboboxValue />
          </ComboboxTrigger>
          <ComboboxPopup>
            <ComboboxSearch />
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>

        <Combobox items={options} defaultValue={options[0]}>
          <ComboboxTrigger className='w-64' variant='subtle'>
            <ComboboxValue />
          </ComboboxTrigger>
          <ComboboxPopup>
            <ComboboxSearch />
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>

        <Combobox items={options} defaultValue={options[0]}>
          <ComboboxTrigger className='w-64' pill>
            <ComboboxValue />
          </ComboboxTrigger>
          <ComboboxPopup>
            <ComboboxSearch />
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>

        <Combobox items={options} defaultValue={options[0]}>
          <ComboboxTrigger className='w-64' variant='plain'>
            <ComboboxValue />
          </ComboboxTrigger>
          <ComboboxPopup>
            <ComboboxSearch />
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>
      </div>
    )
  }
}

export const MultipleSelect: Story = {
  args: {},
  render: () => {
    const anchorRef = React.useRef<HTMLDivElement | null>(null)

    return (
      <div className='w-full max-w-xs'>
        <Combobox items={options} multiple>
          <ComboboxInput placeholder='Select languages' className='w-full' ref={anchorRef} />
          <ComboboxPopup anchor={anchorRef}>
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>
      </div>
    )
  }
}

export const GroupedItem: Story = {
  args: {},
  render: () => {
    const items = [
      {
        label: 'Rock',
        items: [
          { label: 'Pink Floyd', value: 'pink-floyd' },
          { label: 'Led Zeppelin', value: 'led-zeppelin' },
          { label: 'The Beatles', value: 'the-beatles' }
        ]
      },
      {
        label: 'Metal',
        items: [
          { label: 'Lamb of God', value: 'lamb-of-god' },
          { label: 'Architects', value: 'architects' }
        ]
      }
    ]

    return (
      <Combobox items={items}>
        <ComboboxTrigger className='w-64'>
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxPopup>
          <ComboboxSearch placeholder='Search models...' />
          <ComboboxEmpty>No results found</ComboboxEmpty>
          <ComboboxList>
            {(group) => (
              <ComboboxGroup items={group.items} key={group.label}>
                <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    )
  }
}
