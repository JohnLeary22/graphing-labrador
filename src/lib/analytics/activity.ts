import type { AttemptRecord, MarkRecord, Stage, Student } from '@/types'
import { ALL_LESSON_QUESTIONS } from '@/data/lessons/gradient'

export const STAGE_LABELS: Record<Stage, string> = {
  HOOK: 'Warm-up', WE_DO: 'We do', YOU_DO: 'You do', NON_EXAMPLE: 'Spot the mistake', APPLICATION: 'Real world', CHECKPOINT: 'Checkpoint', REFLECTION: 'Reflection',
}

export interface ActivityEvent {
  key: string
  studentName: string
  stageLabel: string
  verb: 'completed' | 'submitted' | 'attempted'
  at: string
  status?: 'to mark' | 'marked'
}

const done = (a: AttemptRecord) => a.isCorrect || !!a.pendingMarking

/**
 * One event per student and lesson stage, built only from recorded attempts.
 * "completed" means every question in the stage has a correct (or submitted written) attempt.
 * Anything less is reported as "attempted". The think-aloud stage records no data, so it never appears.
 */
export function recentActivity(attempts: AttemptRecord[], students: Student[], marks: Record<string, MarkRecord>, limit = 6): ActivityEvent[] {
  const events: ActivityEvent[] = []
  const stages = [...new Set(ALL_LESSON_QUESTIONS.map((q) => q.stage))]
  for (const student of students) {
    const mine = attempts.filter((a) => a.studentId === student.id)
    for (const stage of stages) {
      const qs = ALL_LESSON_QUESTIONS.filter((q) => q.stage === stage)
      const inStage = mine.filter((a) => qs.some((q) => q.id === a.questionId))
      if (inStage.length === 0) continue
      const completionTimes = qs.map((q) => inStage.filter((a) => a.questionId === q.id && done(a)).map((a) => a.at).sort()[0])
      const complete = completionTimes.every(Boolean)
      const written = qs.every((q) => q.type === 'EXPLAIN_REASONING')
      const at = complete ? (completionTimes as string[]).sort().slice(-1)[0] : inStage.map((a) => a.at).sort().slice(-1)[0]
      const status = written ? (inStage.some((a) => a.pendingMarking && marks[a.id]) ? 'marked' : 'to mark') : undefined
      events.push({
        key: `${student.id}:${stage}`,
        studentName: student.displayName,
        stageLabel: STAGE_LABELS[stage],
        verb: complete ? (written ? 'submitted' : 'completed') : 'attempted',
        at,
        status: complete ? status : undefined,
      })
    }
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}
