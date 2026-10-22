import type { AttemptRecord, EconomyConfig, ShopItem, Transaction } from '@/types'

/** Fixed per-question rewards. Not configurable, so settings pages can never contradict the calculation. */
export const QUESTION_REWARDS = {
  correctFirstTry: { coins: 10, xp: 5 },
  incorrectFirstTry: { coins: 3, xp: 1 },
  correctAfterIncorrect: { coins: 5, xp: 2 },
  laterIncorrect: { coins: 0, xp: 0 },
  afterCompletion: { coins: 0, xp: 0 },
} as const

export const DEFAULT_ECONOMY: EconomyConfig = {
  dailyCheckIn: 5,
  checkpointComplete: 40,
  xpPerCheckpoint: 50,
}

export const XP_PER_LEVEL = 100

export const balanceOf = (txs: Transaction[], studentId: string, type: 'COINS' | 'XP'): number =>
  txs.filter((t) => t.studentId === studentId && t.type === type).reduce((sum, t) => sum + t.amount, 0)

export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
export const xpIntoLevel = (xp: number) => xp % XP_PER_LEVEL

const INVALID_TAGS = new Set(['invalid-input', 'too-short'])

let counter = 0
export function makeId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

function tx(studentId: string, type: 'COINS' | 'XP', amount: number, reason: string, key: string, at: string): Transaction {
  return { id: makeId('tx'), studentId, type, amount, reason, key: `${type}:${key}`, at }
}

/**
 * Per question and student (attempts at the question are counted; invalid input is not an attempt):
 *  - correct on the first attempt:            10 coins + 5 XP
 *  - incorrect on the first attempt:           3 coins + 1 XP
 *  - later incorrect attempts:                 0
 *  - first correct after incorrect attempts:   5 coins + 2 XP
 *  - anything after a correct completion:      0
 * A written response is never correct by submission: it earns the first-attempt amount once and nothing more.
 * Reward keys plus the saved attempt history make this idempotent across refreshes and rapid clicks.
 */
export function rewardsForAttempt(
  attempt: AttemptRecord,
  previousAttempts: AttemptRecord[],
  existing: Transaction[],
): Transaction[] {
  if (attempt.errorTag && INVALID_TAGS.has(attempt.errorTag)) return []
  const seen = new Set(existing.filter((t) => t.studentId === attempt.studentId).map((t) => t.key))
  const q = attempt.questionId
  const mine = previousAttempts.filter((a) => a.studentId === attempt.studentId && a.questionId === q && !INVALID_TAGS.has(a.errorTag ?? ''))
  const issued = (k: string) => seen.has(`COINS:${k}:${q}`) || seen.has(`XP:${k}:${q}`)
  const completed = mine.some((a) => a.isCorrect) || issued('correct-first') || issued('correct-retry') || issued('correct') || issued('success')
  if (completed) return []
  const isFirst = mine.length === 0 && !issued('incorrect-first') && !issued('incorrect') && !issued('attempt')
  const out: Transaction[] = []
  const grant = (r: { coins: number; xp: number }, reason: string, key: string) => {
    if (r.coins > 0) out.push(tx(attempt.studentId, 'COINS', r.coins, reason, `${key}:${q}`, attempt.at))
    if (r.xp > 0) out.push(tx(attempt.studentId, 'XP', r.xp, reason, `${key}:${q}`, attempt.at))
  }
  if (attempt.isCorrect) {
    if (mine.length === 0) grant(QUESTION_REWARDS.correctFirstTry, 'Correct first try', 'correct-first')
    else grant(QUESTION_REWARDS.correctAfterIncorrect, 'Correct after trying again', 'correct-retry')
  } else if (isFirst) {
    grant(QUESTION_REWARDS.incorrectFirstTry, attempt.pendingMarking ? 'Written response submitted' : 'First attempt', 'incorrect-first')
  }
  return out
}

export function rewardForCheckpoint(studentId: string, lessonId: string, existing: Transaction[], economy: EconomyConfig, at: string): Transaction[] {
  const seen = new Set(existing.filter((t) => t.studentId === studentId).map((t) => t.key))
  const out: Transaction[] = []
  const key = `checkpoint:${lessonId}`
  if (!seen.has(`COINS:${key}`)) out.push(tx(studentId, 'COINS', economy.checkpointComplete, 'Lesson checkpoint complete', key, at))
  if (!seen.has(`XP:${key}`)) out.push(tx(studentId, 'XP', economy.xpPerCheckpoint, 'Lesson checkpoint complete', key, at))
  return out
}

export function rewardForCheckIn(studentId: string, dateKey: string, existing: Transaction[], economy: EconomyConfig, at: string): Transaction[] {
  const key = `checkin:${dateKey}`
  if (existing.some((t) => t.studentId === studentId && t.key === `COINS:${key}`)) return []
  return [tx(studentId, 'COINS', economy.dailyCheckIn, 'Daily check-in', key, at)]
}

export type PurchaseResult = { ok: true; transaction: Transaction } | { ok: false; error: 'owned' | 'insufficient' }

/** Validates a purchase against the ledger; the caller applies the transaction and inventory update together. */
export function purchase(studentId: string, item: ShopItem, owned: string[], txs: Transaction[], at: string): PurchaseResult {
  if (owned.includes(item.id)) return { ok: false, error: 'owned' }
  if (balanceOf(txs, studentId, 'COINS') < item.price) return { ok: false, error: 'insufficient' }
  return { ok: true, transaction: tx(studentId, 'COINS', -item.price, `Purchased ${item.name}`, `purchase:${item.id}`, at) }
}
