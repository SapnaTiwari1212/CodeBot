import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Trash2 } from 'lucide-react'

import Badge from '../components/common/Badge.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import Loader from '../components/common/Loader.jsx'
import Modal from '../components/common/Modal.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import TimeAgo from '../components/common/TimeAgo.jsx'
import CodeEditor from '../components/editor/CodeEditor.jsx'
import ResultPanel from '../components/results/ResultPanel.jsx'
import { deleteSession, fetchSession } from '../services/historyService.js'
import { getLanguageLabel, getMonacoLanguage } from '../utils/languages.js'
import { getOperation } from '../utils/operations.js'

export default function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // The request lives inside the effect and every setState happens after an
  // await, so mounting never triggers a cascading render. `reloadKey` lets the
  // retry button re-run the effect without duplicating the fetch logic.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchSessionById() {
      try {
        const data = await fetchSession(id)

        if (cancelled) return

        setSession(data)
        setError(null)
        setStatus('success')
      } catch (requestError) {
        if (cancelled) return

        setError(requestError.message)
        setStatus('error')
      }
    }

    fetchSessionById()

    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  function handleRetry() {
    setStatus('loading')
    setReloadKey((current) => current + 1)
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      await deleteSession(id)
      navigate('/history', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading') {
    return <Loader label="Loading session…" />
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <ErrorMessage title="Could not open this session" message={error} onRetry={handleRetry} />
        <Link to="/history" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to history
        </Link>
      </div>
    )
  }

  const operation = getOperation(session.operation)

  return (
    <div className="space-y-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to history
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {operation?.label ?? session.operation}
            </h1>
            <StatusBadge status={session.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge className="bg-white/5 text-slate-300 ring-white/10">
              {getLanguageLabel(session.language)}
              {session.target_language
                ? ` → ${getLanguageLabel(session.target_language)}`
                : ''}
            </Badge>
            <TimeAgo value={session.created_at} />
            {session.duration_seconds != null && (
              <span>{session.duration_seconds.toFixed(1)}s</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/workspace?operation=${session.operation}&language=${session.language}`}
            className="btn-secondary"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Reopen in workspace
          </Link>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </header>

      {session.input_prompt && (
        <section className="panel p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Prompt
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
            {session.input_prompt}
          </p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel overflow-hidden">
          <header className="border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Submitted code</h2>
          </header>
          <div className="h-[420px]">
            <CodeEditor
              value={session.source_code}
              language={getMonacoLanguage(session.language)}
              readOnly
            />
          </div>
        </section>

        <section className="panel flex min-h-[420px] flex-col overflow-hidden">
          <header className="border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Result</h2>
          </header>

          <div className="flex-1">
            {session.status === 'error' ? (
              <div className="p-5">
                <ErrorMessage
                  title="This run failed"
                  message={session.result?.error ?? 'No error message was recorded.'}
                />
              </div>
            ) : (
              <ResultPanel
                status="success"
                result={session.result}
                operationId={session.operation}
                language={session.language}
                targetLanguage={session.target_language}
              />
            )}
          </div>
        </section>
      </div>

      <Modal
        open={confirmOpen}
        title="Delete this session?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        This permanently removes the saved run from your history.
      </Modal>
    </div>
  )
}