import type { PropsWithChildren } from 'react'

import type { SidebarMenuItem } from '../types'
import { CrmLayout } from './CrmLayout'

type AdminLayoutProps = PropsWithChildren<{
  onToggleTheme: () => void
  onLogout: () => void
  theme: 'light' | 'dark'
  profileLabel?: string
  pageTitle?: string
  pageSubtitle?: string
}>

const adminMenuItems: SidebarMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { id: 'courses', label: 'Cursos', path: '/cursos', icon: 'book-open' },
  { id: 'students', label: 'Alunos', path: '/alunos', icon: 'users' },
  { id: 'financial', label: 'Financeiro', path: '/financeiro', icon: 'wallet' },
  { id: 'user', label: 'Usuario', path: '/admins', icon: 'user-circle' },
  { id: 'settings', label: 'Configuracoes', path: '/configuracoes', icon: 'settings' },
]

export function AdminLayout({
  children,
  onToggleTheme,
  onLogout,
  theme,
  profileLabel,
  pageTitle,
  pageSubtitle,
}: AdminLayoutProps) {
  return (
    <CrmLayout
      menuItems={adminMenuItems}
      title={pageTitle}
      subtitle={pageSubtitle}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
      showProfileIcon
      profileLabel={profileLabel ?? 'Administrador'}
    >
      {children}
    </CrmLayout>
  )
}
