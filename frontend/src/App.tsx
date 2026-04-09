import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import './App.css'
import { AppLayout } from './layout'
import {
  AdminCursoPage,
  AdminDashboardPage,
  AdminInscricaoPage,
  AdminUsersPage,
  AlunosPage,
  CatalogoPage,
  FeedbackPage,
  FinanceiroPage,
  LoginPage,
  MeusCursosPage,
  PagamentosPage,
  PerfilAlunoPage,
  TenantConfigPage,
  TenantsPage,
} from './pages'
import { authService, usuarioService } from './services'
import type { UserRole, UsuarioBase } from './types'
import { resolveTenantNavigationAction, resolveTenantSlugFromBrowser } from './utils'

function resolveUserRole(user: UsuarioBase): UserRole {
  const rawRole = String(user.role ?? user.tipo ?? '').toUpperCase()
  if (rawRole === 'ADMIN') return 'admin'
  if (rawRole === 'SAAS_ADMIN') return 'saas_admin'
  return 'student'
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UsuarioBase | null>(null)
  const currentSession = authService.getSession()
  const urlTenantSlug = resolveTenantSlugFromBrowser()
  const sessionTenantSlug = currentSession?.tenantSlug
  const isSaasAdminSession = currentRole === 'saas_admin'
  const tenantNavigationAction = resolveTenantNavigationAction({
    isAuthenticated: Boolean(currentRole) && !isSaasAdminSession,
    sessionTenantSlug,
    urlTenantSlug,
  })
  const hasTenantMismatch =
    !isSaasAdminSession && tenantNavigationAction === 'force_relogin_mismatch'
  const tenantSearch = sessionTenantSlug
    ? `?tenant_slug=${encodeURIComponent(sessionTenantSlug)}`
    : ''

  const pageTitleByPath: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/admins': 'Usuários',
    '/alunos': 'Alunos',
    '/cursos': 'Cursos',
    '/inscricoes': 'Inscricoes',
    '/financeiro': 'Financeiro',
    '/tenants': 'Tenants',
    '/catalogo': 'Catalogo',
    '/meus-cursos': 'Meus Cursos',
    '/pagamentos': 'Pagamentos',
    '/perfil': 'Perfil',
    '/feedback': 'Feedback',
  }

  const currentPageTitle = pageTitleByPath[location.pathname]

  function getProfileLabel(user: UsuarioBase | null) {
    if (!user) {
      return 'Administrador'
    }

    return (
      user.perfil_admin?.nome_completo ??
      user.perfil_aluno?.nome_completo ??
      user.nome_completo ??
      user.username
    )
  }

  useEffect(() => {
    async function bootstrapSession() {
      if (!authService.isAuthenticated()) {
        setIsCheckingSession(false)
        return
      }

      try {
        const response = await usuarioService.me()
        const user = response.data
        setCurrentUser(user)
        setCurrentRole(resolveUserRole(user))
      } catch {
        authService.clearToken()
        setCurrentUser(null)
        setCurrentRole(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    bootstrapSession()
  }, [])

  useEffect(() => {
    if (hasTenantMismatch) {
      void authService.logout()
      setCurrentUser(null)
      setCurrentRole(null)
      navigate(`/login${location.search}`, { replace: true })
      return
    }

    // Se não há tenant na URL, sincroniza com a sessão.
    // Se há mismatch explícito, forçamos novo login no tenant da URL.
    if (tenantNavigationAction !== 'sync_url_to_session') return

    navigate(
      {
        pathname: location.pathname,
        search: tenantSearch,
      },
      { replace: true },
    )
  }, [
    currentRole,
    hasTenantMismatch,
    location.pathname,
    navigate,
    sessionTenantSlug,
    tenantSearch,
    tenantNavigationAction,
    urlTenantSlug,
  ])

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
          onLoginSuccess={({ user, role }) => {
            setCurrentUser(user)
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
        pageTitle={currentPageTitle}
        onLogout={() => {
          void authService.logout()
          setCurrentUser(null)
          setCurrentRole(null)
        }}
        profileLabel={getProfileLabel(currentUser)}
      >
        {currentRole === 'saas_admin' ? (
          <Routes>
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="*" element={<Navigate to="/tenants" replace />} />
          </Routes>
        ) : currentRole === 'admin' ? (
          <Routes>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admins" element={<AdminUsersPage />} />
            <Route path="/cursos" element={<AdminCursoPage />} />
            <Route path="/inscricoes" element={<AdminInscricaoPage />} />
            <Route path="/alunos" element={<AlunosPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/configuracoes" element={<TenantConfigPage />} />
            <Route
              path="*"
              element={<Navigate to={`/dashboard${tenantSearch}`} replace />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/meus-cursos" element={<MeusCursosPage />} />
            <Route path="/pagamentos" element={<PagamentosPage />} />
            <Route path="/perfil" element={<PerfilAlunoPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<Navigate to={`/catalogo${tenantSearch}`} replace />} />
          </Routes>
        )}
      </AppLayout>
    </>
  )
}

export default App
