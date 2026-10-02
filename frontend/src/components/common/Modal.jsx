import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible dialog used for confirmations such as deleting a session.
 *
 * Rendering goes through a native <dialog> element so focus trapping, the
 * Escape key and the backdrop come from the browser instead of being
 * reimplemented by hand.
 */
export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    const dialog = document.getElementById('codebot-modal')

    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      id="codebot-modal"
      className="w-[min(28rem,92vw)] rounded-2xl border border-white/10 bg-ink-900 p-0 text-slate-200 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      onClose={onClose}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h2 className="font-semibold text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 py-4 text-sm text-slate-400">{children}</div>

      {footer && (
        <div className="flex justify-end gap-2 border-t border-white/5 px-5 py-4">{footer}</div>
      )}
    </dialog>
  )
}