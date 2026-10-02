import { Check, Copy, Sparkles } from 'lucide-react'
import { useState } from 'react'

import ErrorMessage from '../common/ErrorMessage.jsx'
import Loader from '../common/Loader.jsx'
import { getMonacoLanguage } from '../../utils/languages.js'
import { getOperation } from '../../utils/operations.js'
import { resultToPlainText } from '../../utils/formatResult.js'
import ComplexityResult from './ComplexityResult.jsx'
import ConvertedResult from './ConvertedResult.jsx'
import ExplanationResult from './ExplanationResult.jsx'
import GeneratedCode from './GeneratedCode.jsx'
import IssuesResult from './IssuesResult.jsx'
import RefactoredCode from './RefactoredCode.jsx'
import ReviewResult from './ReviewResult.jsx'
import SuggestionsResult from './SuggestionsResult.jsx'

/**
 * The result panel owns the four states a run can be in: empty, loading, error
 * and success. The operation specific rendering is delegated to one component
 * per result shape so no single component handles every operation's fields.
 */
export default function ResultPanel({
  status = 'empty',
  result = null,
  error = null,
  operationId,
  language,
  targetLanguage = null,
}) {
  const [copied, setCopied] = useState(false)

  const operation = getOperation(operationId)
  const codeLanguage = getMonacoLanguage(language)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultToPlainText(result))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  function renderBody() {
    if (!result) return null

    switch (operationId) {
      case 'explain':
        return <ExplanationResult result={result} />

      case 'fix':
        return <IssuesResult result={result} heading="Problem" language={codeLanguage} />

      case 'debug':
        return <IssuesResult result={result} heading="Root cause" language={codeLanguage} />

      case 'improve':
        return <SuggestionsResult result={result} language={codeLanguage} />

      case 'refactor':
        return <RefactoredCode result={result} language={codeLanguage} />

      case 'optimize':
        return (
          <>
            <ComplexityResult result={result} />
            <div className="mt-6">
              <GeneratedCode
                result={result}
                language={codeLanguage}
                title="Optimized code"
              />
            </div>
          </>
        )

      case 'generate':
        return <GeneratedCode result={result} language={codeLanguage} />

      case 'convert':
        return (
          <ConvertedResult
            result={result}
            targetLanguage={getMonacoLanguage(targetLanguage)}
          />
        )

      case 'complexity':
        return <ComplexityResult result={result} />

      case 'review':
        return <ReviewResult result={result} />

      default:
        return <ExplanationResult result={result} />
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Loader label="CodeBot is thinking…" />
        <div className="w-full max-w-xs">
          <div className="h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-1/3 animate-shimmer rounded-full bg-brand-400/60" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorMessage
          title="The run did not complete"
          message={error ?? 'An unexpected error occurred.'}
        />
      </div>
    )
  }

  if (status === 'success' && result) {
    return (
      <div className="scroll-thin h-full overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Sparkles className="h-4 w-4 text-brand-300" aria-hidden="true" />
            {operation?.label ?? 'CodeBot'} result
          </h3>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy result'}
          </button>
        </div>

        <div className="mt-4">{renderBody()}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-500">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="font-medium text-white">No result yet</p>
      <p className="max-w-xs text-sm text-slate-500">
        Pick an operation, paste your code, then run CodeBot. The answer appears here.
      </p>
    </div>
  )
}