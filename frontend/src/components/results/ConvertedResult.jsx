import CodeBlock from './CodeBlock.jsx'
import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Convert: the converted code plus notes about behaviour differences. */
export default function ConvertedResult({ result, targetLanguage }) {
  return (
    <div>
      <div className="panel-muted flex flex-wrap items-center gap-2 p-4 text-sm">
        <span className="font-medium text-slate-300">{result.source_language}</span>
        <span className="text-slate-600">→</span>
        <span className="font-medium text-brand-200">{result.target_language}</span>
      </div>

      <div className="mt-4">
        <CodeBlock
          code={result.converted_code}
          language={targetLanguage}
          title="Converted code"
        />
      </div>

      {result.notes?.length > 0 && (
        <ResultSection title="Notes">
          <ResultList items={result.notes} />
        </ResultSection>
      )}
    </div>
  )
}