import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogOut, Menu, Terminal, User, X } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth.js'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/workspace', label: 'Workspace' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile', requiresAuth: true },
]

function navLinkClass({ isActive }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-white/10 text-white'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
  ].join(' ')
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleLinks = NAV_LINKS.filter((link) => !link.requiresAuth || isAuthenticated)

  function handleLogout() {
    logout()
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white"
          onClick={() => setMenuOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 shadow-glow">
            <Terminal className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Code<span className="text-brand-300">Bot</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-ghost">
                <User className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost ml-auto px-2 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/5 bg-ink-950/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}