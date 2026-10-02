/** Section heading used inside result panels. */
export default function ResultSection({ title, children }) {
  return (
    <section className="mt-6 first:mt-0">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-300">{title}</h4>
      <div className="mt-2 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  )
}