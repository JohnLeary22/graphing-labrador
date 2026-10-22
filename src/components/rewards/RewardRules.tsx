import { QUESTION_REWARDS as R } from '@/lib/rewards/economy'

const fmt = (r: { coins: number; xp: number }) => `${r.coins} coins + ${r.xp} XP`

/** The single place reward rules are described, so every page matches the calculation in lib/rewards/economy.ts. */
export const REWARD_RULE_ROWS: { when: string; reward: string }[] = [
  { when: 'Correct on your first attempt', reward: fmt(R.correctFirstTry) },
  { when: 'Incorrect on your first attempt', reward: fmt(R.incorrectFirstTry) },
  { when: 'Incorrect on any later attempt', reward: fmt(R.laterIncorrect) },
  { when: 'First correct answer after one or more incorrect attempts', reward: fmt(R.correctAfterIncorrect) },
  { when: 'Any attempt after the question is completed', reward: fmt(R.afterCompletion) },
]

export function RewardRules({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <ul className={`list-disc space-y-1 pl-5 text-sm ${compact ? 'text-soft' : ''}`}>
        {REWARD_RULE_ROWS.map((r) => <li key={r.when}>{r.when}: <strong>{r.reward}</strong></li>)}
      </ul>
      <p className="mt-2 text-xs text-soft">
        Coins are spent in the shop. XP builds your level. Each rule applies once per question. Written responses never count as correct by being submitted.
      </p>
    </div>
  )
}
