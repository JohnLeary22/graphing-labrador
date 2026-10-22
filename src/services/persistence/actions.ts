import type { AttemptRecord, EvaluationResult, Intervention, Point, Question, Transaction } from '@/types'
import { evaluate } from '@/lib/scoring/evaluate'
import { balanceOf, purchase, rewardForCheckIn, rewardForCheckpoint, rewardsForAttempt, makeId } from '@/lib/rewards/economy'
import { itemById } from '@/data/curriculum/shop'
import { getState, nowIso, todayKey, update } from './store'
import type { AppState } from './store'
import type { CharacterId, EconomyConfig, Equipped, LessonPosition, MarkRecord, Role } from '@/types'

export function signIn(role: Role) {
  update((s) => ({ ...s, role }))
}
export function signOut() {
  update((s) => ({ ...s, role: null }))
}

/** Saves where the student is in a lesson, so leaving and returning resumes at the same place. */
export function saveLessonPosition(studentId: string, lessonId: string, pos: LessonPosition) {
  update((cur) => ({
    ...cur,
    lessonState: { ...cur.lessonState, [studentId]: { ...cur.lessonState[studentId], [lessonId]: pos } },
  }))
}

/** Replays a finished lesson. Questions already completed earn nothing again. */
export function restartLessonForRevision(studentId: string, lessonId: string) {
  saveLessonPosition(studentId, lessonId, { stepIdx: 0, qIdx: 0, thinkN: 1, complete: false, revision: true })
}

/** Renames the browser's demo student in place; attempts, coins, XP and inventory stay linked by id. */
export function setStudentName(studentId: string, raw: string): boolean {
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, 30)
  if (!name) return false
  update((cur) => ({
    ...cur,
    nameChosen: true,
    students: cur.students.map((s) => (s.id === studentId ? { ...s, name, displayName: name } : s)),
  }))
  return true
}

export interface SubmitOutcome {
  result: EvaluationResult
  rewards: Transaction[]
  attempt: AttemptRecord
}

/** Scores, records and rewards one attempt in a single state update, so a reward can never be granted without the attempt. */
export function submitAttempt(studentId: string, lessonId: string, q: Question, response: string | Point, hintsUsed: number): SubmitOutcome {
  const s = getState()
  const result = evaluate(q, response)
  const previous = s.attempts.filter((a) => a.studentId === studentId && a.questionId === q.id)
  const attempt: AttemptRecord = {
    id: makeId('att'),
    studentId,
    questionId: q.id,
    lessonId,
    stage: q.stage,
    skillIds: q.skillIds,
    response: typeof response === 'string' ? response : `(${response.x}, ${response.y})`,
    isCorrect: result.correct,
    marks: result.marks,
    maxMarks: q.maxMarks,
    attemptNumber: previous.length + 1,
    hintsUsed,
    errorTag: result.tag,
    pendingMarking: result.pendingMarking,
    at: nowIso(),
  }
  const rewards = rewardsForAttempt(attempt, previous, s.transactions)
  update((cur) => ({ ...cur, attempts: [...cur.attempts, attempt], transactions: [...cur.transactions, ...rewards] }))
  return { result, rewards, attempt }
}

export function claimCheckIn(studentId: string): Transaction[] {
  const s = getState()
  const rewards = rewardForCheckIn(studentId, todayKey(), s.transactions, s.economy, nowIso())
  if (rewards.length) update((cur) => ({ ...cur, transactions: [...cur.transactions, ...rewards] }))
  return rewards
}

export function completeLesson(studentId: string, lessonId: string): Transaction[] {
  const s = getState()
  const rewards = rewardForCheckpoint(studentId, lessonId, s.transactions, s.economy, nowIso())
  update((cur) => ({
    ...cur,
    transactions: [...cur.transactions, ...rewards],
    completedLessons: { ...cur.completedLessons, [studentId]: [...new Set([...(cur.completedLessons[studentId] ?? []), lessonId])] },
  }))
  return rewards
}

export function buyItem(studentId: string, itemId: string): { ok: true } | { ok: false; error: 'owned' | 'insufficient' | 'unknown' } {
  const item = itemById(itemId)
  const s = getState()
  if (!item) return { ok: false, error: 'unknown' }
  const owned = s.inventory[studentId] ?? []
  const res = purchase(studentId, item, owned, s.transactions, nowIso())
  if (!res.ok) return res
  update((cur) => ({
    ...cur,
    transactions: [...cur.transactions, res.transaction],
    inventory: { ...cur.inventory, [studentId]: [...owned, item.id] },
  }))
  return { ok: true }
}

export function equipItem(studentId: string, slot: keyof Equipped, itemId: string | undefined) {
  const s = getState()
  if (itemId && !(s.inventory[studentId] ?? []).includes(itemId)) return
  update((cur) => ({
    ...cur,
    appearance: { ...cur.appearance, [studentId]: { ...cur.appearance[studentId], [slot]: itemId } },
  }))
}

export function setCharacter(studentId: string, character: CharacterId) {
  const s = getState()
  const unlocked = character === 'vector' || (s.inventory[studentId] ?? []).some((id) => itemById(id)?.character === character)
  if (!unlocked) return
  update((cur) => ({ ...cur, appearance: { ...cur.appearance, [studentId]: { ...cur.appearance[studentId], character } } }))
}

export function resetAppearance(studentId: string) {
  update((cur) => ({ ...cur, appearance: { ...cur.appearance, [studentId]: { character: cur.appearance[studentId]?.character ?? 'vector' } } }))
}

export function coinsFor(s: AppState, studentId: string) {
  return balanceOf(s.transactions, studentId, 'COINS')
}

export function markAttempt(record: MarkRecord) {
  update((cur) => ({ ...cur, marks: { ...cur.marks, [record.attemptId]: record } }))
}

export function addNote(studentId: string, note: string) {
  if (!note.trim()) return
  update((cur) => ({ ...cur, notes: [...cur.notes, { id: makeId('note'), studentId, note: note.trim(), at: nowIso() }] }))
}

export function assignIntervention(i: Omit<Intervention, 'id' | 'at' | 'status'> & { status?: Intervention['status'] }) {
  update((cur) => ({ ...cur, interventions: [...cur.interventions, { id: makeId('int'), at: nowIso(), status: 'assigned', ...i }] }))
}

export function setInterventionStatus(id: string, status: Intervention['status']) {
  update((cur) => ({ ...cur, interventions: cur.interventions.map((i) => (i.id === id ? { ...i, status } : i)) }))
}

export function setEconomy(economy: EconomyConfig) {
  update((cur) => ({ ...cur, economy }))
}

export function setSetting<K extends keyof AppState['settings']>(key: K, value: AppState['settings'][K]) {
  update((cur) => ({ ...cur, settings: { ...cur.settings, [key]: value } }))
}
