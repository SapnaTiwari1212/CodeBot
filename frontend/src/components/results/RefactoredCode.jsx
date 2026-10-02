import CodeBlock from './CodeBlock.jsx'
import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Refactor: what changed, the refactored code, and why. */
export default function RefactoredCode({ result, language }) {
  return (
    <div>
      {result.changes?.length > 0 && (
        <ResultSection title="Changes">
          <ResultList items={result.changes} />
        </ResultSection>
      )}

      <div className="mt-6">
        <CodeBlock code={result.refactored_code} language={language} title="Refactored code" />
      </div>

      {result.explanation && (
        <ResultSection title="Explanation">{result.explanation}</ResultSection>
      )}
    </div>
  )
}