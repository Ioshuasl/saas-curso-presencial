export type UserRole = 'admin' | 'student' | 'saas_admin'

export type SidebarMenuItem = {
  tenant_id?: number
  id: string
  label: string
  path: string
  icon:
    | 'dashboard'
    | 'book-open'
    | 'users'
    | 'wallet'
    | 'bar-chart'
    | 'settings'
    | 'store'
    | 'graduation-cap'
    | 'credit-card'
    | 'user-circle'
    | 'message-square'
}
