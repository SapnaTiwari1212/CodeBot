import { useEffect, useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import ErrorMessage from '../components/common/ErrorMessage.jsx'
import Modal from '../components/common/Modal.jsx'
import HistoryList from '../components/history/HistoryList.jsx'
import { deleteSession, fetchHistory } from '../services/historyService.js'
import { LANGUAGES } from '../utils/languages.js'
import { OPERATIONS } from '../utils/operations.js'

export default function History() {
  const [sessions, setSessions] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ operation: '', language: '' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // The request lives inside the effect and every setState happens after an
  // await, so mounting never triggers a cascading render. `reloadKey` lets the
  // retry button re-run the effect without duplicating the fetch logic.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchSessions() {
      try {
        const data = await fetchHistory(filters)

        if (cancelled) return

        setSessions(data.sessions)
        setError(null)
        setStatus('success')
      } catch (requestError) {
        if (cancelled) return

        setError(requestError.message)
        setStatus('error')
      }
    }

    fetchSessions()

    return () => {
      cancelled = true
    }
  }, [filters, reloadKey])

  function handleFilterChange(field, value) {
    setStatus('loading')
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function handleRetry() {
    setStatus('loading')
    setReloadKey((current) => current + 1)
  }

  function handleClearFilters() {
    setStatus('loading')
    setFilters({ operation: '', language: '' })
  }

  async function handleDelete() {
    if (!pendingDelete) return

    setDeleting(true)

    try {
      await deleteSession(pendingDelete._id)
      // Remove it locally so the list reflects the deletion immediately.
      setSessions((current) => current.filter((item) => item._id !== pendingDelete._id))
      setPendingDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">History</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Your saved sessions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Newest first. Only you can see these.
          </p>
        </div>

        <Link to="/workspace" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New run
        </Link>
      </header>

      <section className="panel flex flex-wrap items-end gap-4 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
        </div>

        <div>
          <label className="label" htmlFor="filter-operation">
            Operation
          </label>
          <select
            id="filter-operation"
            className="select min-w-40"
            value={filters.operation}
            onChange={(event) => handleFilterChange('operation', event.target.value)}
          >
            <option value="">All operations</option>
            {OPERATIONS.map((operation) => (
              <option key={operation.id} value={operation.id}>
                {operation.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-language">
            Language
          </label>
          <select
            id="filter-language"
            className="select min-w-40"
            value={filters.language}
            onChange={(event) => handleFilterChange('language', event.target.value)}
          >
            <option value="">All languages</option>
            {LANGUAGES.map((language) => (
              <option key={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        {(filters.operation || filters.language) && (
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={handleClearFilters}
          >
            Clear filters
          </button>
        )}
      </section>

      {status === 'error' && (
        <ErrorMessage title="Could not load history" message={error} onRetry={handleRetry} />
      )}

      <HistoryList
        sessions={sessions}
        status={status}
        error={error}
        onDelete={setPendingDelete}
        onRetry={handleRetry}
      />

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this session?"
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setPendingDelete(null)}
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
        This permanently removes the saved run from your history. The action cannot be
        undone.
      </Modal>
    </div>
  )
}