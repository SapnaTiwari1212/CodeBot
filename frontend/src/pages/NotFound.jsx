import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-brand-300">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>

      <div>
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-brand-300">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          This page does not exist
        </h1>
        <p className="mt-3 text-slate-400">
          The link may be out of date, or the page may have moved.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
        <Link to="/workspace" className="btn-secondary">
          Open the workspace
        </Link>
      </div>
    </div>
  )
}