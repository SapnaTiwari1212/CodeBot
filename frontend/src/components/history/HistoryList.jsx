import { History as HistoryIcon, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import HistoryCard from './HistoryCard.jsx'

/** History list with loading, error, empty and populated states. */
export default function HistoryList({
  sessions,
  status = 'idle',
  error = null,
  onDelete,
  onRetry,
}) {
  if (status === 'loading') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="panel h-40 animate-pulse bg-white/[0.03]" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="panel p-6">
        <p className="text-sm text-rose-300">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary mt-4">
            Try again
          </button>
        )}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-500">
          <HistoryIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-white">No sessions yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Every CodeBot run is saved automatically. Run your first operation and it will
            show up here.
          </p>
        </div>
        <Link to="/workspace" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Open the workspace
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sessions.map((session) => (
        <HistoryCard key={session._id} session={session} onDelete={onDelete} />
      ))}
    </div>
  )
}