import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save, User as UserIcon } from 'lucide-react'

import Button from '../components/common/Button.jsx'
import LanguageSelector from '../components/editor/LanguageSelector.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { LANGUAGES } from '../utils/languages.js'

const DEFAULT_LANGUAGE_STORAGE_KEY = 'codebot_default_language'

export default function Profile() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // This preference is real: the workspace reads the same key when it loads,
  // so changing it here changes the language new sessions start in.
  const [defaultLanguage, setDefaultLanguage] = useState(
    () => localStorage.getItem(DEFAULT_LANGUAGE_STORAGE_KEY) ?? 'python',
  )
  const [saved, setSaved] = useState(false)

  function handleSave(event) {
    event.preventDefault()

    localStorage.setItem(DEFAULT_LANGUAGE_STORAGE_KEY, defaultLanguage)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  if (!currentUser) {
    return (
      <div className="panel p-8">
        <p className="text-sm text-slate-400">No user is signed in.</p>
      </div>
    )
  }

  const memberSince = new Date(currentUser.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Account</h1>
        <p className="mt-1 text-sm text-slate-500">Your details and workspace preferences.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserIcon className="h-4 w-4 text-brand-300" aria-hidden="true" />
            Account details
          </h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="label">Name</dt>
              <dd className="text-slate-200">{currentUser.name}</dd>
            </div>
            <div>
              <dt className="label">Email</dt>
              <dd className="text-slate-200">{currentUser.email}</dd>
            </div>
            <div>
              <dt className="label">Member since</dt>
              <dd className="text-slate-200">{memberSince}</dd>
            </div>
            <div>
              <dt className="label">User ID</dt>
              <dd className="font-mono text-xs text-slate-500">{currentUser.id}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-white/5 pt-5">
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="text-sm font-semibold text-white">Preferences</h2>
          <p className="mt-1 text-sm text-slate-500">
            These settings are stored in this browser.
          </p>

          <form className="mt-5 space-y-5" onSubmit={handleSave}>
            <LanguageSelector
              id="default-language"
              label="Default language"
              value={defaultLanguage}
              onChange={setDefaultLanguage}
            />

            <div className="flex items-center gap-3">
              <Button type="submit">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save preferences
              </Button>

              {saved && (
                <span className="text-xs text-emerald-300">Saved. New runs will use it.</span>
              )}
            </div>
          </form>

          <p className="mt-6 border-t border-white/5 pt-5 text-xs leading-relaxed text-slate-500">
            CodeBot supports {LANGUAGES.length} languages. The default is only used to
            prefill a new session: you can always change it in the workspace.
          </p>
        </section>
      </div>
    </div>
  )
}