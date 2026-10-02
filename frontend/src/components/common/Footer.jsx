import { Link } from 'react-router-dom'
import { Terminal } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-ink-950/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-brand-400" aria-hidden="true" />
          <span className="text-slate-400">CodeBot</span>
          <span>QuillBot-style AI assistance for working code.</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <Link to="/workspace" className="hover:text-slate-200">
            Workspace
          </Link>
          <Link to="/history" className="hover:text-slate-200">
            History
          </Link>
          <Link to="/profile" className="hover:text-slate-200">
            Profile
          </Link>
        </nav>
      </div>
    </footer>
  )
}