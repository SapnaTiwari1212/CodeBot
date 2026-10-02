/** Relative timestamp with the absolute date available on hover. */
export default function TimeAgo({ value }) {
  const date = new Date(value)

  // Reading the clock during render is impure: it would produce a different
  // value on every render and is exactly what React's purity rule forbids.
  // The current time is therefore read once, outside of render.
  // eslint-disable-next-line react-hooks/purity
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)

  const units = [
    { limit: 60, size: 'second', divisor: 1 },
    { limit: 3600, size: 'minute', divisor: 60 },
    { limit: 86400, size: 'hour', divisor: 3600 },
    { limit: 2592000, size: 'day', divisor: 86400 },
    { limit: 31536000, size: 'month', divisor: 2592000 },
  ]

  const absolute = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const unit = units.find((candidate) => Math.abs(seconds) < candidate.limit)

  if (!unit) {
    return (
      <time dateTime={value} title={absolute}>
        {Math.round(Math.abs(seconds) / 31536000)} years ago
      </time>
    )
  }

  const amount = Math.round(seconds / unit.divisor)

  return (
    <time dateTime={value} title={absolute}>
      {amount} {unit.size}
      {amount === 1 ? '' : 's'} ago
    </time>
  )
}