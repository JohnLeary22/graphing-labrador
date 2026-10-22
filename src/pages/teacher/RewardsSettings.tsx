import { useState } from 'react'
import { useAppState } from '@/services/persistence/store'
import { setEconomy, setSetting } from '@/services/persistence/actions'
import { DEFAULT_ECONOMY } from '@/lib/rewards/economy'
import { RewardRules } from '@/components/rewards/RewardRules'
import type { EconomyConfig } from '@/types'

const FIELDS: { key: keyof EconomyConfig; label: string; help: string }[] = [
  { key: 'dailyCheckIn', label: 'Daily check-in (coins)', help: 'Once per day.' },
  { key: 'checkpointComplete', label: 'Lesson complete (coins)', help: 'Once per lesson, separate from question rewards.' },
  { key: 'xpPerCheckpoint', label: 'Lesson complete (XP)', help: 'Once per lesson, separate from question rewards.' },
]

export function RewardsSettings() {
  const s = useAppState()
  const [draft, setDraft] = useState<EconomyConfig>(s.economy)
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Rewards settings</h1>
        <p className="text-soft">Per-question rewards are fixed so they always match what students are told. You can adjust the daily check-in and whole-lesson bonuses below.</p>
      </header>
      <section className="card p-5" aria-labelledby="qr-h">
        <h2 id="qr-h" className="mb-2 font-display text-xl font-bold">Question rewards (fixed)</h2>
        <RewardRules />
      </section>
      <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setEconomy(draft); setSaved(true) }}>
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span className="block font-semibold">{f.label}</span>
            <input className="input mt-1 w-28" type="number" min={0} max={500} value={draft[f.key]} onChange={(e) => { setSaved(false); setDraft({ ...draft, [f.key]: Math.max(0, Math.min(500, Number(e.target.value) || 0)) }) }} />
            {f.help && <span className="block text-xs text-soft">{f.help}</span>}
          </label>
        ))}
        <div className="flex items-center gap-2 md:col-span-2">
          <button className="btn btn-primary" type="submit">Save settings</button>
          <button className="btn" type="button" onClick={() => { setDraft(DEFAULT_ECONOMY); setSaved(false) }}>Restore defaults</button>
          {saved && <span role="status" className="text-sm font-semibold text-good">Saved.</span>}
        </div>
      </form>
      <section className="card p-5">
        <h2 className="font-display text-xl font-bold">Leaderboard</h2>
        <label className="mt-2 flex items-center gap-2">
          <input type="checkbox" checked={s.settings.leaderboard} onChange={(e) => setSetting('leaderboard', e.target.checked)} />
          Show the class leaderboard to students (display names only)
        </label>
        <p className="mt-2 text-sm text-soft">Real-world prizes must be set up and awarded by the teacher in line with school rules.</p>
      </section>
    </div>
  )
}
