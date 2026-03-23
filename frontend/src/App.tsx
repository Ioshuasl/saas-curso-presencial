import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

import './App.css'
import { AppLayout } from './layout'
import { AdminUsersPage, HomePage, LoginPage } from './pages'
import { authService } from './services'
import type { UserRole, UsuarioBase } from './types'

function resolveUserRole(user: UsuarioBase): UserRole {
  const rawRole = String(user.role ?? user.tipo ?? '').toUpperCase()
  return rawRole === 'ADMIN' ? 'admin' : 'student'
}

function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)

  useEffect(() => {
    async function bootstrapSession() {
      if (!authService.isAuthenticated()) {
        setIsCheckingSession(false)
        return
      }

      try {
        const response = await authService.me()
        const user = response.data
        setCurrentRole(resolveUserRole(user))
      } catch {
        authService.clearToken()
        setCurrentRole(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    bootstrapSession()
  }, [])

  if (isCheckingSession) {
    return (
      <>
        {import.meta.env.DEV ? (
          <Toaster position="top-right" richColors closeButton />
        ) : null}
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
          Carregando...
        </main>
      </>
    )
  }

  if (!currentRole) {
    return (
      <>
        {import.meta.env.DEV ? (
          <Toaster position="top-right" richColors closeButton />
        ) : null}
        <LoginPage
          onLoginSuccess={({ role }) => {
            setCurrentRole(role)
          }}
        />
      </>
    )
  }

  return (
    <>
      {import.meta.env.DEV ? (
        <Toaster position="top-right" richColors closeButton />
      ) : null}
      <AppLayout
        role={currentRole}
        onLogout={() => {
          void authService.logout()
          setCurrentRole(null)
        }}
      >
        {currentRole === 'admin' ? (
          <Routes>
            <Route path="/admins" element={<AdminUsersPage />} />
            <Route path="/dashboard" element={<HomePage role={currentRole} />} />
            <Route path="/cursos" element={<HomePage role={currentRole} />} />
            <Route path="/alunos" element={<HomePage role={currentRole} />} />
            <Route path="/financeiro" element={<HomePage role={currentRole} />} />
            <Route path="/configuracoes" element={<HomePage role={currentRole} />} />
            <Route path="*" element={<Navigate to="/admins" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/catalogo" element={<HomePage role={currentRole} />} />
            <Route path="/meus-cursos" element={<HomePage role={currentRole} />} />
            <Route path="/pagamentos" element={<HomePage role={currentRole} />} />
            <Route path="/perfil" element={<HomePage role={currentRole} />} />
            <Route path="/feedback" element={<HomePage role={currentRole} />} />
            <Route path="*" element={<Navigate to="/catalogo" replace />} />
          </Routes>
        )}
      </AppLayout>
    </>
  )
}

export default App
