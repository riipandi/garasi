interface InfoItemProps {
  label: string
  value: string
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-3'>
      <p className='text-xs font-medium text-gray-500 uppercase'>{label}</p>
      <p className='mt-1 text-sm font-semibold text-gray-900'>{value}</p>
    </div>
  )
}
