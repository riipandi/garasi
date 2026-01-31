/**
 * Portions of this file are based on code from Selia (https://selia.earth).
 * Selia is a collection of components designed for visual cohesion.
 * Credits to Muhamad Nauval Azhar and the contributors.
 *
 * Selia licensed under MIT - Muhamad Nauval Azhar.
 * @see: https://github.com/nauvalazhar/selia/blob/master/LICENSE
 */

import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { clx } from '~/app/utils'

const toggleStyles = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2 ring [&_svg:not([class*=size-])]:size-4',
    'outline-primary focus:outline-0 focus-visible:outline-2 focus-visible:outline-offset-2',
    '[&_svg:not([class*=text-])]:text-foreground transition-colors duration-100',
    'hover:not-data-disabled:not-data-pressed:bg-accent/50 data-disabled:cursor-not-allowed data-disabled:opacity-70'
  ],
  {
    variants: {
      variant: {
        default: 'ring-border data-pressed:bg-accent shadow',
        plain: 'data-pressed:bg-accent ring-transparent'
      },
      size: {
        sm: 'h-8 min-w-8 rounded px-2.5',
        'sm-icon': 'h-8 w-8 rounded',
        md: 'h-9 min-w-9 rounded-sm px-3.5',
        'md-icon': 'h-9 w-9 rounded'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export function Toggle({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof BaseToggle> & VariantProps<typeof toggleStyles>) {
  return (
    <BaseToggle
      data-slot='toggle'
      data-size={size}
      className={clx(toggleStyles({ variant, size, className }))}
      {...props}
    >
      {children}
    </BaseToggle>
  )
}
