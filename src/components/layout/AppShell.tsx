import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Menu, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

// The sidebar is dark, so it carries its own focus colour.
const sidebarFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring'
const navLinkClass = cn(
  'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 no-underline transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4',
  sidebarFocus,
)
// The active item is marked by a rule on its leading edge, like a ledger tab.
const navLinkActiveClass =
  'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--sidebar-primary)]'
const iconButtonClass = cn(
  'flex size-9 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/80 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5',
  sidebarFocus,
)

function Brand() {
  return (
    <div className="flex items-center gap-2.5 text-sidebar-foreground">
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="size-5 text-sidebar-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M3 5h14M3 10h10M3 15h6" />
      </svg>
      <span className="font-display text-[17px] leading-none font-semibold tracking-wide">
        Customer Hub
      </span>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 p-3">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className={navLinkClass}
          activeProps={{ className: navLinkActiveClass }}
          onClick={onNavigate}
        >
          <LayoutDashboard aria-hidden />
          Overview
        </Link>
        <Link
          to="/customers"
          className={navLinkClass}
          activeProps={{ className: navLinkActiveClass }}
          onClick={onNavigate}
        >
          <Users aria-hidden />
          Customers
        </Link>
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4 text-xs leading-relaxed text-sidebar-foreground/65">
        <p className="flex items-center gap-2 font-medium text-sidebar-foreground">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-status-past-due"
          />
          Mock data
        </p>
        <p className="mt-1">
          No backend is connected. Records are fictional and reset when the
          server restarts.
        </p>
      </div>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const closeMobileNav = () => {
    setMobileNavOpen(false)
    openButtonRef.current?.focus()
  }

  // While the drawer is open: focus moves into it and Esc closes it.
  useEffect(() => {
    if (!mobileNavOpen) return
    closeButtonRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false)
        openButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  return (
    <div className="min-h-screen lg:pl-56">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col bg-sidebar lg:flex">
        <div className="flex h-14 items-center px-5">
          <Brand />
        </div>
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 bg-sidebar px-2 lg:hidden">
        <button
          ref={openButtonRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={mobileNavOpen}
          className={iconButtonClass}
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu aria-hidden />
        </button>
        <Brand />
      </header>

      {/* Always mounted so it can slide; inert keeps it out of the tab order. */}
      <div
        inert={!mobileNavOpen}
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          !mobileNavOpen && 'pointer-events-none',
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          className={cn(
            'absolute inset-0 cursor-default bg-sidebar/60 transition-opacity duration-200',
            mobileNavOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={closeMobileNav}
        />
        <aside
          className={cn(
            'relative flex h-full w-64 max-w-[85vw] flex-col bg-sidebar shadow-xl transition-transform duration-200 ease-out',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-12 items-center justify-between pr-2 pl-5">
            <Brand />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close navigation"
              className={iconButtonClass}
              onClick={closeMobileNav}
            >
              <X aria-hidden />
            </button>
          </div>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </aside>
      </div>

      <main className="w-full max-w-[76rem] px-4 py-6 sm:px-8 lg:py-8">
        {children}
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  back?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6">
      {back ? <div className="mb-3">{back}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-8 font-semibold text-balance">
            {title}
          </h1>
          {description ? (
            <div className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
