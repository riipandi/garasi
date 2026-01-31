/**
 * Portions of this file are based on code from Selia (https://selia.earth).
 * Selia is a collection of components designed for visual cohesion.
 * Credits to Muhamad Nauval Azhar and the contributors.
 *
 * Selia licensed under MIT - Muhamad Nauval Azhar.
 * @see: https://github.com/nauvalazhar/selia/blob/master/LICENSE
 */

import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { clx } from '~/app/utils'

export const headingStyles = cva('text-foreground font-semibold', {
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-5xl'
    }
  },
  defaultVariants: {
    size: 'lg'
  }
})

export function Heading({
  level = 1,
  size,
  className,
  render,
  ...props
}: useRender.ComponentProps<'h1'> &
  VariantProps<typeof headingStyles> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }) {
  const levelMap: Record<string, number> = {
    xl: 1,
    lg: 2,
    md: 3,
    sm: 4,
    xs: 5
  }

  const selectedLevel = levelMap[size || 'lg'] || level

  return useRender({
    defaultTagName: `h${selectedLevel}` as keyof React.JSX.IntrinsicElements,
    render,
    props: {
      'data-slot': 'heading',
      className: clx(headingStyles({ size, className })),
      ...props
    }
  })
}

export function Text({ className, render, ...props }: useRender.ComponentProps<'p'>) {
  return useRender({
    defaultTagName: 'p',
    render,
    props: {
      'data-slot': 'text',
      className: clx(
        'text-foreground text-base leading-relaxed tracking-normal',
        'has-[svg]:inline-flex has-[svg]:items-center has-[svg]:gap-1.5',
        '[&_svg:not([class*=size-])]:size-3 *:[svg]:shrink-0',
        className
      ),
      ...props
    }
  })
}

export function TextLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: {
      className: clx('text-foreground hover:text-primary underline transition-all', className),
      'data-slot': 'text-link',
      ...props
    }
  })
}

export function Strong({ className, ...props }: React.ComponentProps<'strong'>) {
  return (
    <strong
      data-slot='text-strong'
      className={clx('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

export function Code({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      data-slot='text-code'
      className={clx(
        'text-foreground font-mono text-base before:content-["`"] after:content-["`"]',
        className
      )}
      {...props}
    />
  )
}
