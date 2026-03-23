import type { PropsWithChildren } from 'react'

import { useTheme } from '../hooks/useTheme'
import type { UserRole } from '../types'
import { AdminLayout } from './AdminLayout'
import { StudentLayout } from './StudentLayout'

type AppLayoutProps = PropsWithChildren<{
  role: UserRole
  onLogout: () => void
}>

export function AppLayout({ role, onLogout, children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  if (role === 'admin') {
    return (
      <AdminLayout theme={theme} onToggleTheme={toggleTheme} onLogout={onLogout}>
        {children}
      </AdminLayout>
    )
  }

  return (
    <StudentLayout theme={theme} onToggleTheme={toggleTheme} onLogout={onLogout}>
      {children}
    </StudentLayout>
  )
}
