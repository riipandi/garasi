import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Heading } from '~/app/components/heading'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem
} from '~/app/components/select'
import { Switch } from '~/app/components/switch'
import { Text } from '~/app/components/text'

type SizeUnit = 'MB' | 'GB' | 'TB'

interface BucketConfigurationFormProps {
  websiteAccessEnabled: boolean
  setWebsiteAccessEnabled: (enabled: boolean) => void
  indexDocument: string
  setIndexDocument: (value: string) => void
  errorDocument: string
  setErrorDocument: (value: string) => void
  maxObjects: string
  setMaxObjects: (value: string) => void
  maxSize: string
  setMaxSize: (value: string) => void
  maxSizeUnit: SizeUnit
  setMaxSizeUnit: (unit: SizeUnit) => void
  isPending: boolean
  onSubmit: (e: React.FormEvent) => void
  sizeWarning?: string | null
}

export function BucketConfigurationForm({
  websiteAccessEnabled,
  setWebsiteAccessEnabled,
  indexDocument,
  setIndexDocument,
  errorDocument,
  setErrorDocument,
  maxObjects,
  setMaxObjects,
  maxSize,
  setMaxSize,
  maxSizeUnit,
  setMaxSizeUnit,
  isPending,
  onSubmit,
  sizeWarning
}: BucketConfigurationFormProps) {
  return (
    <div className='border-border bg-background overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-border border-b px-6 py-4'>
        <Heading level={3} size='md'>
          Bucket Configuration
        </Heading>
        <Text className='text-muted-foreground text-sm'>
          Configure website access and storage quotas
        </Text>
      </div>
      <form
        onSubmit={onSubmit}
        className={`space-y-6 px-6 py-4 ${isPending ? 'animate-pulse' : ''}`}
      >
        <div>
          <div className='mb-4 flex items-center gap-3'>
            <IconBox variant='info' size='md'>
              <Lucide.Globe className='size-5' />
            </IconBox>
            <Heading level={4}>Website Access</Heading>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Switch
                id='websiteAccessEnabled'
                checked={websiteAccessEnabled}
                onCheckedChange={setWebsiteAccessEnabled}
              />
              <Label htmlFor='websiteAccessEnabled'>Enable website access for this bucket</Label>
            </div>

            {websiteAccessEnabled && (
              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='indexDocument'>Index Document</Label>
                  <Input
                    id='indexDocument'
                    type='text'
                    value={indexDocument}
                    onChange={(e) => setIndexDocument(e.target.value)}
                    placeholder='index.html'
                  />
                  <Text className='text-muted-foreground mt-1 text-xs'>
                    The document to serve when a directory is requested
                  </Text>
                </div>

                <div>
                  <Label htmlFor='errorDocument'>Error Document</Label>
                  <Input
                    id='errorDocument'
                    type='text'
                    value={errorDocument}
                    onChange={(e) => setErrorDocument(e.target.value)}
                    placeholder='error.html'
                  />
                  <Text className='text-muted-foreground mt-1 text-xs'>
                    The document to serve when an error occurs
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='border-border border-t' />

        <div>
          <div className='mb-4 flex items-center gap-3'>
            <IconBox variant='tertiary' size='md'>
              <Lucide.HardDrive className='size-5' />
            </IconBox>
            <Heading level={4}>Storage Quotas</Heading>
          </div>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='maxObjects'>Max Objects</Label>
              <Input
                id='maxObjects'
                type='text'
                value={maxObjects}
                onChange={(e) => setMaxObjects(e.target.value)}
                placeholder='Unlimited'
              />
              <Text className='text-muted-foreground mt-1 text-xs'>
                Maximum number of objects allowed in this bucket
              </Text>
            </div>

            <div>
              <Label htmlFor='maxSize'>Max Size</Label>
              <div className='flex gap-2'>
                <Input
                  id='maxSize'
                  type='text'
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder='Unlimited'
                  className='flex-1'
                />
                <Select
                  value={maxSizeUnit}
                  onValueChange={(value) => setMaxSizeUnit(value as SizeUnit)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectList>
                      <SelectItem value='MB'>MB</SelectItem>
                      <SelectItem value='GB'>GB</SelectItem>
                      <SelectItem value='TB'>TB</SelectItem>
                    </SelectList>
                  </SelectPopup>
                </Select>
              </div>
              <Text className='text-muted-foreground mt-1 text-xs'>
                Maximum total size of all objects (minimum 100MB)
              </Text>
              {sizeWarning && (
                <Alert variant='warning' className='mt-2'>
                  <div className='flex items-start gap-2'>
                    <Lucide.AlertTriangle className='mt-0.5 size-4 shrink-0' />
                    <Text className='text-xs'>{sizeWarning}</Text>
                  </div>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <div className='border-border flex justify-end border-t pt-4'>
          <Button type='submit' variant='primary' disabled={isPending} progress={isPending}>
            {isPending ? (
              'Saving...'
            ) : (
              <>
                <Lucide.Save className='size-4' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
