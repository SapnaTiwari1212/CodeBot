import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Explain: summary, explanation, line by line, concepts, suggestions. */
export default function ExplanationResult({ result }) {
  return (
    <div>
      <ResultSection title="Summary">{result.summary}</ResultSection>

      {result.explanation && (
        <ResultSection title="Explanation">{result.explanation}</ResultSection>
      )}

      {result.line_by_line?.length > 0 && (
        <ResultSection title="Line by line">
          <ResultList items={result.line_by_line} />
        </ResultSection>
      )}

      {result.concepts?.length > 0 && (
        <ResultSection title="Concepts">
          <ResultList items={result.concepts} />
        </ResultSection>
      )}

      {result.suggestions?.length > 0 && (
        <ResultSection title="Suggestions">
          <ResultList items={result.suggestions} />
        </ResultSection>
      )}
    </div>
  )
}