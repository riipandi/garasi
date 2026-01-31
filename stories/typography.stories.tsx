import type { Meta, StoryObj } from '@storybook/react-vite'
import { Code, Heading, Strong, Text, TextLink } from '~/app/components/typography'

const meta = {
  title: 'Components/Typography',
  component: undefined,
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
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PageHeading: Story = {
  args: {},
  render: () => (
    <div className='flex flex-col gap-4'>
      <Heading level={1} size='xl'>
        This is a large heading
      </Heading>
      <Heading level={2} size='lg'>
        This is a medium heading
      </Heading>
      <Heading level={3} size='md'>
        This is a small heading
      </Heading>
      <Heading level={4} size='sm'>
        This is a small heading
      </Heading>
      <Heading level={5} size='xs'>
        This is a small heading
      </Heading>
    </div>
  )
}

export const Paragraph: Story = {
  args: {},
  render: () => (
    <div className='flex flex-col gap-2'>
      <Text>
        This is a simple text component. You can use it to display text in your application.
      </Text>

      <Text>
        You can also add{' '}
        <TextLink href='https://base-ui.com' target='_blank'>
          links
        </TextLink>{' '}
        to your text.
      </Text>

      <Text>
        You can also make text <Strong>strong</Strong>.
      </Text>

      <Text>
        You can also add <Code>code</Code> to your text.
      </Text>
    </div>
  )
}
