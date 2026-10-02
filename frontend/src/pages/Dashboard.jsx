import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, History as HistoryIcon, Play, User as UserIcon } from 'lucide-react'

import Badge from '../components/common/Badge.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import TimeAgo from '../components/common/TimeAgo.jsx'
import { fetchHistory } from '../services/historyService.js'
import { useAuth } from '../hooks/useAuth.js'
import { getLanguageLabel } from '../utils/languages.js'
import { OPERATIONS } from '../utils/operations.js'
import { getCodePreview } from '../utils/formatResult.js'

/** Numbers on this page are derived from the user's own sessions. */
function buildStats(sessions) {
  const total = sessions.length
  const successes = sessions.filter((item) => item.status === 'success').length
  const successRate = total === 0 ? 0 : Math.round((successes / total) * 100)

  const counts = new Map()
  for (const session of sessions) {
    counts.set(session.operation, (counts.get(session.operation) ?? 0) + 1)
  }

  const favourite = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]

  const languages = new Set(sessions.map((item) => item.language))

  return [
    { id: 'runs', label: 'Sessions', value: String(total), hint: 'Loaded' },
    { id: 'success', label: 'Success rate', value: `${successRate}%`, hint: 'Of your runs' },
    {
      id: 'favourite',
      label: 'Most used',
      value: favourite ? (favourite[0] ?? '—') : '—',
      hint: favourite ? `${favourite[1]} runs` : 'No runs yet',
    },
    { id: 'languages', label: 'Languages', value: String(languages.size), hint: 'Distinct' },
  ]
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [sessions, setSessions] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchHistory({ limit: 5 })

        if (!cancelled) {
          setSessions(data.sessions)
          setStatus('success')
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = buildStats(sessions)

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pick an operation or pick up one of your recent sessions.
          </p>
        </div>

        <Link to="/workspace" className="btn-primary">
          <Play className="h-4 w-4" aria-hidden="true" />
          New run
        </Link>
      </header>

      {status === 'error' && (
        <ErrorMessage title="Could not load your dashboard" message={error} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <section key={stat.id} className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold capitalize text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-600">{stat.hint}</p>
          </section>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Operations
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPERATIONS.filter((operation) => operation.id !== 'chat').map((operation) => {
            const Icon = operation.icon

            return (
              <Link
                key={operation.id}
                to={`/workspace?operation=${operation.id}`}
                className="panel group flex items-center gap-4 p-4 transition hover:border-brand-400/40"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${operation.chipClass}`}
                >
                  <Icon className={`h-5 w-5 ${operation.iconClass}`} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-white">{operation.label}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {operation.tagline}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-brand-300"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Recent sessions
          </h2>
          <Link to="/history" className="text-xs text-brand-300 hover:text-brand-200">
            View all
          </Link>
        </div>

        {status === 'loading' ? (
          <div className="panel mt-4 divide-y divide-white/5">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-16 animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="panel mt-4 flex flex-col items-center gap-3 px-6 py-12 text-center">
            <HistoryIcon className="h-6 w-6 text-slate-600" aria-hidden="true" />
            <p className="font-medium text-white">No sessions yet</p>
            <p className="max-w-sm text-sm text-slate-500">
              Run your first operation and it will appear here automatically.
            </p>
            <Link to="/workspace" className="btn-primary">
              Open the workspace
            </Link>
          </div>
        ) : (
          <div className="panel mt-4 divide-y divide-white/5 overflow-hidden">
            {sessions.map((session) => {
              const operation = OPERATIONS.find((item) => item.id === session.operation)
              const OperationIcon = operation?.icon ?? Play

              return (
                <Link
                  key={session._id}
                  to={`/history/${session._id}`}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-white/5"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${operation?.chipClass ?? ''}`}
                  >
                    <OperationIcon
                      className={`h-4 w-4 ${operation?.iconClass ?? 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-100">
                        {operation?.label ?? session.operation}
                      </span>
                      <Badge className="bg-white/5 text-slate-400 ring-white/10">
                        {getLanguageLabel(session.language)}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-xs text-slate-500">
                      {getCodePreview(session.source_code)}
                    </span>
                  </span>

                  <span className="flex items-center gap-3">
                    <StatusBadge status={session.status} />
                    <span className="text-xs text-slate-500">
                      <TimeAgo value={session.created_at} />
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-300"
      >
        <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Account settings
      </Link>
    </div>
  )
}