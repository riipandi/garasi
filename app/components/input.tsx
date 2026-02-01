/**
 * Portions of this file are based on code from Selia (https://selia.earth).
 * Selia is a collection of components designed for visual cohesion.
 * Credits to Muhamad Nauval Azhar and the contributors.
 *
 * Selia licensed under MIT - Muhamad Nauval Azhar.
 * @see: https://github.com/nauvalazhar/selia/blob/master/LICENSE
 */

import { Input as BaseInput } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { clx } from '~/app/utils'

export const inputStyles = cva(
  [
    'text-foreground placeholder:text-dimmed shadow-input h-9 w-full rounded px-3 transition-[color,box-shadow]',
    'ring-input-border hover:not-data-disabled:not-focus:ring-input-accent-border focus:ring-primary ring focus:ring-2 focus:outline-0',
    '[&[type="file"]]:text-dimmed file:-ml-1 [&[type="file"]]:py-2',
    'file:text-secondary-foreground file:ring-input-accent-border file:bg-secondary file:mr-1.5 file:h-5 file:rounded-sm file:px-1 file:text-base file:ring',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50'
  ],
  {
    variants: {
      variant: {
        default: 'bg-input',
        subtle: 'bg-input/60'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export type InputProps = React.ComponentProps<typeof BaseInput> & VariantProps<typeof inputStyles>

export function Input({ className, variant, ...props }: InputProps) {
  return (
    <BaseInput data-slot='input' className={clx(inputStyles({ variant, className }))} {...props} />
  )
}
