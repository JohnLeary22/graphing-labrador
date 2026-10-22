import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, RotateCcw } from 'lucide-react'
import { Labrador } from '@/components/mascots/Labrador'
import { ThemeControls } from '@/components/layout/Layouts'
import { CHARACTERS } from '@/data/curriculum/labs'
import { resetDemo } from '@/services/persistence/store'
import { DEMO_DISCLAIMER } from '@/data/copy'
import { signIn } from '@/services/persistence/actions'
import type { CharacterId, Role } from '@/types'

export function Landing() {
  const navigate = useNavigate()
  const go = (role: Role) => { signIn(role); navigate(`/${role}`) }
  return (
    <div className="graph-paper min-h-screen">
      <div className="min-h-screen bg-bg/85 px-4 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl justify-end"><ThemeControls /></div>
        <main className="mx-auto grid max-w-6xl items-center gap-10 py-10 md:grid-cols-2">
          <div>
            <p className="chip mb-4">Year 8 / Stage 4 Mathematics · Linear relationships · Vector Lab</p>
            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">Graphing Labrador</h1>
            <p className="mt-4 max-w-lg text-lg text-soft">
              Explore graphs by moving them, calculate with evidence of your thinking, and earn rewards for genuine effort. Teachers see what students understand, and why.
            </p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
              <button className="btn btn-primary !py-3 text-base" onClick={() => go('student')}><GraduationCap size={20} /> Enter as Demo Student</button>
              <button className="btn btn-accent !py-3 text-base" onClick={() => go('teacher')}><BookOpen size={20} /> Enter as Demo Teacher</button>
            </div>
            <p className="mt-4 max-w-lg text-sm text-soft">
              {DEMO_DISCLAIMER}
            </p>
            <button className="btn mt-3 text-sm" onClick={() => { if (confirm('Reset all demo data to the starting state?')) resetDemo() }}>
              <RotateCcw size={16} /> Reset demo data
            </button>
          </div>
          <div className="card p-6">
            <div className="flex flex-wrap items-end justify-center gap-3">
              {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
                <div key={id} className="text-center">
                  <Labrador character={id} size={id === 'vector' ? 150 : 100} idle={id === 'vector'} />
                  <p className="mt-1 text-xs font-bold">{CHARACTERS[id].nickname}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-soft">Five Labradors, five labs, one world.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
