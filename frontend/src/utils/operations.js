/**
 * The eleven AI operations CodeBot offers.
 *
 * Each `id` is what the backend validates against and what the prompts are
 * keyed by. The tailwind class names are written out in full on purpose: a
 * dynamically built class name like `text-${color}` is invisible to Tailwind's
 * scanner and would be dropped from the build.
 */
import {
  ArrowLeftRight,
  BookOpen,
  Bug,
  ClipboardCheck,
  Clock,
  Gauge,
  MessagesSquare,
  Repeat,
  Sparkles,
  Wand2,
  Wrench,
} from 'lucide-react'

export const OPERATIONS = [
  {
    id: 'explain',
    label: 'Explain',
    tagline: 'Understand unfamiliar code',
    description: 'Walks through what the code does, step by step, in plain language.',
    icon: BookOpen,
    iconClass: 'text-sky-300',
    chipClass: 'bg-sky-500/10 text-sky-200 ring-sky-500/30',
    resultView: 'explanation',
  },
  {
    id: 'fix',
    label: 'Fix',
    tagline: 'Repair broken code',
    description: 'Finds what is wrong and returns a corrected, runnable version.',
    icon: Wrench,
    iconClass: 'text-emerald-300',
    chipClass: 'bg-emerald-500/10 text-emerald-200 ring-emerald-500/30',
    resultView: 'issues',
  },
  {
    id: 'debug',
    label: 'Debug',
    tagline: 'Trace the root cause',
    description: 'Reads the code together with your error message and explains the cause.',
    icon: Bug,
    iconClass: 'text-rose-300',
    chipClass: 'bg-rose-500/10 text-rose-200 ring-rose-500/30',
    resultView: 'issues',
  },
  {
    id: 'improve',
    label: 'Improve',
    tagline: 'Make it clearer',
    description: 'Suggests readability and structure improvements without changing behaviour.',
    icon: Sparkles,
    iconClass: 'text-violet-300',
    chipClass: 'bg-violet-500/10 text-violet-200 ring-violet-500/30',
    resultView: 'suggestions',
  },
  {
    id: 'refactor',
    label: 'Refactor',
    tagline: 'Restructure safely',
    description: 'Reshapes the code into cleaner units while keeping the same behaviour.',
    icon: Repeat,
    iconClass: 'text-cyan-300',
    chipClass: 'bg-cyan-500/10 text-cyan-200 ring-cyan-500/30',
    resultView: 'refactored',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    tagline: 'Make it faster',
    description: 'Targets performance bottlenecks and proposes measurable changes.',
    icon: Gauge,
    iconClass: 'text-amber-300',
    chipClass: 'bg-amber-500/10 text-amber-200 ring-amber-500/30',
    resultView: 'complexity',
  },
  {
    id: 'generate',
    label: 'Generate',
    tagline: 'Write it from scratch',
    description: 'Generates new code from your description, ready to review and adapt.',
    icon: Wand2,
    iconClass: 'text-fuchsia-300',
    chipClass: 'bg-fuchsia-500/10 text-fuchsia-200 ring-fuchsia-500/30',
    resultView: 'generated',
  },
  {
    id: 'convert',
    label: 'Convert',
    tagline: 'Port between languages',
    description: 'Translates your code into another language, keeping the same behaviour.',
    icon: ArrowLeftRight,
    iconClass: 'text-indigo-300',
    chipClass: 'bg-indigo-500/10 text-indigo-200 ring-indigo-500/30',
    resultView: 'converted',
    needsTargetLanguage: true,
  },
  {
    id: 'complexity',
    label: 'Complexity',
    tagline: 'Big O and bottlenecks',
    description: 'Reports time and space complexity and points out what drives it.',
    icon: Clock,
    iconClass: 'text-teal-300',
    chipClass: 'bg-teal-500/10 text-teal-200 ring-teal-500/30',
    resultView: 'complexity',
  },
  {
    id: 'review',
    label: 'Review',
    tagline: 'Senior-level feedback',
    description: 'Reviews correctness, security, performance and style like a code review.',
    icon: ClipboardCheck,
    iconClass: 'text-lime-300',
    chipClass: 'bg-lime-500/10 text-lime-200 ring-lime-500/30',
    resultView: 'review',
  },
  {
    id: 'chat',
    label: 'Chat',
    tagline: 'Ask about this code',
    description: 'Hold a conversation about the code in the editor and follow up freely.',
    icon: MessagesSquare,
    iconClass: 'text-brand-300',
    chipClass: 'bg-brand-500/10 text-brand-200 ring-brand-500/30',
    resultView: 'chat',
  },
]

export const OPERATION_IDS = OPERATIONS.map((operation) => operation.id)

/** Operations that appear as cards on the landing page and dashboard. */
export const FEATURED_OPERATION_IDS = OPERATION_IDS.filter((id) => id !== 'chat')

/** Look up an operation by id, or return null when it is not supported. */
export function getOperation(id) {
  return OPERATIONS.find((operation) => operation.id === id) ?? null
}

/** Human readable label for an operation id, falling back to the raw id. */
export function getOperationLabel(id) {
  return getOperation(id)?.label ?? id
}

/** True when the operation needs a second language, as Convert does. */
export function needsTargetLanguage(operationId) {
  return Boolean(getOperation(operationId)?.needsTargetLanguage)
}