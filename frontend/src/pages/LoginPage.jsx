import { useState } from 'react'
import { BookOpen, AlertCircle } from 'lucide-react'

import process from "node:process"

process.loadEnvFile("../.env")
const BACKEND = process.env.FRONTEND_URL;

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-ink-900">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4 shadow-lg w-14 h-14 rounded-2xl bg-brand shadow-brand/30">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold font-display text-ink-50">Anki Tracker</h1>
          <p className="mt-1 text-sm text-ink-400">Communication Skills Dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 px-3 py-2.5 rounded-lg">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            <div>
              <label className="label mb-1.5 block">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-ink-900 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 font-body placeholder-ink-500 focus:outline-none focus:border-brand transition-colors"
                placeholder="teacher"
                autoFocus
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-ink-900 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 font-body placeholder-ink-500 focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="flex items-center justify-center w-full gap-2 mt-2 btn-primary">
              {loading ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
