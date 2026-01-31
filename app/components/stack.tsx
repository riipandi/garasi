/**
 * Portions of this file are based on code from Selia (https://selia.earth).
 * Selia is a collection of components designed for visual cohesion.
 * Credits to Muhamad Nauval Azhar and the contributors.
 *
 * Selia licensed under MIT - Muhamad Nauval Azhar.
 * @see: https://github.com/nauvalazhar/selia/blob/master/LICENSE
 */

import { cva, type VariantProps } from 'class-variance-authority'
import { clx } from '~/app/utils'

export const stackStyles = cva('flex flex-col flex-wrap gap-2 *:data-[slot=separator]:-my-2', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col'
    },
    spacing: {
      none: 'gap-0',
      sm: 'gap-1.5',
      md: 'gap-3',
      lg: 'gap-4.5'
    }
  },
  defaultVariants: {
    direction: 'column',
    spacing: 'md'
  }
})

export function Stack({
  direction,
  spacing,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof stackStyles>) {
  return (
    <div
      data-slot='stack'
      className={clx(stackStyles({ direction, spacing, className }))}
      {...props}
    >
      {children}
    </div>
  )
}
