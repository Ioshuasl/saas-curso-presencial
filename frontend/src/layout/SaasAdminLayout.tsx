import type { PropsWithChildren } from 'react'

import type { SidebarMenuItem } from '../types'
import { CrmLayout } from './CrmLayout'

type SaasAdminLayoutProps = PropsWithChildren<{
  onToggleTheme: () => void
  onLogout: () => void
  theme: 'light' | 'dark'
  profileLabel?: string
  pageTitle?: string
  pageSubtitle?: string
}>

const saasAdminMenuItems: SidebarMenuItem[] = [
  { id: 'tenants', label: 'Tenants', path: '/tenants', icon: 'settings' },
]

export function SaasAdminLayout({
  children,
  onToggleTheme,
  onLogout,
  theme,
  profileLabel,
  pageTitle,
  pageSubtitle,
}: SaasAdminLayoutProps) {
  return (
    <CrmLayout
      menuItems={saasAdminMenuItems}
      title={pageTitle}
      subtitle={pageSubtitle}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
      showProfileIcon
      profileLabel={profileLabel ?? 'Admin SaaS'}
    >
      {children}
    </CrmLayout>
  )
}

