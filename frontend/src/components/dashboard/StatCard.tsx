import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  /** Texto opcional no canto (ex.: periodo). */
  badge?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: ReactNode
  /** Classes Tailwind para o fundo do icone (ex.: bg-emerald-50 dark:bg-emerald-950/40) */
  iconTint: string
}

export function StatCard({ label, value, badge, trend = 'neutral', icon, iconTint }: StatCardProps) {
  const trendClass =
    trend === 'up'
      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300'
      : trend === 'down'
        ? 'text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-300'
        : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 lg:rounded-xl lg:p-3">
      <div className="mb-4 flex items-start justify-between gap-2 lg:mb-2.5">
        <div className={`rounded-xl p-2.5 shadow-sm lg:rounded-lg lg:p-2 ${iconTint}`}>{icon}</div>
        {badge ? (
          <span
            className={`max-w-[55%] text-end text-[10px] font-semibold uppercase leading-tight tracking-wide ${trendClass} rounded-full px-2 py-0.5 lg:max-w-[60%] lg:text-[8px]`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 lg:space-y-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 lg:text-[11px]">{label}</p>
        <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-base lg:font-semibold">
          {value}
        </p>
      </div>
    </div>
  )
}
