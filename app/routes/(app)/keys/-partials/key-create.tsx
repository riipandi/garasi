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
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldLabel, FieldError } from '~/app/components/field'
import { Form } from '~/app/components/form'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
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
  { value: 'never', label: 'Never' },
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

      try {
        await onSubmit(submitValue)
        onClose()
      } catch (error) {
        // Error is handled by parent component
        console.error(error)
        throw error
      }
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.KeyRound className='size-4' />
          </IconBox>
          <DialogTitle>Create New Access Key</DialogTitle>

          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>
        <DialogBody className='border-border mt-3 border-t pt-0'>
          <Form onSubmit={handleSubmit}>
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
                  <div className='space-y-2'>
                    {/* Top row: 7d, 30d, 90d */}
                    <div className='grid grid-cols-4 gap-2'>
                      {EXPIRATION_PRESETS.slice(0, 4).map((preset) => (
                        <button
                          key={preset.value}
                          type='button'
                          onClick={() => {
                            field.handleChange(preset.value)
                            handlePresetChange(preset.value)
                          }}
                          disabled={isSubmitting}
                          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            field.state.value === preset.value
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input-border bg-input hover:border-primary/50'
                          } `}
                        >
                          <span className='text-xs font-medium'>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* Bottom row: never, custom */}
                    <div className='grid grid-cols-1 gap-2'>
                      {EXPIRATION_PRESETS.slice(4).map((preset) => (
                        <button
                          key={preset.value}
                          type='button'
                          onClick={() => {
                            field.handleChange(preset.value)
                            handlePresetChange(preset.value)
                          }}
                          disabled={isSubmitting}
                          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            field.state.value === preset.value
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input-border bg-input hover:border-primary/50'
                          } `}
                        >
                          <span className='text-xs font-medium'>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                  <FieldLabel htmlFor='allowCreateBucket'>Permissions</FieldLabel>
                  <Label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox name={field.name} />
                    <span>Allow creating buckets</span>
                  </Label>
                </Field>
              )}
            </form.Field>
          </Form>
        </DialogBody>
        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmittingForm]) => (
              <Button
                type='button'
                size='sm'
                disabled={!canSubmit || isSubmittingForm || isSubmitting}
                onClick={() => form.handleSubmit()}
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
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
