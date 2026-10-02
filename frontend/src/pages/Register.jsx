import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Terminal } from 'lucide-react'

import Button from '../components/common/Button.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { useAuth } from '../hooks/useAuth.js'

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (value) => /[a-zA-Z]/.test(value) },
  { id: 'number', label: 'Contains a number', test: (value) => /\d/.test(value) },
]

/** Create an account. Password confirmation is checked here before any request. */
export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const failedRules = useMemo(
    () => PASSWORD_RULES.filter((rule) => !rule.test(form.password)).map((rule) => rule.id),
    [form.password],
  )

  const passwordsMatch = form.password === form.confirmPassword

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (failedRules.length > 0) {
      setError('Choose a password that satisfies every requirement.')
      return
    }

    if (!passwordsMatch) {
      setError('The two passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="panel p-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500">
            <Terminal className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-white">Create your account</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Free to use. Your runs are saved to your private history.
        </p>

        {error && <ErrorMessage className="mt-5" title="Registration failed" message={error} />}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="input"
              placeholder="Alex Rivera"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = !failedRules.includes(rule.id)

                return (
                  <li
                    key={rule.id}
                    className={`text-xs ${passed ? 'text-emerald-300' : 'text-slate-500'}`}
                  >
                    {passed ? '✓' : '•'} {rule.label}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="input"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {form.confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-xs text-rose-300">The passwords do not match.</p>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-300 hover:text-brand-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}