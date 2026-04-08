import type { PropsWithChildren } from 'react'

import type { SidebarMenuItem } from '../types'
import { CrmLayout } from './CrmLayout'

type StudentLayoutProps = PropsWithChildren<{
  onToggleTheme: () => void
  onLogout: () => void
  theme: 'light' | 'dark'
  pageTitle?: string
  pageSubtitle?: string
}>

const studentMenuItems: SidebarMenuItem[] = [
  { id: 'catalog', label: 'Catalogo', path: '/catalogo', icon: 'store' },
  { id: 'my-courses', label: 'Meus Cursos', path: '/meus-cursos', icon: 'graduation-cap' },
  { id: 'payments', label: 'Pagamentos', path: '/pagamentos', icon: 'credit-card' },
  { id: 'profile', label: 'Perfil', path: '/perfil', icon: 'user-circle' },
]

export function StudentLayout({
  children,
  onToggleTheme,
  onLogout,
  theme,
  pageTitle,
  pageSubtitle,
}: StudentLayoutProps) {
  return (
    <CrmLayout
      menuItems={studentMenuItems}
      title={pageTitle}
      subtitle={pageSubtitle}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
    >
      {children}
    </CrmLayout>
  )
}
