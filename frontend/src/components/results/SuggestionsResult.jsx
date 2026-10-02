import CodeBlock from './CodeBlock.jsx'
import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Improve: an analysis, a list of improvements, and the improved code. */
export default function SuggestionsResult({ result, language }) {
  return (
    <div>
      {result.analysis && <ResultSection title="Analysis">{result.analysis}</ResultSection>}

      {result.improvements?.length > 0 && (
        <ResultSection title="Improvements">
          <ResultList items={result.improvements} />
        </ResultSection>
      )}

      <div className="mt-6">
        <CodeBlock code={result.improved_code} language={language} title="Improved code" />
      </div>

      {result.explanation && (
        <ResultSection title="Explanation">{result.explanation}</ResultSection>
      )}
    </div>
  )
}