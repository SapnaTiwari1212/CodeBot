import CodeBlock from './CodeBlock.jsx'
import ResultSection from './ResultSection.jsx'

/**
 * Generate: approach, code, explanation, usage.
 * Also renders Optimize's optimized_code, which is why it takes a `title`.
 */
export default function GeneratedCode({ result, language, title = 'Generated code' }) {
  return (
    <div>
      {result.approach && <ResultSection title="Approach">{result.approach}</ResultSection>}

      <div className="mt-6">
        <CodeBlock code={result.code ?? result.optimized_code} language={language} title={title} />
      </div>

      {result.explanation && (
        <ResultSection title="Explanation">{result.explanation}</ResultSection>
      )}

      {result.usage && <ResultSection title="How to use it">{result.usage}</ResultSection>}
    </div>
  )
}