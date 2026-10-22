import { useMemo } from 'react'
import { useAppState } from '@/services/persistence/store'
import { ALL_LESSON_QUESTIONS, GRADIENT_LESSON_ID } from '@/data/lessons/gradient'
import { SKILLS } from '@/data/curriculum/skills'
import { diagnosticSummary, lessonProgress, misconceptionEvidence, summariseSkill } from '@/lib/analytics/diagnostics'
import type { AttemptRecord, Student } from '@/types'

const CHECKPOINT_IDS = ALL_LESSON_QUESTIONS.filter((q) => q.stage === 'CHECKPOINT').map((q) => q.id)

export type Status = 'not-started' | 'in-progress' | 'submitted'

export interface StudentRow {
  student: Student
  attempts: AttemptRecord[]
  status: Status
  progress: ReturnType<typeof lessonProgress>
  skills: ReturnType<typeof summariseSkill>[]
  evidence: ReturnType<typeof misconceptionEvidence>
  needsSupport: boolean
  summary: string
  lastActive: string | null
}

/** Everything the teacher views are built from: real attempts in the store, not pre-baked numbers. */
export function useClassData() {
  const s = useAppState()
  return useMemo(() => {
    const ids = ALL_LESSON_QUESTIONS.map((q) => q.id)
    const rows: StudentRow[] = s.students.map((student) => {
      const attempts = s.attempts.filter((a) => a.studentId === student.id)
      const attempted = new Set(attempts.map((a) => a.questionId))
      const status: Status = attempts.length === 0 ? 'not-started' : CHECKPOINT_IDS.every((id) => attempted.has(id)) ? 'submitted' : 'in-progress'
      const skills = SKILLS.map((k) => summariseSkill(k.id, attempts))
      const evidence = misconceptionEvidence(attempts)
      const calc = skills.find((k) => k.skillId === 'gradient-calc')!
      const needsSupport = evidence.some((e) => e.status === 'likely') || (calc.level === 'emerging' && calc.attempts > 0)
      return {
        student, attempts, status, progress: lessonProgress(attempts, GRADIENT_LESSON_ID, ids), skills, evidence, needsSupport,
        summary: diagnosticSummary(student.displayName, calc, evidence),
        lastActive: attempts.length ? attempts[attempts.length - 1].at : null,
      }
    })
    return { rows, state: s }
  }, [s])
}
