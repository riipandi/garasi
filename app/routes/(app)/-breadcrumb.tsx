import { type AnyRouteMatch, Link, useMatches } from '@tanstack/react-router'
import { Activity, Fragment } from 'react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem } from '~/app/components/breadcrumb'
import { BreadcrumbSeparator } from '~/app/components/breadcrumb'

export type BreadcrumbValue = string | string[] | ((match: AnyRouteMatch) => string | string[])

type ResolvedBreadcrumbItem = {
  path: string
  label: string
}

interface AppBreadcrumbProps {
  className?: string
}

export function AppBreadcrumb({ className }: AppBreadcrumbProps) {
  const matches = useMatches()

  const breadcrumbs: ResolvedBreadcrumbItem[] = matches.flatMap((match) => {
    const staticData = match.staticData
    if (!staticData?.breadcrumb) return []

    const breadcrumbValue =
      typeof staticData.breadcrumb === 'function'
        ? staticData.breadcrumb(match)
        : staticData.breadcrumb

    const items = Array.isArray(breadcrumbValue) ? breadcrumbValue : [breadcrumbValue]

    return items.map((item) => ({ label: item, path: match.pathname }))
  })

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <Fragment key={`${crumb.path}-${index}`}>
              <Activity mode={isLast ? 'visible' : 'hidden'}>
                <BreadcrumbItem>{crumb.label}</BreadcrumbItem>
              </Activity>
              <Activity mode={!isLast ? 'visible' : 'hidden'}>
                <BreadcrumbItem>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Activity>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
