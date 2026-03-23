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
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </p>
        {showCloseButton && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar menu"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <nav className="grid grid-cols-1 gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveItemId(item.id)
              navigate(item.path)
              onClose?.()
            }}
            className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              (location.pathname.startsWith(item.path) || activeItemId === item.id)
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/80 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <SidebarIcon
              icon={item.icon}
              isActive={location.pathname.startsWith(item.path) || activeItemId === item.id}
              className="shrink-0"
            />
            <span className="truncate font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:border-red-900/70 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <LogOut
            size={16}
            className="shrink-0 text-slate-400 group-hover:text-red-600 dark:text-slate-500 dark:group-hover:text-red-300"
          />
          <span className="truncate font-medium">Sair</span>
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
      size={16}
      className={`${className ?? ''} ${
        isActive
          ? 'text-indigo-600 dark:text-indigo-300'
          : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300'
      }`}
    />
  )
}
