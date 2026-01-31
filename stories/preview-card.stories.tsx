import type { Meta, StoryObj } from '@storybook/react-vite'
import { PreviewCard, PreviewCardPopup, PreviewCardTrigger } from '~/app/components/preview-card'
import { Text } from '~/app/components/typography'

const meta = {
  title: 'Components/PreviewCard',
  component: PreviewCard,
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
} satisfies Meta<typeof PreviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  args: {},
  render: () => (
    <PreviewCard>
      <Text className='w-full xl:w-8/12'>
        Liverpool Football Club is a professional{' '}
        <PreviewCardTrigger className='text-primary border-primary cursor-help border-b'>
          football club
        </PreviewCardTrigger>{' '}
        based in Liverpool, England.
      </Text>
      <PreviewCardPopup className='max-w-72'>
        <img
          src='https://images.unsplash.com/photo-1731931594172-2e96a6a9acbf?q=80&w=500'
          className='mb-2 h-auto w-full rounded-sm'
        />
        <Text className='text-base/relaxed'>
          In association football, a football club is a sports club that acts as an entity through
          which association football teams organise their sporting activities. The club can exist
          either as an independent unit or as part of a larger sports organization as a subsidiary
          of the parent club or organization.
        </Text>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
