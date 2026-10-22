import { useEffect } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, FlaskConical, Home, LogOut, Map, Moon, ShoppingBag, Sun, Trophy, TrendingUp, Users, Type, Dog, Coins, Library, ClipboardCheck, Settings2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppState } from '@/services/persistence/store'
import { setSetting, signIn, signOut } from '@/services/persistence/actions'
import { Labrador } from '@/components/mascots/Labrador'
import { useStudent } from '@/hooks/useStudent'
import { NamePrompt } from '@/pages/student/NamePrompt'

function useApplySettings() {
  const { settings } = useAppState()
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.text = settings.text
  }, [settings.theme, settings.text])
}

export function ThemeControls() {
  const { settings } = useAppState()
  return (
    <div className="flex gap-1">
      <button className="btn !px-2.5 !py-1.5" aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}>
        {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button className="btn !px-2.5 !py-1.5" aria-pressed={settings.text === 'large'} aria-label="Toggle larger text" onClick={() => setSetting('text', settings.text === 'large' ? 'normal' : 'large')}>
        <Type size={18} />
      </button>
    </div>
  )
}

export function AppRoot({ children }: { children: ReactNode }) {
  useApplySettings()
  return <>{children}</>
}

interface NavItem { to: string; label: string; icon: ReactNode; end?: boolean }

function Shell({ items, role, badge }: { items: NavItem[]; role: 'student' | 'teacher'; badge: ReactNode }) {
  const navigate = useNavigate()
  const other = role === 'student' ? 'teacher' : 'student'
  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">Skip to main content</a>
      <aside className="no-print border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-3 md:block">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-ink"><FlaskConical size={18} /></span>
            Graphing Labrador
          </Link>
          <div className="md:mt-3">{badge}</div>
        </div>
        <nav aria-label={`${role} navigation`} className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:pb-0">
          {items.map((i) => (
            <NavLink
              key={i.to} to={i.to} end={i.end}
              className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand text-brand-ink' : 'text-soft hover:bg-surface-2 hover:text-ink'}`}
            >
              {i.icon}{i.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-2 px-3 py-4 md:block">
          <ThemeControls />
          <div className="rounded-lg border border-dashed border-line p-2 text-xs text-soft">
            <p className="font-semibold text-ink">Demo mode</p>
            <p>Data is saved in this browser only.</p>
            <button className="btn mt-2 w-full !py-1 text-xs" onClick={() => { signIn(other); navigate(`/${other}`) }}>
              Switch to demo {other}
            </button>
          </div>
          <button className="btn w-full !py-1.5 text-sm" onClick={() => { signOut(); navigate('/') }}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="no-print flex items-center justify-end gap-2 border-b border-line px-4 py-2 md:hidden">
          <ThemeControls />
          <button className="btn !py-1.5 text-sm" onClick={() => { signIn(other); navigate(`/${other}`) }}>Switch to {other}</button>
          <button className="btn !px-2.5 !py-1.5" aria-label="Sign out" onClick={() => { signOut(); navigate('/') }}><LogOut size={16} /></button>
        </header>
        <main id="main" className="mx-auto max-w-6xl p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}

export function StudentLayout() {
  const me = useStudent()
  if (me.state.role !== 'student') return <Navigate to="/" replace />
  if (!me.state.nameChosen) return <NamePrompt studentId={me.id} />
  const items: NavItem[] = [
    { to: '/student', label: 'Dashboard', icon: <Home size={18} />, end: true },
    { to: '/student/labs', label: 'My Labs', icon: <Map size={18} /> },
    { to: '/student/progress', label: 'My Progress', icon: <TrendingUp size={18} /> },
    { to: '/student/kennel', label: 'My Kennel', icon: <Dog size={18} /> },
    { to: '/student/shop', label: 'Reward Shop', icon: <ShoppingBag size={18} /> },
    { to: '/student/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
  ]
  const badge = (
    <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-2">
      <Labrador character={me.appearance.character} equipped={me.appearance} size={44} showBackground={false} />
      <div className="text-xs leading-tight">
        <p className="font-bold">{me.student.displayName}</p>
        <p className="flex items-center gap-1 text-soft"><Coins size={12} /> {me.coins} coins · Lv {me.level}</p>
      </div>
    </div>
  )
  return <Shell items={items} role="student" badge={badge} />
}

export function TeacherLayout() {
  const { role } = useAppState()
  if (role !== 'teacher') return <Navigate to="/" replace />
  const items: NavItem[] = [
    { to: '/teacher', label: 'Dashboard', icon: <Home size={18} />, end: true },
    { to: '/teacher/students', label: 'Students', icon: <Users size={18} /> },
    { to: '/teacher/lessons', label: 'Lesson Library', icon: <Library size={18} /> },
    { to: '/teacher/marking', label: 'Results & Marking', icon: <ClipboardCheck size={18} /> },
    { to: '/teacher/rewards', label: 'Rewards Settings', icon: <Settings2 size={18} /> },
  ]
  const badge = (
    <div className="flex items-center gap-2 rounded-lg border border-accent/60 bg-accent-soft p-2 text-xs leading-tight">
      <BookOpen size={20} className="text-accent" />
      <div><p className="font-bold">Teacher portal</p><p className="text-soft">Mr John Leary</p></div>
    </div>
  )
  return <Shell items={items} role="teacher" badge={badge} />
}
