import type { AttemptRecord, LessonPosition } from '@/types'

export const START_POSITION: LessonPosition = { stepIdx: 0, qIdx: 0, thinkN: 1, complete: false, revision: false }

const isDone = (attempts: AttemptRecord[], questionId: string) => attempts.some((a) => a.questionId === questionId && (a.isCorrect || a.pendingMarking))

/**
 * Works out where a student is up to from their saved attempts. Used for saves made before lesson positions
 * were stored, so earlier progress is kept instead of restarting the lesson.
 */
export function derivePosition(steps: { questions: { id: string }[] }[], attempts: AttemptRecord[]): LessonPosition {
  for (let i = 0; i < steps.length; i++) {
    const j = steps[i].questions.findIndex((q) => !isDone(attempts, q.id))
    if (j >= 0) {
      return attempts.length > 0 ? { ...START_POSITION, stepIdx: i, qIdx: j } : START_POSITION
    }
  }
  return { ...START_POSITION, stepIdx: steps.length, complete: true }
}
