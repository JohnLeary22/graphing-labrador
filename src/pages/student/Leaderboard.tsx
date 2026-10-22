import { Labrador } from '@/components/mascots/Labrador'
import { useAppState } from '@/services/persistence/store'
import { balanceOf } from '@/lib/rewards/economy'
import { DEMO_STUDENT_ID } from '@/data/demo/seed'

/** Class leaderboard on XP using display names only. The teacher can switch it off in Rewards Settings. */
export function Leaderboard() {
  const s = useAppState()
  if (!s.settings.leaderboard) {
    return <div className="card p-6"><h1 className="font-display text-2xl font-bold">Leaderboard</h1><p className="mt-2 text-soft">Your teacher has turned the leaderboard off for this class.</p></div>
  }
  const rows = s.students
    .map((st) => ({ st, xp: balanceOf(s.transactions, st.id, 'XP') }))
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp)
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Leaderboard</h1>
        <p className="text-soft">XP earned for genuine attempts and successes (not time spent). Display names only.</p>
      </header>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.st.id} className={`card flex items-center gap-3 p-3 ${r.st.id === DEMO_STUDENT_ID ? '!border-brand' : ''}`}>
            <span className="w-8 text-center font-display text-xl font-extrabold">{i + 1}</span>
            <Labrador character={s.appearance[r.st.id]?.character ?? 'vector'} equipped={s.appearance[r.st.id]} size={44} showBackground={false} label="" />
            <span className="flex-1 font-semibold">{r.st.displayName}{r.st.id === DEMO_STUDENT_ID ? ' (you)' : ''}</span>
            <span className="chip">{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
