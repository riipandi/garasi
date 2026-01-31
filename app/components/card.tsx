/**
 * Portions of this file are based on code from Selia (https://selia.earth).
 * Selia is a collection of components designed for visual cohesion.
 * Credits to Muhamad Nauval Azhar and the contributors.
 *
 * Selia licensed under MIT - Muhamad Nauval Azhar.
 * @see: https://github.com/nauvalazhar/selia/blob/master/LICENSE
 */

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { clx } from '~/app/utils'

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={clx(
        'text-foreground ring-card-border shadow-card bg-card rounded-xl ring',
        className
      )}
      {...props}
    />
  )
}

export const cardHeaderStyles = cva(
  [
    'border-card-separator gap-x-3 gap-y-1.5 border-b px-6 py-4',
    'grid grid-cols-[1fr_auto]',
    'has-[svg]:grid-cols-[auto_1fr_auto]',
    'has-data-[slot=iconbox]:*:data-[slot=card-description]:col-start-2',
    '**:[svg,[data-slot=iconbox]]:row-span-2',
    '*:data-[slot=iconbox]:row-span-2',
    '*:data-[slot=card-description]:row-start-2',
    'not-[:has([data-slot=iconbox])]:items-center',
    '*:[[data-slot=card-title]:not(:has(+[data-slot=card-description]))]:row-span-2'
  ],
  {
    variants: {
      align: {
        default: 'justify-start',
        center: 'justify-center text-center',
        right: 'justify-end'
      }
    },
    defaultVariants: {
      align: 'default'
    }
  }
)

export function CardHeader({
  align,
  className,
  ...props
}: React.ComponentProps<'header'> & VariantProps<typeof cardHeaderStyles>) {
  return (
    <header
      data-slot='card-header'
      className={clx(cardHeaderStyles({ align, className }))}
      {...props}
    />
  )
}

export function CardHeaderAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header-action'
      className={clx(
        'col-start-3 row-span-2 row-start-1 ml-auto flex items-center gap-1.5',
        className
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot='card-title'
      className={clx('text-xl leading-tight font-semibold', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot='card-description' className={clx('text-muted', className)} {...props} />
}

export function CardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-body'
      className={clx(
        'p-5 **:data-[slot=item]:px-5',
        '*:data-[slot=table-container]:-m-5 **:data-[slot=table-head]:border-t-0',
        '*:data-[slot=stack]:-m-5',
        'not-[:has(caption)]:[&_tbody>tr:last-child>td:first-child]:rounded-bl-xl',
        'not-[:has(caption)]:[&_tbody>tr:last-child>td:last-child]:rounded-br-xl',
        className
      )}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-footer'
      className={clx(
        'flex items-center gap-1',
        'bg-card-footer border-card-separator rounded-b-xl border-t px-6 py-4',
        className
      )}
      {...props}
    />
  )
}
