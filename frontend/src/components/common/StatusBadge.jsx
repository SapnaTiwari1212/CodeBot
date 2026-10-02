import { CircleAlert, CircleCheck, Clock } from 'lucide-react'

import Badge from './Badge.jsx'

const VARIANTS = {
  success: {
    label: 'Success',
    icon: CircleCheck,
    className: 'bg-emerald-500/10 text-emerald-200 ring-emerald-500/30',
  },
  error: {
    label: 'Error',
    icon: CircleAlert,
    className: 'bg-rose-500/10 text-rose-200 ring-rose-500/30',
  },
  running: {
    label: 'Running',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-200 ring-amber-500/30',
  },
}

/** Status pill for a CodeBot session. */
export default function StatusBadge({ status }) {
  const variant = VARIANTS[status] ?? VARIANTS.running
  const Icon = variant.icon

  return (
    <Badge className={variant.className}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {variant.label}
    </Badge>
  )
}