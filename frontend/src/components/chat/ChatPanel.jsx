import { useEffect, useRef, useState } from 'react'
import { MessagesSquare, Send, Trash2 } from 'lucide-react'

import Button from '../common/Button.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'

const MAX_MESSAGE_LENGTH = 2000

/**
 * Chat about the code currently in the editor.
 *
 * The full message list is sent with every request so the model keeps the
 * context of the conversation. The backend caps the history it accepts, which
 * is what stops the prompt from growing without bound.
 */
export default function ChatPanel({ messages, onSend, onClear, isSending, error }) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  function handleSubmit(event) {
    event.preventDefault()

    const message = draft.trim()

    if (!message || isSending) return

    onSend(message)
    setDraft('')
  }

  return (
    <section className="panel flex min-h-[420px] flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <MessagesSquare className="h-4 w-4 text-brand-300" aria-hidden="true" />
          Chat about this code
        </h2>

        <button
          type="button"
          onClick={onClear}
          disabled={messages.length === 0 || isSending}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear chat
        </button>
      </header>

      <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Ask anything about the code in the editor. CodeBot answers with that code as
            context.
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-500/15 px-4 py-2.5 text-sm text-brand-100'
                : 'mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-slate-300'
            }
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        ))}

        {isSending && (
          <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-white/5 px-4 py-2.5">
            <span className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 pb-2">
          <ErrorMessage title="Chat failed" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-white/5 p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="input scroll-thin min-h-[44px] max-h-32 flex-1 resize-y"
            rows={1}
            placeholder="Why is this loop slow?"
            maxLength={MAX_MESSAGE_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter inserts a newline.
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
            aria-label="Message CodeBot"
          />

          <Button type="submit" disabled={isSending || draft.trim().length === 0}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
        </div>
      </form>
    </section>
  )
}