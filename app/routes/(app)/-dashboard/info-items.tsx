interface InfoItemProps {
  label: string
  value: string
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className='text-xs font-medium text-gray-500 uppercase'>{label}</p>
      <p className='mt-1 text-sm font-medium text-gray-900'>{value}</p>
    </div>
  )
}
