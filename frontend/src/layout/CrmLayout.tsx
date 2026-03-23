import { AnimatePresence, motion } from 'framer-motion'
import { useState, type PropsWithChildren } from 'react'

import { Sidebar } from '../components'
import type { SidebarMenuItem } from '../types'
import { ThemeToggle } from './ThemeToggle'

type CrmLayoutProps = PropsWithChildren<{
  sectionLabel: string
  panelTitle: string
  menuItems: SidebarMenuItem[]
  onToggleTheme: () => void
  onLogout: () => void
  theme: 'light' | 'dark'
}>

export function CrmLayout({
  sectionLabel,
  panelTitle,
  menuItems,
  onToggleTheme,
  onLogout,
  theme,
  children,
}: CrmLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen h-full flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 2xl:px-10">
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {sectionLabel}
            </p>
            <h1 className="text-lg font-semibold md:text-xl">{panelTitle}</h1>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

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

      <div className="grid min-h-0 w-full flex-1 gap-0 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
          <Sidebar items={menuItems} onLogout={onLogout} />
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              className="scrollbar-hide fixed left-0 top-0 z-40 h-full w-[80vw] max-w-[320px] overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:hidden"
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

        <main className="min-h-0 overflow-y-auto bg-white p-4 dark:bg-slate-900">
          {children}
        </main>
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
