/**
 * Turns a structured CodeBot result into flat blocks the UI can render.
 *
 * Each operation returns a different shape from the backend. Rather than
 * teaching every result component about every operation, each component reads
 * the keys it cares about. This module holds the shared rules: which language a
 * code block belongs to, how to flatten a result into text for the clipboard,
 * and which sections an operation is expected to show.
 */

/** Keys that hold code, in the order they should be rendered. */
export const CODE_KEYS = [
  'fixed_code',
  'refactored_code',
  'improved_code',
  'optimized_code',
  'converted_code',
  'code',
]

/** Keys that hold a list of bullet points. */
export const LIST_KEYS = [
  'line_by_line',
  'concepts',
  'suggestions',
  'errors',
  'improvements',
  'changes',
  'bottlenecks',
  'issues',
  'security',
  'performance',
  'notes',
]

/** Keys that hold a paragraph of text. */
export const TEXT_KEYS = [
  'summary',
  'explanation',
  'problem',
  'root_cause',
  'solution',
  'analysis',
  'approach',
  'usage',
  'current_complexity',
  'optimized_complexity',
  'optimization_explanation',
  'time_complexity',
  'space_complexity',
]

/** Labels used when a list key is rendered as a section heading. */
export const LIST_LABELS = {
  line_by_line: 'Line by line',
  concepts: 'Concepts',
  suggestions: 'Suggestions',
  errors: 'Detected errors',
  improvements: 'Improvements',
  changes: 'Changes made',
  bottlenecks: 'Bottlenecks',
  issues: 'Issues',
  security: 'Security',
  performance: 'Performance',
  notes: 'Notes',
}

/** Language to highlight a given result key with. */
export function getCodeLanguage(operationId, targetLanguage) {
  if (operationId === 'convert' && targetLanguage) return targetLanguage
  return 'plaintext'
}

/**
 * Flatten a result into plain text for the copy button.
 * Sections are separated by blank lines so the clipboard stays readable.
 */
export function resultToPlainText(result) {
  if (!result) return ''

  const parts = []

  for (const key of TEXT_KEYS) {
    if (typeof result[key] === 'string' && result[key].trim()) {
      parts.push(result[key].trim())
    }
  }

  for (const key of LIST_KEYS) {
    if (Array.isArray(result[key]) && result[key].length > 0) {
      const heading = LIST_LABELS[key] ?? key
      parts.push(`${heading}:\n${result[key].map((item) => `- ${item}`).join('\n')}`)
    }
  }

  for (const key of CODE_KEYS) {
    if (typeof result[key] === 'string' && result[key].trim()) {
      parts.push(result[key].trim())
    }
  }

  return parts.join('\n\n')
}

/** First code block found in a result, used for compact previews. */
export function getPrimaryCode(result) {
  if (!result) return null

  for (const key of CODE_KEYS) {
    if (typeof result[key] === 'string' && result[key].trim()) {
      return result[key]
    }
  }

  return null
}

/** Short one line preview of a code snippet for list cards. */
export function getCodePreview(sourceCode, maxLength = 120) {
  if (!sourceCode) return 'No code captured'
  const firstLine = sourceCode.split('\n').find((line) => line.trim()) ?? ''
  return firstLine.length > maxLength ? `${firstLine.slice(0, maxLength)}…` : firstLine
}