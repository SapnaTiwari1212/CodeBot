import { CircleAlert, Info, TriangleAlert } from 'lucide-react'

const VARIANTS = {
  error: {
    icon: CircleAlert,
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
    iconClass: 'text-rose-300',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    iconClass: 'text-amber-300',
  },
  info: {
    icon: Info,
    className: 'border-brand-400/25 bg-brand-500/10 text-brand-100',
    iconClass: 'text-brand-300',
  },
}

/**
 * Human readable failure message.
 *
 * The backend never sends stack traces, so whatever arrives here is safe to
 * show. Every failure path in the app funnels through this component, which is
 * what stops the UI from ever going blank.
 */
export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  variant = 'error',
  onRetry,
  className = '',
}) {
  const config = VARIANTS[variant] ?? VARIANTS.error
  const Icon = config.icon

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${config.className} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {message && <p className="mt-0.5 text-sm opacity-90">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-current/30 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
        >
          Retry
        </button>
      )}
    </div>
  )
}