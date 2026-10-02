import { Loader2 } from 'lucide-react'

/**
 * Loading indicator used while the AI is thinking and while pages fetch data.
 * `label` keeps the message human readable instead of showing a bare spinner.
 */
export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-brand-300" aria-hidden="true" />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  )
}