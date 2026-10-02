import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Hash, Info, TriangleAlert } from 'lucide-react'

import ChatPanel from '../components/chat/ChatPanel.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import CodeEditor from '../components/editor/CodeEditor.jsx'
import EditorToolbar from '../components/editor/EditorToolbar.jsx'
import LanguageSelector from '../components/editor/LanguageSelector.jsx'
import OperationSelector from '../components/editor/OperationSelector.jsx'
import ResultPanel from '../components/results/ResultPanel.jsx'
import { runOperation, sendChatMessage } from '../services/codebotService.js'
import {
  LANGUAGES,
  MAX_CODE_LENGTH,
  MAX_PROMPT_LENGTH,
  getMonacoLanguage,
  getStarterCode,
} from '../utils/languages.js'
import {
  getOperation,
  needsTargetLanguage,
} from '../utils/operations.js'

const DEFAULT_LANGUAGE_STORAGE_KEY = 'codebot_default_language'

let messageCounter = 0
function nextMessageId() {
  messageCounter += 1
  return `msg-${Date.now()}-${messageCounter}`
}

/**
 * The main product screen: editor on the left, structured result on the right,
 * and a chat panel below for follow up questions about the same code.
 */
export default function Workspace() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const requestedOperation = searchParams.get('operation')
  const requestedLanguage = searchParams.get('language')

  const [operationId, setOperationId] = useState(
    getOperation(requestedOperation) ? requestedOperation : 'explain',
  )
  const [language, setLanguage] = useState(
    LANGUAGES.some((item) => item.id === requestedLanguage)
      ? requestedLanguage
      : localStorage.getItem(DEFAULT_LANGUAGE_STORAGE_KEY) ?? 'python',
  )
  const [targetLanguage, setTargetLanguage] = useState('javascript')
  const [code, setCode] = useState(() =>
    getStarterCode(requestedLanguage ?? language),
  )
  const [prompt, setPrompt] = useState('')

  const [status, setStatus] = useState('empty')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [messages, setMessages] = useState([])
  const [chatStatus, setChatStatus] = useState('idle')
  const [chatError, setChatError] = useState(null)

  const isRunning = status === 'loading'
  const codeTooLong = code.length > MAX_CODE_LENGTH
  const promptTooLong = prompt.length > MAX_PROMPT_LENGTH

  // Keep the URL in step with the selection so the run can be shared or reloaded.
  useEffect(() => {
    setSearchParams({ operation: operationId, language }, { replace: true })
  }, [operationId, language, setSearchParams])

  const operation = useMemo(() => getOperation(operationId), [operationId])

  const validateRequest = useCallback(() => {
    if (!code.trim()) {
      return 'Add some code before running CodeBot.'
    }
    if (codeTooLong) {
      return `The snippet is ${code.length} characters. The limit is ${MAX_CODE_LENGTH}.`
    }
    if (promptTooLong) {
      return `The prompt is longer than the ${MAX_PROMPT_LENGTH} character limit.`
    }
    if (operationId === 'generate' && !prompt.trim()) {
      return 'Describe what you want CodeBot to generate.'
    }
    if (needsTargetLanguage(operationId) && !targetLanguage) {
      return 'Choose the language to convert the code into.'
    }
    return null
  }, [
    code,
    codeTooLong,
    operationId,
    promptTooLong,
    prompt,
    targetLanguage,
  ])

  async function handleRun() {
    const validationError = validateRequest()

    setNotice(null)

    if (validationError) {
      setError(validationError)
      setResult(null)
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)
    setResult(null)

    try {
      const data = await runOperation({
        operation: operationId,
        language,
        targetLanguage: needsTargetLanguage(operationId) ? targetLanguage : null,
        code,
        prompt,
      })

      setResult(data.result)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }

  function handleClear() {
    setCode('')
    setPrompt('')
    setResult(null)
    setError(null)
    setStatus('empty')
    setNotice(null)
  }

  function handleSave() {
    // Runs are saved by POST /api/codebot/run already. This button exists to
    // make that visible, so it explains rather than pretending to save again.
    setNotice(
      status === 'success'
        ? 'This run was saved to your history automatically.'
        : 'Run CodeBot first: every successful run is saved automatically.',
    )
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage)
    localStorage.setItem(DEFAULT_LANGUAGE_STORAGE_KEY, nextLanguage)
    setCode(getStarterCode(nextLanguage))
    setResult(null)
    setStatus('empty')
    setError(null)
  }

  async function handleSendChat(message) {
    setChatStatus('sending')
    setChatError(null)

    const userMessage = { id: nextMessageId(), role: 'user', content: message }
    const historyForRequest = [...messages, userMessage].map(
      ({ role, content }) => ({ role, content }),
    )

    setMessages((current) => [...current, userMessage])

    try {
      const data = await sendChatMessage({
        message,
        code,
        language,
        history: historyForRequest.slice(0, -1),
      })

      setMessages((current) => [
        ...current,
        { id: nextMessageId(), role: 'assistant', content: data.reply },
      ])
      setChatStatus('idle')
    } catch (requestError) {
      // Roll the optimistic user message back so the transcript stays honest.
      setMessages((current) => current.filter((item) => item.id !== userMessage.id))
      setChatError(requestError.message)
      setChatStatus('error')
    }
  }

  function handleClearChat() {
    setMessages([])
    setChatError(null)
    setChatStatus('idle')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {operation?.label ?? 'Explain'}
            <span className="ml-3 text-sm font-normal text-slate-500">
              {code.length} characters
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{operation?.description}</p>
        </div>

        <button type="button" onClick={() => navigate('/history')} className="btn-secondary">
          <Hash className="h-4 w-4" aria-hidden="true" />
          History
        </button>
      </header>

      {notice && (
        <p className="flex items-start gap-2 rounded-xl border border-brand-400/25 bg-brand-500/5 px-4 py-3 text-sm text-brand-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
          {notice}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left: controls and editor */}
        <div className="space-y-5">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-white">Operation</h2>
            <div className="mt-4">
              <OperationSelector
                selectedId={operationId}
                onSelect={(id) => {
                  setOperationId(id)
                  setStatus('empty')
                  setResult(null)
                  setError(null)
                }}
                disabled={isRunning}
              />
            </div>
          </section>

          <section className="panel p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <LanguageSelector value={language} onChange={handleLanguageChange} disabled={isRunning} />

              {needsTargetLanguage(operationId) && (
                <LanguageSelector
                  id="target-language"
                  label="Convert to"
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                  disabled={isRunning}
                />
              )}
            </div>

            <div className="mt-4">
              <label className="label" htmlFor="prompt">
                {operationId === 'debug'
                  ? 'Error message (recommended)'
                  : operationId === 'generate'
                    ? 'What should CodeBot build?'
                    : operationId === 'convert'
                      ? 'Conversion notes (optional)'
                      : 'Extra instructions (optional)'}
              </label>
              <textarea
                id="prompt"
                className="input scroll-thin min-h-24 resize-y"
                rows={4}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder={
                  operationId === 'debug'
                    ? 'Paste the traceback or error message here.'
                    : 'Anything CodeBot should pay special attention to.'
                }
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <p className="mt-1 text-right text-xs text-slate-600">
                {prompt.length} / {MAX_PROMPT_LENGTH}
              </p>
            </div>

            <div className="mt-4">
              <EditorToolbar
                onRun={handleRun}
                onClear={handleClear}
                onSave={handleSave}
                isRunning={isRunning}
                hasCode={code.trim().length > 0}
              />
            </div>

            {codeTooLong && (
              <p className="mt-3 flex items-center gap-2 text-xs text-rose-300">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                {code.length} characters exceeds the {MAX_CODE_LENGTH} character limit.
              </p>
            )}
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <span className="font-mono text-xs text-slate-500">
                main.{language === 'cpp' ? 'cpp' : language === 'javascript' ? 'js' : language}
              </span>
              <span className="text-xs text-slate-600">Monaco editor</span>
            </div>
            <div className="h-[380px]">
              <CodeEditor
                value={code}
                onChange={(value) => setCode(value ?? '')}
                language={getMonacoLanguage(language)}
              />
            </div>
          </section>
        </div>

        {/* Right: result */}
        <section className="panel flex min-h-[520px] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Result</h2>
            {status === 'success' && (
              <span className="text-xs text-slate-600">Saved to history</span>
            )}
          </header>

          <div className="flex-1">
            <ResultPanel
              status={status}
              result={result}
              error={error}
              operationId={operationId}
              language={language}
              targetLanguage={targetLanguage}
            />
          </div>
        </section>
      </div>

      {/* Chat about the same code */}
      <ChatPanel
        messages={messages}
        onSend={handleSendChat}
        onClear={handleClearChat}
        isSending={chatStatus === 'sending'}
        error={chatError}
      />

      <ErrorMessage
        variant="info"
        title="Runs are saved to your account"
        message="Every run is stored in your history so you can reopen it later."
      />
    </div>
  )
}