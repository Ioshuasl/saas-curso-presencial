import type { PropsWithChildren } from 'react'

import { useTheme } from '../hooks/useTheme'
import type { UserRole } from '../types'
import { AdminLayout } from './AdminLayout'
import { SaasAdminLayout } from './SaasAdminLayout'
import { StudentLayout } from './StudentLayout'

type AppLayoutProps = PropsWithChildren<{
  role: UserRole
  onLogout: () => void
  profileLabel?: string
  pageTitle?: string
  pageSubtitle?: string
}>

export function AppLayout({
  role,
  onLogout,
  profileLabel,
  pageTitle,
  pageSubtitle,
  children,
}: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  if (role === 'admin') {
    return (
      <AdminLayout
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={onLogout}
        profileLabel={profileLabel}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
      >
        {children}
      </AdminLayout>
    )
  }

  if (role === 'saas_admin') {
    return (
      <SaasAdminLayout
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={onLogout}
        profileLabel={profileLabel}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
      >
        {children}
      </SaasAdminLayout>
    )
  }

  return (
    <StudentLayout
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={onLogout}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
    >
      {children}
    </StudentLayout>
  )
}
