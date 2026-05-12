import { NavLink, useNavigate } from 'react-router-dom'
import { Upload, Users, BarChart3, LogOut, BookOpen } from 'lucide-react'

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate()

  const logout = async () => {
    await fetch('http://localhost:3001/api/auth/logout', { method: 'POST', credentials: 'include' })
    onLogout()
  }

  const nav = [
    { to: '/upload', icon: Upload, label: 'Upload & Review' },
    { to: '/compare', icon: BarChart3, label: 'Class Compare' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-ink-800 border-r border-ink-700 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-ink-50">Anki Tracker</p>
              <p className="text-xs text-ink-400">Communication Skills</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display transition-all ${
                isActive
                  ? 'bg-brand/20 text-brand-300 font-medium'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-ink-700'
              }`
            }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-900 flex items-center justify-center text-xs font-display font-semibold text-brand-300">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display text-ink-100 truncate">{user.name}</p>
              <p className="text-xs text-ink-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all font-display">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
