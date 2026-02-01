import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Field, FieldLabel } from '~/app/components/field'
import { Fieldset, FieldsetLegend } from '~/app/components/fieldset'
import { Text } from '~/app/components/typography'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'

// Extend the schema type with additional properties needed by the UI
interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

interface PermissionsSectionProps {
  accessKey: AccessKey
}

export function PermissionsSection({ accessKey }: PermissionsSectionProps) {
  return (
    <Fieldset>
      <FieldsetLegend>
        <Lucide.Shield className='size-4' />
        Permissions
      </FieldsetLegend>

      {accessKey.permissions &&
      typeof accessKey.permissions === 'object' &&
      Object.keys(accessKey.permissions).length > 0 ? (
        <div className='space-y-3'>
          {Object.entries(accessKey.permissions).map(([key, value]) => (
            <Field key={key}>
              <FieldLabel>{key}</FieldLabel>
              {value ? (
                <Badge variant='success'>
                  <Lucide.Check className='size-3.5' />
                  Allowed
                </Badge>
              ) : (
                <Badge variant='secondary'>
                  <Lucide.X className='size-3.5' />
                  Denied
                </Badge>
              )}
            </Field>
          ))}
        </div>
      ) : (
        <Text className='text-muted'>No permissions configured for this access key.</Text>
      )}
    </Fieldset>
  )
}
