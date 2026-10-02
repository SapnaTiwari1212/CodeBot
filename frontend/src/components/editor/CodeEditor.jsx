import Editor from '@monaco-editor/react'

/**
 * Monaco wrapper for the workspace and the history detail view.
 *
 * Monaco itself is loaded by @monaco-editor/react from a CDN at runtime, so the
 * bundle stays small. The `vs-dark` theme matches the rest of the product.
 */
export default function CodeEditor({
  value,
  onChange,
  language = 'python',
  height = '100%',
  readOnly = false,
}) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        readOnly,
        fontSize: 13.5,
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 14, bottom: 14 },
        renderLineHighlight: 'line',
        automaticLayout: true,
        tabSize: 4,
        wordWrap: 'on',
      }}
    />
  )
}