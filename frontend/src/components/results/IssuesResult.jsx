import CodeBlock from './CodeBlock.jsx'
import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/**
 * Fix and Debug share a shape: some prose, a list of errors, and corrected code.
 * The text above the list differs between the two, so it is passed in as
 * `heading` and `intro`.
 */
export default function IssuesResult({ result, heading = 'Problem', language }) {
  const intro = result.problem ?? result.root_cause ?? result.summary
  const solution = result.solution

  return (
    <div>
      {intro && <ResultSection title={heading}>{intro}</ResultSection>}

      {result.errors?.length > 0 && (
        <ResultSection title="Detected errors">
          <ResultList items={result.errors} />
        </ResultSection>
      )}

      {solution && <ResultSection title="Solution">{solution}</ResultSection>}

      <div className="mt-6">
        <CodeBlock
          code={result.fixed_code}
          language={language}
          title="Fixed code"
        />
      </div>

      {result.explanation && (
        <ResultSection title="Explanation">{result.explanation}</ResultSection>
      )}
    </div>
  )
}