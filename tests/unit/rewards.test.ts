import { describe, expect, it } from 'vitest'
import { QUESTION_REWARDS, balanceOf, purchase, rewardForCheckIn, rewardForCheckpoint, rewardsForAttempt, DEFAULT_ECONOMY, levelFromXp } from '@/lib/rewards/economy'
import { SHOP_ITEMS } from '@/data/curriculum/shop'
import type { AttemptRecord, Transaction } from '@/types'

let n = 0
const attempt = (over: Partial<AttemptRecord> = {}): AttemptRecord => ({
  id: `a${++n}`, studentId: 's1', questionId: 'q1', lessonId: 'l', stage: 'YOU_DO', skillIds: ['x'], response: '1', isCorrect: false,
  marks: 0, maxMarks: 1, attemptNumber: 1, hintsUsed: 0, at: '2026-01-01T00:00:00.000Z', ...over,
})
const sum = (txs: Transaction[], type: 'COINS' | 'XP') => txs.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0)

function play(results: boolean[], questionId = 'q1') {
  let ledger: Transaction[] = []
  const history: AttemptRecord[] = []
  results.forEach((isCorrect, i) => {
    const a = attempt({ questionId, isCorrect, marks: isCorrect ? 1 : 0, attemptNumber: i + 1 })
    ledger = [...ledger, ...rewardsForAttempt(a, history, ledger)]
    history.push(a)
  })
  return { coins: sum(ledger, 'COINS'), xp: sum(ledger, 'XP'), ledger }
}

describe('per-question rewards (exact rules)', () => {
  it('constants match the rules', () => {
    expect(QUESTION_REWARDS.correctFirstTry).toEqual({ coins: 10, xp: 5 })
    expect(QUESTION_REWARDS.incorrectFirstTry).toEqual({ coins: 3, xp: 1 })
    expect(QUESTION_REWARDS.correctAfterIncorrect).toEqual({ coins: 5, xp: 2 })
    expect(QUESTION_REWARDS.laterIncorrect).toEqual({ coins: 0, xp: 0 })
  })
  it('correct on the first attempt = 10 coins, 5 XP', () => expect(play([true])).toMatchObject({ coins: 10, xp: 5 }))
  it('incorrect on the first attempt = 3 coins, 1 XP', () => expect(play([false])).toMatchObject({ coins: 3, xp: 1 }))
  it('later incorrect attempts = 0', () => expect(play([false, false, false, false])).toMatchObject({ coins: 3, xp: 1 }))
  it('wrong then correct = 8 coins, 3 XP in total', () => expect(play([false, true])).toMatchObject({ coins: 8, xp: 3 }))
  it('wrong, wrong, wrong, correct = 8 coins, 3 XP in total', () => expect(play([false, false, false, true])).toMatchObject({ coins: 8, xp: 3 }))
  it('anything after completion = 0', () => {
    expect(play([true, true, false, true, false])).toMatchObject({ coins: 10, xp: 5 })
    expect(play([false, true, true, false, true])).toMatchObject({ coins: 8, xp: 3 })
  })
  it('questions are tracked independently', () => {
    const a = play([false, true], 'qa')
    const b = play([true], 'qb')
    expect(a.coins + b.coins).toBe(18)
  })
  it('does not duplicate when the same attempt is replayed against a reloaded ledger', () => {
    const first = attempt({ isCorrect: true })
    const ledger = rewardsForAttempt(first, [], [])
    expect(rewardsForAttempt(attempt({ isCorrect: true }), [first], ledger)).toEqual([])
    expect(rewardsForAttempt(attempt({ isCorrect: true }), [], ledger)).toEqual([])
    const wrongOnce = attempt()
    const l2 = rewardsForAttempt(wrongOnce, [], [])
    expect(rewardsForAttempt(attempt(), [], l2)).toEqual([])
  })
  it('invalid input is not an attempt and earns nothing, nor uses up the first-attempt reward', () => {
    const bad = attempt({ errorTag: 'invalid-input' })
    expect(rewardsForAttempt(bad, [], [])).toEqual([])
    expect(sum(rewardsForAttempt(attempt(), [bad], []), 'COINS')).toBe(3)
  })
  it('a written response is never treated as correct: it earns the first-attempt amount once', () => {
    const open = attempt({ pendingMarking: true })
    const l = rewardsForAttempt(open, [], [])
    expect(sum(l, 'COINS')).toBe(3)
    expect(sum(l, 'XP')).toBe(1)
    expect(rewardsForAttempt(attempt({ pendingMarking: true }), [open], l)).toEqual([])
  })
  it('never produces a negative reward', () => expect(play([false, true]).ledger.every((t) => t.amount > 0)).toBe(true))
})

describe('daily and lesson rewards', () => {
  it('awards the check-in once per date', () => {
    const first = rewardForCheckIn('s1', '2026-01-01', [], DEFAULT_ECONOMY, 'now')
    expect(first).toHaveLength(1)
    expect(rewardForCheckIn('s1', '2026-01-01', first, DEFAULT_ECONOMY, 'now')).toHaveLength(0)
    expect(rewardForCheckIn('s1', '2026-01-02', first, DEFAULT_ECONOMY, 'now')).toHaveLength(1)
  })
  it('awards the lesson bonus once', () => {
    const first = rewardForCheckpoint('s1', 'gradient', [], DEFAULT_ECONOMY, 'now')
    expect(sum(first, 'COINS')).toBe(DEFAULT_ECONOMY.checkpointComplete)
    expect(rewardForCheckpoint('s1', 'gradient', first, DEFAULT_ECONOMY, 'now')).toHaveLength(0)
  })
})

describe('shop purchases', () => {
  const cheap = SHOP_ITEMS.reduce((a, b) => (a.price <= b.price ? a : b))
  const ledger = (amount: number): Transaction[] => [{ id: 't', studentId: 's1', type: 'COINS', amount, reason: 'x', key: 'COINS:x', at: 'now' }]
  it('deducts the exact price', () => {
    const res = purchase('s1', cheap, [], ledger(100), 'now')
    expect(res.ok).toBe(true)
    if (res.ok) expect(balanceOf([...ledger(100), res.transaction], 's1', 'COINS')).toBe(100 - cheap.price)
  })
  it('rejects low balance and repeat purchases', () => {
    expect(purchase('s1', cheap, [], ledger(cheap.price - 1), 'now')).toEqual({ ok: false, error: 'insufficient' })
    expect(purchase('s1', cheap, [cheap.id], ledger(1000), 'now')).toEqual({ ok: false, error: 'owned' })
  })
  it('has at least 15 cosmetics, one affordable from the starter bonus', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(15)
    expect(cheap.price).toBeLessThanOrEqual(30)
  })
  it('level rises every 100 XP', () => {
    expect(levelFromXp(99)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
  })
})
