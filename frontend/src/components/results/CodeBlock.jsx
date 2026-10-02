import Editor from '@monaco-editor/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/**
 * Read only code block with a copy button.
 *
 * Highlighting comes from the same Monaco instance the editor uses, so code in
 * a result looks identical to code in the editor and no extra highlighting
 * library is needed.
 */

const LINE_HEIGHT = 19
const VERTICAL_PADDING = 24

function getBlockHeight(code) {
  return code.split('\n').length * LINE_HEIGHT + VERTICAL_PADDING
}

export default function CodeBlock({ code, language = 'plaintext', title }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard access can be blocked by the browser. Leaving the button
      // unchanged is better than pretending the copy worked.
      setCopied(false)
    }
  }

  if (!code) return null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">
          {title}
        </span>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase text-slate-600">{language}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-ink-950/80">
        <Editor
          height={getBlockHeight(code)}
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            domReadOnly: true,
            fontSize: 12.5,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            folding: false,
            padding: { top: 10, bottom: 10 },
            renderLineHighlight: 'none',
            scrollbar: { horizontal: 'auto', vertical: 'hidden' },
            automaticLayout: true,
            wordWrap: 'off',
          }}
        />
      </div>
    </div>
  )
}