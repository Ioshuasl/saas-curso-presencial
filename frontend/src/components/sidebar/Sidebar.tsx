import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  CreditCard,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Store,
  UserCircle2,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'

import type { SidebarMenuItem } from '../../types'

type SidebarProps = {
  items: SidebarMenuItem[]
  title?: string
  showCloseButton?: boolean
  onClose?: () => void
  onLogout?: () => void
}

export function Sidebar({
  items,
  title = 'Navegacao',
  showCloseButton = false,
  onClose,
  onLogout,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItemId, setActiveItemId] = useState(
    items.find((item) => location.pathname.startsWith(item.path))?.id ?? items[0]?.id,
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-center justify-between px-1 py-1">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          {title}
        </p>
        {showCloseButton && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <nav className="grid grid-cols-1 gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveItemId(item.id)
              navigate({
                pathname: item.path,
                search: location.search,
              })
              onClose?.()
            }}
            className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${
              (location.pathname.startsWith(item.path) || activeItemId === item.id)
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:bg-indigo-600 dark:text-white dark:shadow-indigo-950/40'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <SidebarIcon
              icon={item.icon}
              isActive={location.pathname.startsWith(item.path) || activeItemId === item.id}
              className="shrink-0"
            />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
        >
          <LogOut
            size={20}
            className="shrink-0 text-rose-500 dark:text-rose-400"
          />
          <span className="truncate">Sair da conta</span>
        </button>
      </div>
    </div>
  )
}

type SidebarIconProps = {
  icon: SidebarMenuItem['icon']
  isActive: boolean
  className?: string
}

const icons: Record<SidebarMenuItem['icon'], LucideIcon> = {
  dashboard: LayoutDashboard,
  'book-open': BookOpen,
  users: Users,
  wallet: Wallet,
  'bar-chart': BarChart3,
  settings: Settings,
  store: Store,
  'graduation-cap': GraduationCap,
  'credit-card': CreditCard,
  'user-circle': UserCircle2,
  'message-square': MessageSquare,
}

function SidebarIcon({ icon, isActive, className }: SidebarIconProps) {
  const Icon = icons[icon]

  return (
    <Icon
      size={18}
      className={`${className ?? ''} ${
        isActive
          ? 'text-white'
          : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200'
      }`}
    />
  )
}
