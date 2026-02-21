import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '~/app/components/card'
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
import { Text } from '~/app/components/typography'
import { clx } from '~/app/utils'

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
    <Card>
      <CardHeader>
        <Lucide.Settings2 className='text-muted size-5' />
        <CardTitle>Bucket Configuration</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardBody className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Switch
                id='websiteAccessEnabled'
                checked={websiteAccessEnabled}
                onCheckedChange={setWebsiteAccessEnabled}
              />
              <Label htmlFor='websiteAccessEnabled'>Enable website access</Label>
            </div>

            <div
              className={clx(`grid gap-4 sm:grid-cols-2`, websiteAccessEnabled ? '' : 'opacity-50')}
            >
              <div className='space-y-2'>
                <Label htmlFor='indexDocument'>Index Document</Label>
                <Input
                  id='indexDocument'
                  type='text'
                  value={indexDocument}
                  onChange={(e) => setIndexDocument(e.target.value)}
                  placeholder='index.html'
                  disabled={!websiteAccessEnabled}
                />
                <Text className='text-muted-foreground text-sm'>
                  The document to serve when a directory is requested
                </Text>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='errorDocument'>Error Document</Label>
                <Input
                  id='errorDocument'
                  type='text'
                  value={errorDocument}
                  onChange={(e) => setErrorDocument(e.target.value)}
                  placeholder='error.html'
                  disabled={!websiteAccessEnabled}
                />
                <Text className='text-muted-foreground text-sm'>
                  The document to serve when an error occurs
                </Text>
              </div>
            </div>
          </div>

          <div className='border-border border-t' />

          <div className='space-y-4'>
            <Label htmlFor='maxObjects'>Max Objects</Label>
            <Input
              id='maxObjects'
              type='text'
              value={maxObjects}
              onChange={(e) => setMaxObjects(e.target.value)}
              placeholder='Unlimited'
            />
            <Text className='text-muted-foreground text-sm'>
              Maximum number of objects allowed in this bucket
            </Text>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='maxSize'>Max Size</Label>
            <div className='flex gap-4'>
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
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup className='w-24'>
                  <SelectList>
                    <SelectItem value='MB'>MB</SelectItem>
                    <SelectItem value='GB'>GB</SelectItem>
                    <SelectItem value='TB'>TB</SelectItem>
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
            <Text className='text-muted-foreground text-sm'>
              Maximum total size of all objects (minimum 100MB)
            </Text>
            {sizeWarning && (
              <Alert variant='warning' className='mt-2'>
                <div className='flex items-start gap-2'>
                  <Lucide.AlertTriangle className='mt-0.5 size-4 shrink-0' />
                  <Text className='text-sm'>{sizeWarning}</Text>
                </div>
              </Alert>
            )}
          </div>
        </CardBody>
        <CardFooter>
          <Button type='submit' disabled={isPending} progress={isPending}>
            <Lucide.Save className='size-4' />
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
