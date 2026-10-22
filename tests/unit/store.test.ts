import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, resetDemo, update } from '@/services/persistence/store'
import { buyItem, equipItem, setCharacter, submitAttempt, coinsFor, markAttempt, setStudentName } from '@/services/persistence/actions'
import { questionById } from '@/data/lessons/gradient'
import { DEMO_STUDENT_ID, DEMO_STUDENTS } from '@/data/demo/seed'
import { balanceOf } from '@/lib/rewards/economy'
import { INCORRECT_MESSAGE, CORRECT_MESSAGE } from '@/lib/scoring/messages'

const S = DEMO_STUDENT_ID
const q = (id: string) => questionById(id)!
const xp = () => balanceOf(getState().transactions, S, 'XP')

beforeEach(() => resetDemo())

describe('attempt submission and rewards', () => {
  it('shows the exact messages', () => {
    expect(submitAttempt(S, 'gradient', q('grad-youdo-1'), '2', 0).result.feedback).toBe(INCORRECT_MESSAGE)
    expect(submitAttempt(S, 'gradient', q('grad-youdo-1'), '1/2', 0).result.feedback).toBe(CORRECT_MESSAGE)
  })
  it('pays 3 coins + 1 XP for the first incorrect attempt, then nothing for more wrong answers', () => {
    const before = coinsFor(getState(), S)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '2', 0)
    expect(coinsFor(getState(), S)).toBe(before + 3)
    expect(xp()).toBe(1)
    for (let i = 0; i < 10; i++) submitAttempt(S, 'gradient', q('grad-youdo-1'), '99', 0)
    expect(coinsFor(getState(), S)).toBe(before + 3)
    expect(xp()).toBe(1)
  })
  it('pays 10 coins and 5 XP once for the first correct answer and never again', () => {
    const before = coinsFor(getState(), S)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    expect(coinsFor(getState(), S)).toBe(before + 10)
    expect(xp()).toBe(5)
    for (let i = 0; i < 5; i++) submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    expect(coinsFor(getState(), S)).toBe(before + 10)
    expect(xp()).toBe(5)
  })
  it('wrong then right is 8 coins and 3 XP in total', () => {
    const before = coinsFor(getState(), S)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '2', 0)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    expect(coinsFor(getState(), S)).toBe(before + 8)
    expect(xp()).toBe(3)
  })
  it('does not duplicate rewards after a page refresh (state reloaded from storage)', () => {
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    const saved = localStorage.getItem('graphing-labrador-demo-v1')!
    const coins = coinsFor(getState(), S)
    // Simulate a refresh: replace in-memory state with what was persisted, then resubmit.
    update(() => JSON.parse(saved))
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    expect(coinsFor(getState(), S)).toBe(coins)
  })
  it('records hints used and increments the attempt number', () => {
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '2', 0)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 2)
    const mine = getState().attempts.filter((a) => a.studentId === S)
    expect(mine.map((a) => a.attemptNumber)).toEqual([1, 2])
    expect(mine[1].hintsUsed).toBe(2)
  })
  it('does not reward invalid input', () => {
    const before = coinsFor(getState(), S)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), 'abc', 0)
    expect(coinsFor(getState(), S)).toBe(before)
  })
  it('never reduces the balance after a wrong answer', () => {
    const before = coinsFor(getState(), S)
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '99', 0)
    expect(coinsFor(getState(), S)).toBeGreaterThanOrEqual(before)
  })
  it('saves state to localStorage', () => {
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    const saved = JSON.parse(localStorage.getItem('graphing-labrador-demo-v1')!)
    expect(saved.attempts.some((a: { studentId: string }) => a.studentId === S)).toBe(true)
  })
})

describe('student name', () => {
  it('starts with no name chosen', () => expect(getState().nameChosen).toBe(false))
  it('rejects empty and whitespace-only names', () => {
    expect(setStudentName(S, '')).toBe(false)
    expect(setStudentName(S, '    ')).toBe(false)
    expect(getState().nameChosen).toBe(false)
  })
  it('saves a trimmed name and persists it in browser storage', () => {
    expect(setStudentName(S, '   Alex   Kim ')).toBe(true)
    const st = getState().students.find((s) => s.id === S)!
    expect(st.name).toBe('Alex Kim')
    expect(st.displayName).toBe('Alex Kim')
    const saved = JSON.parse(localStorage.getItem('graphing-labrador-demo-v1')!)
    expect(saved.nameChosen).toBe(true)
    expect(saved.students.find((s: { id: string }) => s.id === S).displayName).toBe('Alex Kim')
  })
  it('limits very long names', () => {
    setStudentName(S, 'x'.repeat(200))
    expect(getState().students.find((s) => s.id === S)!.name.length).toBe(30)
  })
  it('renaming keeps progress, coins, XP and inventory, without duplicating anything', () => {
    setStudentName(S, 'Alex')
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    buyItem(S, 'neck-bandana')
    const snap = () => ({
      attempts: getState().attempts.filter((a) => a.studentId === S).length,
      coins: coinsFor(getState(), S),
      xp: xp(),
      owned: [...(getState().inventory[S] ?? [])],
      students: getState().students.length,
      txs: getState().transactions.length,
    })
    const before = snap()
    setStudentName(S, 'Sam')
    setStudentName(S, 'Sam Jr')
    expect(snap()).toEqual(before)
    expect(getState().students.find((s) => s.id === S)!.displayName).toBe('Sam Jr')
  })
  it('is the tenth student, alongside nine fictional students, shown last in the class', () => {
    const students = getState().students
    expect(students).toHaveLength(10)
    expect(students[students.length - 1].id).toBe(S)
    expect(students.filter((s) => s.id !== S)).toHaveLength(9)
    expect(DEMO_STUDENTS[DEMO_STUDENTS.length - 1].id).toBe(S)
  })
  it('the new name appears in teacher-facing data (class list and attempts link by id)', () => {
    setStudentName(S, 'Alex')
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '2', 0)
    const s = getState()
    const attempt = s.attempts.find((a) => a.studentId === S)!
    expect(s.students.find((x) => x.id === attempt.studentId)!.name).toBe('Alex')
  })
  it('saved data from before this feature is upgraded without losing progress', async () => {
    submitAttempt(S, 'gradient', q('grad-youdo-1'), '0.5', 0)
    const old = JSON.parse(localStorage.getItem('graphing-labrador-demo-v1')!)
    delete old.nameChosen
    old.economy = { dailyCheckIn: 5, eligibleAttempt: 3, firstSuccess: 5, improvementBonus: 5, checkpointComplete: 40, xpPerAttempt: 3, xpPerSuccess: 5, xpPerCheckpoint: 50 }
    old.students = [old.students.find((s: { id: string }) => s.id === S), ...old.students.filter((s: { id: string }) => s.id !== S)]
    localStorage.setItem('graphing-labrador-demo-v1', JSON.stringify(old))
    vi.resetModules()
    const fresh = await import('@/services/persistence/store')
    const st = fresh.getState()
    expect(st.nameChosen).toBe(false)
    expect(st.economy.dailyCheckIn).toBe(5)
    expect(st.economy.checkpointComplete).toBe(40)
    expect(st.students[st.students.length - 1].id).toBe(S)
    expect(st.attempts.some((a) => a.studentId === S)).toBe(true)
  })
})

describe('shop and kennel', () => {
  it('buys an item, deducts coins and adds it to the inventory', () => {
    const before = coinsFor(getState(), S)
    expect(buyItem(S, 'neck-bandana')).toEqual({ ok: true })
    expect(coinsFor(getState(), S)).toBe(before - 25)
    expect(getState().inventory[S]).toContain('neck-bandana')
  })
  it('refuses a second purchase of the same item', () => {
    buyItem(S, 'neck-bandana')
    const coins = coinsFor(getState(), S)
    expect(buyItem(S, 'neck-bandana')).toEqual({ ok: false, error: 'owned' })
    expect(coinsFor(getState(), S)).toBe(coins)
  })
  it('refuses when the balance is too low', () => {
    expect(buyItem(S, 'hat-crown')).toEqual({ ok: false, error: 'insufficient' })
    expect(balanceOf(getState().transactions, S, 'COINS')).toBeGreaterThanOrEqual(0)
  })
  it('only equips owned items and persists the equipped item', () => {
    equipItem(S, 'neckwear', 'neck-bandana')
    expect(getState().appearance[S].neckwear).toBeUndefined()
    buyItem(S, 'neck-bandana')
    equipItem(S, 'neckwear', 'neck-bandana')
    expect(getState().appearance[S].neckwear).toBe('neck-bandana')
  })
  it('only switches to unlocked characters', () => {
    setCharacter(S, 'slope')
    expect(getState().appearance[S].character).toBe('vector')
  })
})

describe('teacher data', () => {
  it('seeds ten students with attempts from real question data', () => {
    const s = getState()
    expect(s.students).toHaveLength(10)
    expect(s.attempts.length).toBeGreaterThan(50)
    expect(s.attempts.every((a) => questionById(a.questionId))).toBe(true)
  })
  it('seeds some open responses awaiting marking', () => {
    const s = getState()
    expect(s.attempts.filter((a) => a.pendingMarking && !s.marks[a.id]).length).toBeGreaterThan(0)
  })
  it('stores marks against the attempt', () => {
    const a = getState().attempts.find((x) => x.pendingMarking && !getState().marks[x.id])!
    markAttempt({ attemptId: a.id, scores: { 'correct-interpretation': 1 }, comment: 'ok', released: true, total: 1 })
    expect(getState().marks[a.id].released).toBe(true)
  })
})
