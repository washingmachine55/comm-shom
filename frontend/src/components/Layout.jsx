import { NavLink, useNavigate } from 'react-router-dom'
import { Upload, Users, BarChart3, LogOut, BookOpen } from 'lucide-react'

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate()

  const logout = async () => {
    await fetch(`${BACKEND}/api/auth/logout', { method: 'POST', credentials: 'include' })
    onLogout()
  }

  const nav = [
    { to: '/upload', icon: Upload, label: 'Upload & Review' },
    { to: '/compare', icon: BarChart3, label: 'Class Compare' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop only */}
      <aside className="w-60 bg-ink-800 border-r border-ink-700 flex-col fixed h-full z-10 hidden md:flex">
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
      <main className="flex-1 md:ml-60 min-h-screen pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ink-800 border-t border-ink-700 flex md:hidden z-10">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-display transition-all ${
              isActive ? 'text-brand-300' : 'text-ink-400'
            }`
          }>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={logout} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-ink-400 font-display">
          <LogOut size={20} />
          <span>Sign out</span>
        </button>
      </nav>
    </div>
  )
}
