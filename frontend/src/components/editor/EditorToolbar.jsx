import { Play, Save, Trash2 } from 'lucide-react'

import Button from '../common/Button.jsx'

/**
 * Run, Clear and Save controls.
 *
 * Run is disabled while a request is in flight so a slow AI response cannot be
 * triggered twice, which is the whole point of the disabled state.
 */
export default function EditorToolbar({
  onRun,
  onClear,
  onSave,
  isRunning = false,
  hasCode = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={onRun} disabled={isRunning || !hasCode}>
        <Play className="h-4 w-4" aria-hidden="true" />
        {isRunning ? 'CodeBot is thinking…' : 'Run CodeBot'}
      </Button>

      <Button variant="secondary" onClick={onClear} disabled={isRunning}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Clear
      </Button>

      <Button variant="ghost" size="sm" onClick={onSave} disabled={isRunning || !hasCode}>
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
        Save to history
      </Button>
    </div>
  )
}