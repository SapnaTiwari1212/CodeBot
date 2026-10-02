import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Review: summary plus the four review dimensions. */
export default function ReviewResult({ result }) {
  return (
    <div>
      <ResultSection title="Summary">{result.summary}</ResultSection>

      {result.issues?.length > 0 && (
        <ResultSection title="Issues">
          <ResultList items={result.issues} />
        </ResultSection>
      )}

      {result.security?.length > 0 && (
        <ResultSection title="Security">
          <ResultList items={result.security} />
        </ResultSection>
      )}

      {result.performance?.length > 0 && (
        <ResultSection title="Performance">
          <ResultList items={result.performance} />
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