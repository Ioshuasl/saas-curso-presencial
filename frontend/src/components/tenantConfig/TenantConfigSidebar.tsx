import { Building2, ShieldCheck } from 'lucide-react'

import { cn } from '../../utils'
import type { ConfigTab } from './types'

type TenantConfigSidebarProps = {
  activeTab: ConfigTab
  onTabChange: (tab: ConfigTab) => void
}

export function TenantConfigSidebar({ activeTab, onTabChange }: TenantConfigSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:h-fit">
      <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        Configurações
      </p>
      <div className="grid gap-1">
        <button
          type="button"
          onClick={() => onTabChange('geral')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
            activeTab === 'geral'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          )}
        >
          <Building2 size={16} />
          Dados gerais
        </button>
        <button
          type="button"
          onClick={() => onTabChange('seguranca')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
            activeTab === 'seguranca'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          )}
        >
          <ShieldCheck size={16} />
          Segurança
        </button>
      </div>
    </aside>
  )
}
