import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldLabel, FieldError } from '~/app/components/field'
import { Fieldset, FieldsetLegend } from '~/app/components/fieldset'
import { Form } from '~/app/components/form'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Radio, RadioGroup } from '~/app/components/radio'
import { Spinner } from '~/app/components/spinner'
import type { CreateAccessKeyRequest } from '~/shared/schemas/keys.schema'

interface KeyCreateProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateAccessKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const createKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Name must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Name cannot contain spaces'),
  expirationPreset: z.enum(['1d', '7d', '30d', '90d', 'never', 'custom']).default('7d'),
  expiration: z.string().nullable().optional(),
  allowCreateBucket: z.boolean().default(false)
})

type ExpirationPreset = '1d' | '7d' | '30d' | '90d' | 'never' | 'custom'

const EXPIRATION_PRESETS: {
  value: ExpirationPreset
  label: string
  days?: number
}[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '90d', label: '90 Days', days: 90 },
  { value: 'never', label: 'Never Expires' },
  { value: 'custom', label: 'Custom Date' }
]

function calculateExpirationDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 16)
}

export function KeyCreate({ isOpen, onClose, onSubmit, isSubmitting }: KeyCreateProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      expirationPreset: '7d' as ExpirationPreset,
      expiration: '',
      allowCreateBucket: false
    },
    onSubmit: async ({ value }) => {
      const result = createKeySchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      const neverExpires = value.expirationPreset === 'never'
      const submitValue = {
        name: value.name,
        neverExpires,
        expiration: neverExpires ? null : value.expiration || null,
        allow: value.allowCreateBucket ? { createBucket: true } : null,
        deny: value.allowCreateBucket ? null : { createBucket: true }
      }

      await onSubmit(submitValue)
    }
  })

  const handlePresetChange = (preset: ExpirationPreset) => {
    form.setFieldValue('expirationPreset', preset)

    if (preset !== 'custom' && preset !== 'never') {
      const presetConfig = EXPIRATION_PRESETS.find((p) => p.value === preset)
      if (presetConfig?.days) {
        const expirationDate = calculateExpirationDate(presetConfig.days)
        form.setFieldValue('expiration', expirationDate)
      }
    } else if (preset === 'never') {
      form.setFieldValue('expiration', '')
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPopup className='w-sm'>
          <DialogHeader>
            <IconBox variant='primary' size='sm'>
              <Lucide.KeyRound className='size-4' />
            </IconBox>
            <DialogTitle>Create New Access Key</DialogTitle>

            <DialogClose className='ml-auto'>
              <Lucide.XIcon className='size-4' strokeWidth={2.0} />
            </DialogClose>
          </DialogHeader>
          <DialogBody className='space-y-4 pt-2'>
            <DialogDescription>Create a new access key for bucket access.</DialogDescription>

            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  const result = createKeySchema.shape.name.safeParse(value)
                  if (!result.success) {
                    const firstError = result.error.issues[0]
                    return firstError ? firstError.message : undefined
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Field className='mt-4'>
                  <FieldLabel htmlFor='name'>Name</FieldLabel>
                  <Input
                    id='name'
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                    placeholder='e.g., production-api-key'
                    disabled={isSubmitting}
                  />
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                </Field>
              )}
            </form.Field>

            <form.Field name='expirationPreset'>
              {(field) => (
                <Field>
                  <FieldLabel>Expiration</FieldLabel>
                  <RadioGroup
                    className='gap-2'
                    value={field.state.value}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement
                      handlePresetChange(target.value as ExpirationPreset)
                    }}
                    disabled={isSubmitting}
                  >
                    {/* Top row: 7d, 30d, 90d */}
                    <div className='grid grid-cols-3 gap-2'>
                      {EXPIRATION_PRESETS.slice(0, 3).map((preset) => (
                        <Label
                          key={preset.value}
                          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-center transition-all ${
                            field.state.value === preset.value
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input-border bg-input hover:border-primary/50'
                          } `}
                        >
                          <Radio value={preset.value} className='sr-only' />
                          <span className='text-xs font-medium'>{preset.label}</span>
                        </Label>
                      ))}
                    </div>
                    {/* Bottom row: never, custom */}
                    <div className='grid grid-cols-2 gap-2'>
                      {EXPIRATION_PRESETS.slice(3).map((preset) => (
                        <Label
                          key={preset.value}
                          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-center transition-all ${
                            field.state.value === preset.value
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input-border bg-input hover:border-primary/50'
                          } `}
                        >
                          <Radio value={preset.value} className='sr-only' />
                          <span className='text-xs font-medium'>{preset.label}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.expirationPreset}>
              {(expirationPreset) => (
                <form.Field
                  name='expiration'
                  validators={{
                    onChange: ({ value }) => {
                      if (expirationPreset === 'custom') {
                        if (!value || value.trim() === '') {
                          return 'Expiration Date is required'
                        }
                      } else if (expirationPreset !== 'never') {
                        if (!value || value.trim() === '') {
                          return 'Expiration Date is required'
                        }
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field className={expirationPreset !== 'custom' ? 'hidden' : ''}>
                      <FieldLabel htmlFor='expiration'>Custom Expiration Date</FieldLabel>
                      <Input
                        id='expiration'
                        type='datetime-local'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                          form.setFieldValue('expirationPreset', 'custom')
                        }}
                        disabled={isSubmitting || expirationPreset === 'never'}
                      />
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    </Field>
                  )}
                </form.Field>
              )}
            </form.Subscribe>

            <form.Field name='allowCreateBucket'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='expiration'>Permissions</FieldLabel>
                  <Label>
                    <Checkbox name={field.name} />
                    <span>Allow creating buckets</span>
                  </Label>
                </Field>
              )}
            </form.Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose block>Cancel</DialogClose>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmittingForm]) => (
                <DialogClose
                  render={
                    <Button
                      size='sm'
                      type='submit'
                      disabled={!canSubmit || isSubmittingForm || isSubmitting}
                      block
                    >
                      {isSubmitting || isSubmittingForm ? (
                        <span className='flex items-center gap-2'>
                          <Spinner className='size-4' strokeWidth={2.0} />
                          Creating...
                        </span>
                      ) : (
                        'Create Key'
                      )}
                    </Button>
                  }
                />
              )}
            </form.Subscribe>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </Form>
  )
}
