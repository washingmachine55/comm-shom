import { useState } from 'react'
import { BookOpen, AlertCircle } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
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
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-lg shadow-brand/30">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-50">Anki Tracker</h1>
          <p className="text-ink-400 text-sm mt-1">Communication Skills Dashboard</p>
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
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign in'}
            </button>
          </form>
          <p className="text-xs text-ink-500 text-center mt-4">Default: teacher / teach123</p>
        </div>
      </div>
    </div>
  )
}
