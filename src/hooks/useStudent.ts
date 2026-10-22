import { useMemo } from 'react'
import { useAppState } from '@/services/persistence/store'
import { balanceOf, levelFromXp, xpIntoLevel } from '@/lib/rewards/economy'
import { itemById } from '@/data/curriculum/shop'

/** Derived view of the signed-in demo student. */
export function useStudent() {
  const s = useAppState()
  return useMemo(() => {
    const id = s.currentStudentId
    const student = s.students.find((x) => x.id === id)!
    const coins = balanceOf(s.transactions, id, 'COINS')
    const xp = balanceOf(s.transactions, id, 'XP')
    const earned = s.transactions.filter((t) => t.studentId === id && t.type === 'COINS' && t.amount > 0).reduce((a, t) => a + t.amount, 0)
    const spent = s.transactions.filter((t) => t.studentId === id && t.type === 'COINS' && t.amount < 0).reduce((a, t) => a - t.amount, 0)
    const owned = s.inventory[id] ?? []
    const appearance = s.appearance[id] ?? { character: 'vector' as const }
    const unlockedCharacters = ['vector', ...owned.map((o) => itemById(o)?.character).filter(Boolean)] as string[]
    const attempts = s.attempts.filter((a) => a.studentId === id)
    return {
      state: s, id, student, coins, xp, level: levelFromXp(xp), xpInto: xpIntoLevel(xp), earned, spent, owned, appearance,
      unlockedCharacters, attempts, completed: s.completedLessons[id] ?? [],
      transactions: s.transactions.filter((t) => t.studentId === id).slice().reverse(),
    }
  }, [s])
}
