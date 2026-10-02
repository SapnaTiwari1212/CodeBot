import { Link } from 'react-router-dom'
import { Play, Trash2 } from 'lucide-react'

import Badge from '../common/Badge.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import TimeAgo from '../common/TimeAgo.jsx'
import { getLanguageLabel } from '../../utils/languages.js'
import { getOperation } from '../../utils/operations.js'
import { getCodePreview } from '../../utils/formatResult.js'

/** One session in the history list. */
export default function HistoryCard({ session, onDelete }) {
  const operation = getOperation(session.operation)
  const OperationIcon = operation?.icon ?? Play

  const languageLabel = session.target_language
    ? `${getLanguageLabel(session.language)} → ${getLanguageLabel(session.target_language)}`
    : getLanguageLabel(session.language)

  return (
    <article className="panel p-5 transition hover:border-white/15">
      <div className="flex items-start gap-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${operation?.chipClass ?? 'bg-white/5 text-slate-300 ring-white/10'}`}
        >
          <OperationIcon
            className={`h-5 w-5 ${operation?.iconClass ?? 'text-slate-300'}`}
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-white">{operation?.label ?? session.operation}</h3>
            <Badge className="bg-white/5 text-slate-300 ring-white/10">{languageLabel}</Badge>
            <StatusBadge status={session.status} />
          </div>

          <p className="mt-2 truncate font-mono text-xs text-slate-500">
            {getCodePreview(session.source_code)}
          </p>

          {session.result?.error && (
            <p className="mt-2 truncate text-xs text-rose-300">{session.result.error}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <TimeAgo value={session.created_at} />
            {session.duration_seconds != null && (
              <span>{session.duration_seconds.toFixed(1)}s</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
        <Link to={`/history/${session._id}`} className="btn-secondary px-3 py-1.5 text-xs">
          Open
        </Link>

        <Link
          to={`/workspace?operation=${session.operation}&language=${session.language}`}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          Reopen in workspace
        </Link>

        <button
          type="button"
          onClick={() => onDelete(session)}
          className="btn-ghost ml-auto px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  )
}