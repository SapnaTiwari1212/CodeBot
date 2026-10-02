import { OPERATIONS } from '../../utils/operations.js'

/**
 * Operation selector as a grid of buttons.
 *
 * A button grid beats a <select> here: the eleven operations carry icons and
 * descriptions, and a dropdown would hide all of that behind one line.
 */
export default function OperationSelector({ selectedId, onSelect, disabled = false }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
      role="group"
      aria-label="Operation"
    >
      {OPERATIONS.map((operation) => {
        const Icon = operation.icon
        const isSelected = operation.id === selectedId

        return (
          <button
            key={operation.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(operation.id)}
            aria-pressed={isSelected}
            title={operation.description}
            className={[
              'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isSelected
                ? 'border-brand-400/60 bg-brand-500/10 text-white'
                : 'border-white/5 bg-ink-850/50 text-slate-400 hover:border-white/15 hover:text-slate-100',
            ].join(' ')}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${isSelected ? operation.iconClass : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span className="truncate font-medium">{operation.label}</span>
          </button>
        )
      })}
    </div>
  )
}