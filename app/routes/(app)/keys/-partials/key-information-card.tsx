import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'

interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

interface KeyInformationCardProps {
  accessKey: AccessKey
  showSecretKey: boolean
  onToggleSecretKey: () => void
  onCopyAccessKey: () => void
  onCopySecretKey: () => void
  formatDate: (dateString: string | null) => string
  formatExpiration: (expiration: string | null, neverExpires: boolean) => string
  expired: boolean
}

export function KeyInformationCard({
  accessKey,
  showSecretKey,
  onToggleSecretKey,
  onCopyAccessKey,
  onCopySecretKey,
  formatDate,
  formatExpiration,
  expired
}: KeyInformationCardProps) {
  const canCreateBucket = accessKey.permissions?.createBucket ?? false

  return (
    <Card>
      <CardHeader>
        <Lucide.KeyRound className='text-muted size-5' />
        <CardTitle>Key Information</CardTitle>
      </CardHeader>
      <CardBody className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Field>
            <FieldLabel>Access Key ID</FieldLabel>
            <div className='border-input bg-background flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm'>
              <code className='flex-1 truncate font-mono'>{accessKey.accessKeyId}</code>
              <button
                type='button'
                onClick={onCopyAccessKey}
                className='text-muted hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none'
                title='Copy Access Key ID'
              >
                <Lucide.Copy className='size-4' />
              </button>
            </div>
          </Field>

          <Field>
            <FieldLabel>
              <div className='flex items-center gap-2'>
                Secret Key
                <span className='text-orange-600'>
                  <Lucide.AlertTriangle className='inline-block size-3 align-middle' />
                </span>
              </div>
            </FieldLabel>
            {accessKey.secretKeyId || accessKey.secretAccessKey ? (
              <div className='flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 shadow-sm'>
                <code className='min-w-0 flex-1 truncate font-mono'>
                  {showSecretKey
                    ? accessKey.secretAccessKey || accessKey.secretKeyId
                    : '*'.repeat(54)}
                </code>
                <button
                  type='button'
                  onClick={onToggleSecretKey}
                  className='text-muted shrink-0 rounded p-1 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none'
                  title={showSecretKey ? 'Hide Secret Key' : 'Show Secret Key'}
                >
                  {showSecretKey ? (
                    <Lucide.EyeOff className='size-4' />
                  ) : (
                    <Lucide.Eye className='size-4' />
                  )}
                </button>
                <button
                  type='button'
                  onClick={onCopySecretKey}
                  className='text-muted shrink-0 rounded p-1 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none'
                  title='Copy Secret Key'
                >
                  <Lucide.Copy className='size-4' />
                </button>
              </div>
            ) : (
              <div className='text-muted flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm'>
                <span>N/A</span>
              </div>
            )}
          </Field>
        </div>

        <div className='border-input bg-background grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-3'>
          <div className='flex items-center gap-3'>
            <Lucide.Calendar className='text-muted size-4' />
            <div>
              <p className='text-muted text-xs'>Created</p>
              <p className='font-medium'>{formatDate(accessKey.created || null)}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Lucide.Clock className={`size-4 ${expired ? 'text-red-600' : 'text-muted'}`} />
            <div>
              <p className='text-muted text-xs'>Expires</p>
              <p className={`font-medium ${expired ? 'text-red-600' : ''}`}>
                {formatExpiration(accessKey.expiration || null, accessKey.neverExpires || false)}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Lucide.Shield className='text-muted size-4' />
            <div>
              <p className='text-muted text-xs'>Create Bucket</p>
              {canCreateBucket ? (
                <Badge variant='success' className='mt-0.5'>
                  <Lucide.Check className='size-3' />
                  Allowed
                </Badge>
              ) : (
                <Badge variant='secondary' className='mt-0.5'>
                  <Lucide.X className='size-3' />
                  Denied
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
