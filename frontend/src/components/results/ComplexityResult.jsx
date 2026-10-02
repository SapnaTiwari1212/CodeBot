import ResultList from './ResultList.jsx'
import ResultSection from './ResultSection.jsx'

/** Complexity and Optimize: the Big O picture and what drives it. */
export default function ComplexityResult({ result }) {
  const isOptimize = Boolean(result.optimized_complexity)

  return (
    <div>
      {isOptimize ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current
              </p>
              <p className="mt-2 font-mono text-lg text-amber-200">{result.current_complexity}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Optimized
              </p>
              <p className="mt-2 font-mono text-lg text-emerald-200">{result.optimized_complexity}</p>
            </div>
          </div>

          {result.optimization_explanation && (
            <ResultSection title="What changed and why">
              {result.optimization_explanation}
            </ResultSection>
          )}
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="panel-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Time complexity
            </p>
            <p className="mt-2 font-mono text-lg text-teal-200">{result.time_complexity}</p>
          </div>
          <div className="panel-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Space complexity
            </p>
            <p className="mt-2 font-mono text-lg text-brand-200">{result.space_complexity}</p>
          </div>
        </div>
      )}

      {result.explanation && <ResultSection title="Explanation">{result.explanation}</ResultSection>}

      {result.bottlenecks?.length > 0 && (
        <ResultSection title="Bottlenecks">
          <ResultList items={result.bottlenecks} />
        </ResultSection>
      )}
    </div>
  )
}