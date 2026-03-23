export type UserRole = 'admin' | 'student'

export type SidebarMenuItem = {
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
