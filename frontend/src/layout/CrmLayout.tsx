import { AnimatePresence, motion } from 'framer-motion'
import { UserCircle2 } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'

import { Sidebar } from '../components'
import type { SidebarMenuItem } from '../types'
import { PageHeader } from './PageHeader'
import { ThemeToggle } from './ThemeToggle'

type CrmLayoutProps = PropsWithChildren<{
  menuItems: SidebarMenuItem[]
  title?: string
  subtitle?: string
  onToggleTheme: () => void
  onLogout: () => void
  theme: 'light' | 'dark'
  showProfileIcon?: boolean
  profileLabel?: string
}>

export function CrmLayout({
  menuItems,
  title,
  subtitle,
  onToggleTheme,
  onLogout,
  theme,
  showProfileIcon = false,
  profileLabel = 'Usuario logado',
  children,
}: CrmLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Fechar menu lateral"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/35 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="grid h-full min-h-0 w-full gap-0 md:grid-cols-[252px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="scrollbar-hide hidden border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:block md:h-full md:min-h-0 md:overflow-y-auto">
          <Sidebar items={menuItems} onLogout={onLogout} />
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              className="scrollbar-hide fixed left-0 top-0 z-40 h-full w-[78vw] max-w-[280px] overflow-y-auto border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <Sidebar
                items={menuItems}
                showCloseButton
                onClose={() => setIsSidebarOpen(false)}
                onLogout={onLogout}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 2xl:px-10">
            <PageHeader
              title={title}
              subtitle={subtitle}
              actions={
                <>
                  {showProfileIcon ? (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <UserCircle2 size={18} />
                      <span className="hidden font-medium sm:inline">{profileLabel}</span>
                    </div>
                  ) : null}
                  <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                </>
              }
            />
          </header>

          <main className="min-h-0 flex-1 overflow-hidden bg-slate-50/60 dark:bg-slate-950/50">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <motion.button
        type="button"
        aria-label="Abrir menu lateral"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-5 right-5 z-20 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 md:hidden"
        whileTap={{ scale: 0.95 }}
      >
        Menu
      </motion.button>
    </div>
  )
}
