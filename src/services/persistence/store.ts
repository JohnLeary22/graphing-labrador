import { useSyncExternalStore } from 'react'
import type { AttemptRecord, CharacterId, EconomyConfig, Equipped, Intervention, LessonPosition, MarkRecord, Role, Student, TeacherNote, Transaction } from '@/types'
import { DEFAULT_ECONOMY, makeId } from '@/lib/rewards/economy'
import { buildSeed, DEMO_STUDENT_ID, DEMO_STUDENTS, SEED_VERSION, STARTER_CHARACTER } from '@/data/demo/seed'
import { REMOVED_ITEM_PRICES } from '@/data/curriculum/shop'

/**
 * Demo data adapter: state lives in this browser only (localStorage). It is NOT shared between users or devices.
 * Production uses Supabase (see supabase/migrations) and must validate rewards, purchases and scoring on the server.
 */
export interface AppState {
  version: 1
  role: Role | null
  students: Student[]
  currentStudentId: string
  attempts: AttemptRecord[]
  transactions: Transaction[]
  inventory: Record<string, string[]>
  appearance: Record<string, Equipped & { character: CharacterId }>
  economy: EconomyConfig
  marks: Record<string, MarkRecord>
  notes: TeacherNote[]
  interventions: Intervention[]
  completedLessons: Record<string, string[]>
  /** studentId -> lessonId -> where the student is up to. Absent means "derive from attempts". */
  lessonState: Record<string, Record<string, LessonPosition>>
  /** Version of the fictional classmates' seeded data; older saves are refreshed without touching the real student. */
  seedVersion: number
  /** False until the demo student has entered their name. */
  nameChosen: boolean
  /** EDUC2151 workshop option: unlimited coins and showcase classmates. */
  creativeMode: boolean
  settings: { theme: 'light' | 'dark'; text: 'normal' | 'large'; leaderboard: boolean }
}

const KEY = 'graphing-labrador-demo-v1'

export const nowIso = () => new Date().toISOString()
export const todayKey = () => new Date().toISOString().slice(0, 10)

function initialState(): AppState {
  const seed = buildSeed()
  const welcome: Transaction = { id: makeId('tx'), studentId: DEMO_STUDENT_ID, type: 'COINS', amount: 30, reason: 'Welcome bonus', key: 'COINS:welcome', at: nowIso() }
  return {
    version: 1,
    role: null,
    students: DEMO_STUDENTS,
    currentStudentId: DEMO_STUDENT_ID,
    attempts: seed.attempts,
    transactions: [...seed.transactions, welcome],
    inventory: { [DEMO_STUDENT_ID]: [] },
    appearance: { [DEMO_STUDENT_ID]: { character: STARTER_CHARACTER } },
    economy: DEFAULT_ECONOMY,
    marks: seed.marks,
    notes: [],
    interventions: [],
    completedLessons: {},
    lessonState: {},
    seedVersion: SEED_VERSION,
    nameChosen: false,
    creativeMode: false,
    settings: { theme: 'dark', text: 'normal', leaderboard: true },
  }
}

/** Upgrades saved data in place so earlier progress is kept. */
function migrate(p: AppState): AppState {
  const economy = { ...DEFAULT_ECONOMY }
  for (const k of Object.keys(DEFAULT_ECONOMY) as (keyof EconomyConfig)[]) {
    const v = (p.economy as unknown as Record<string, unknown> | undefined)?.[k]
    if (typeof v === 'number') economy[k] = v
  }
  const students = [...p.students].sort((a, b) => Number(a.id === DEMO_STUDENT_ID) - Number(b.id === DEMO_STUDENT_ID))
  let { attempts, transactions, marks } = p
  if ((p.seedVersion ?? 1) < SEED_VERSION) {
    // Regenerate only the fictional classmates; the real student's attempts, coins and marks are kept.
    const seed = buildSeed()
    attempts = [...p.attempts.filter((a) => a.studentId === DEMO_STUDENT_ID), ...seed.attempts]
    transactions = [...p.transactions.filter((t) => t.studentId === DEMO_STUDENT_ID), ...seed.transactions]
    const ids = new Set(attempts.map((a) => a.id))
    marks = { ...seed.marks, ...Object.fromEntries(Object.entries(p.marks).filter(([id]) => ids.has(id))) }
  }
  // Coat colours were removed from the shop: refund any that were bought and clear them from the look.
  let inventory = p.inventory
  for (const [sid, items] of Object.entries(p.inventory)) {
    const gone = items.filter((id) => id in REMOVED_ITEM_PRICES)
    if (gone.length === 0) continue
    inventory = { ...inventory, [sid]: items.filter((id) => !(id in REMOVED_ITEM_PRICES)) }
    for (const id of gone) {
      if (transactions.some((t) => t.studentId === sid && t.key === `COINS:refund:${id}`)) continue
      transactions = [...transactions, { id: makeId('tx'), studentId: sid, type: 'COINS', amount: REMOVED_ITEM_PRICES[id], reason: 'Refund: coat colours were removed from the shop', key: `COINS:refund:${id}`, at: nowIso() }]
    }
  }
  const appearance = Object.fromEntries(Object.entries(p.appearance).map(([sid, a]) => [sid, Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'colour'))])) as AppState['appearance']
  return { ...p, economy, students, attempts, transactions, marks, inventory, appearance, lessonState: p.lessonState ?? {}, seedVersion: SEED_VERSION, nameChosen: p.nameChosen ?? false, creativeMode: p.creativeMode ?? false }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.version === 1) {
        const migrated = migrate(parsed)
        localStorage.setItem(KEY, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch {
    /* fall through to a fresh seed */
  }
  return initialState()
}

let state: AppState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function getState(): AppState {
  return state
}

export function update(fn: (s: AppState) => AppState): void {
  state = fn(state)
  persist()
  listeners.forEach((l) => l())
}

export function resetDemo(): void {
  state = initialState()
  persist()
  listeners.forEach((l) => l())
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )
}
