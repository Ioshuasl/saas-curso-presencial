import type { ReactNode } from 'react'

type PageHeaderProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const hasHeading = Boolean(title || subtitle)

  return (
    <div className="flex w-full items-center justify-between gap-3">
      {hasHeading ? (
        <div className="min-w-0">
          {subtitle ? (
            <p className="truncate text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
          {title ? <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1> : null}
        </div>
      ) : (
        <div />
      )}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
