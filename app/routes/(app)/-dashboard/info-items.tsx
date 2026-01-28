import { CardBody } from '~/app/components/card'
import { Text } from '~/app/components/text'

interface InfoItemProps {
  label: string
  value: string
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <CardBody className='p-3'>
      <Text className='text-dimmed text-xs font-medium uppercase'>{label}</Text>
      <p className='mt-1 text-sm font-semibold'>{value}</p>
    </CardBody>
  )
}
