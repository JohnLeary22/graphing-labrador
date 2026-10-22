import { Link } from 'react-router-dom'
import { Labrador } from '@/components/mascots/Labrador'
import { CHARACTERS, labById } from '@/data/curriculum/labs'
import type { Lab } from '@/data/curriculum/labs'
import { useStudent } from '@/hooks/useStudent'

const ORDER = ['vector', 'vertex', 'axis', 'slope', 'curve'] as const

function LabCard({ lab }: { lab: Lab }) {
  const me = useStudent()
  const c = CHARACTERS[lab.character]
  const playable = lab.lessons.some((l) => l.playable)
  return (
    <li className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-brand">
      <div className="graph-paper relative">
        <div className="flex items-center justify-center bg-surface/70 py-4" style={{ boxShadow: `inset 0 -4px 0 ${c.accent}` }}>
          <Labrador character={lab.character} equipped={lab.character === me.appearance.character ? me.appearance : {}} size={120} showBackground={false} idle={playable} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-display text-xl font-bold">{lab.name}</h2>
        <p className="text-sm font-semibold text-brand">with {c.nickname} the Labrador</p>
        <p className="text-sm text-soft">{lab.topic}. {lab.description}</p>
        <div className="mt-auto pt-3">
          {playable ? (
            <Link to={`/student/labs/${lab.id}`} className="btn btn-primary w-full">Open {lab.name}</Link>
          ) : (
            <span className="chip w-full justify-center !py-1.5">In Development</span>
          )}
        </div>
      </div>
    </li>
  )
}

export function LabsMap() {
  const labs = ORDER.map((id) => labById(id)!)
  return (
    <div className="space-y-5">
      <header className="card graph-paper overflow-hidden">
        <div className="bg-surface/80 p-6">
          <p className="chip mb-2">Your world</p>
          <h1 className="font-display text-3xl font-extrabold">Vector Lab</h1>
          <p className="max-w-2xl text-soft">Five labs sit on one coordinate grid, each led by its own Labrador. Slope Lab is open now. The others are being built.</p>
        </div>
      </header>
      <ul className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
        {labs.map((lab) => <LabCard key={lab.id} lab={lab} />)}
      </ul>
      <p className="text-sm text-soft">Slope Lab (Slobber) has a complete playable lesson. The other labs are still under construction :/</p>
    </div>
  )
}
