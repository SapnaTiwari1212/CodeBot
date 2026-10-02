import { Link } from 'react-router-dom'
import { ArrowRight, Rocket, Sparkles, Terminal, Zap } from 'lucide-react'

import { FEATURED_OPERATION_IDS, OPERATIONS } from '../utils/operations.js'

const WORKFLOW = [
  { id: 1, title: 'Write or paste code', body: 'Start from a sample or paste your own snippet.' },
  { id: 2, title: 'Select language', body: 'Python, JavaScript, Java, C, C++, HTML, CSS or SQL.' },
  { id: 3, title: 'Select AI operation', body: 'Eleven operations, each with its own purpose-built prompt.' },
  { id: 4, title: 'Run CodeBot', body: 'The backend validates, calls the model and checks the reply.' },
  { id: 5, title: 'Understand and improve', body: 'Read the result, apply the code, then ask follow ups in chat.' },
]

const PROOF_POINTS = [
  { value: '11', label: 'AI operations' },
  { value: '8', label: 'Languages' },
  { value: 'JWT', label: 'Private history' },
]

function HeroPreview() {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/5 bg-ink-850/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-500/70" />
        <span className="h-3 w-3 rounded-full bg-amber-500/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
        <span className="ml-2 flex items-center gap-1.5 font-mono text-xs text-slate-500">
          <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          checkout.py
        </span>
        <span className="ml-auto rounded-md bg-brand-500/15 px-2 py-0.5 text-[11px] font-medium text-brand-200">
          Refactor
        </span>
      </div>

      <div className="grid gap-px bg-white/5 sm:grid-cols-2">
        <div className="bg-ink-950/60 p-4 font-mono text-[12.5px] leading-relaxed text-slate-400">
          <p>
            <span className="text-violet-300">def</span>{' '}
            <span className="text-sky-300">checkout</span>(cart, user):
          </p>
          <p className="pl-4">
            <span className="text-violet-300">total</span> ={' '}
            <span className="text-emerald-300">0</span>
          </p>
          <p className="pl-4">
            <span className="text-violet-300">for</span> item{' '}
            <span className="text-violet-300">in</span> cart:
          </p>
          <p className="pl-8">
            total = total + item[<span className="text-amber-300">&quot;price&quot;</span>]
          </p>
          <p className="pl-4">
            <span className="text-violet-300">if</span> user.is_vip:
          </p>
          <p className="pl-8">
            total = total * <span className="text-orange-300">0.9</span>
          </p>
          <p className="pl-4">
            <span className="text-violet-300">return</span> total
          </p>
        </div>

        <div className="space-y-3 bg-ink-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Result
          </p>
          <div className="space-y-2">
            <div className="h-2 w-11/12 rounded-full bg-white/10" />
            <div className="h-2 w-full rounded-full bg-white/10" />
            <div className="h-2 w-9/12 rounded-full bg-white/10" />
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
              <Zap className="h-3 w-3" aria-hidden="true" />
              Extracted the discount rule
            </p>
          </div>
          <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-brand-200">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              apply_discount(total, user)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const featuredOperations = FEATURED_OPERATION_IDS.map((id) =>
    OPERATIONS.find((operation) => operation.id === id),
  )

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="grid items-center gap-12 py-10 lg:grid-cols-2 lg:py-16">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            Your AI coding assistant
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Code smarter with{' '}
            <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">
              CodeBot
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            CodeBot helps programmers understand, debug, improve, generate and optimize
            code. Paste a snippet, choose an operation, and get a structured answer with
            reasoning and code you can actually use.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-primary">
              <Rocket className="h-4 w-4" aria-hidden="true" />
              Start Coding
            </Link>
            <a href="#features" className="btn-secondary">
              Explore Features
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <dl className="mt-10 flex flex-wrap gap-8">
            {PROOF_POINTS.map((point) => (
              <div key={point.label}>
                <dt className="sr-only">{point.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold text-white">{point.value}</span>
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    {point.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up">
          <HeroPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="max-w-2xl">
          <p className="eyebrow">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Ten ways to work with your code
          </h2>
          <p className="mt-3 text-slate-400">
            Each operation is backed by its own prompt, so the answer stays focused instead
            of generic.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredOperations.map((operation) => {
            const Icon = operation.icon

            return (
              <Link
                key={operation.id}
                to={`/workspace?operation=${operation.id}`}
                className="panel group p-5 transition hover:border-brand-400/40 hover:bg-ink-850/80"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${operation.chipClass}`}
                  >
                    <Icon className={`h-5 w-5 ${operation.iconClass}`} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{operation.label}</h3>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      {operation.tagline}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {operation.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-300 opacity-0 transition group-hover:opacity-100">
                  Try it
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            )
          })}

          <Link
            to="/register"
            className="panel flex flex-col items-start justify-center gap-2 border-dashed p-5 transition hover:border-brand-400/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-200 ring-1 ring-inset ring-brand-500/30">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-semibold text-white">Plus AI Chat</h3>
            <p className="text-sm text-slate-400">
              Ask follow up questions about the code in your editor.
            </p>
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section>
        <div className="max-w-2xl">
          <p className="eyebrow">Workflow</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            From paste to improved code
          </h2>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW.map((step) => (
            <li key={step.id} className="panel p-5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-sm font-semibold text-brand-200">
                {step.id}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="panel overflow-hidden p-10 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Stop guessing what your code does
          </h2>
          <p className="mt-3 text-slate-400">
            Create an account and run your first operation. It takes about a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary">
              <Rocket className="h-4 w-4" aria-hidden="true" />
              Start Coding
            </Link>
            <Link to="/workspace" className="btn-secondary">
              Try the workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}