import { Link, Navigate, useParams } from 'react-router-dom'
import { Labrador } from '@/components/mascots/Labrador'
import { CHARACTERS, labById } from '@/data/curriculum/labs'
import { useStudent } from '@/hooks/useStudent'

export function LabDetail() {
  const { labId = '' } = useParams()
  const me = useStudent()
  const lab = labById(labId)
  if (!lab) return <Navigate to="/student/labs" replace />
  const c = CHARACTERS[lab.character]
  return (
    <div className="space-y-5">
      <header className="card graph-paper overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 bg-surface/80 p-6">
          <Labrador character={lab.character} equipped={lab.character === me.appearance.character ? me.appearance : {}} size={130} idle />
          <div>
            <p className="chip">Lab {lab.sequence} · {c.role}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold">{lab.name}</h1>
            <p className="text-soft">{lab.topic}. {lab.description}</p>
            <p className="mt-1 text-sm text-soft">{c.nickname} is {c.personality.toLowerCase()}.</p>
          </div>
        </div>
      </header>
      <section className="card p-5">
        <h2 className="mb-3 font-display text-xl font-bold">Lessons</h2>
        <ul className="space-y-2">
          {lab.lessons.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3">
              <div><p className="font-bold">{l.title}</p><p className="text-sm text-soft">{l.playable ? 'Interactive lesson with worked example, practice and checkpoint.' : 'Status: in development. Not yet available to students.'}</p></div>
              {l.playable ? <Link className="btn btn-primary" to="/student/lesson/gradient">Open lesson</Link> : <span className="chip">In development</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
