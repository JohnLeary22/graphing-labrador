import type { AttemptRecord, Misconception } from '@/types'
import { MISCONCEPTIONS, TAG_TO_MISCONCEPTION } from '@/data/curriculum/skills'

export type MasteryLevel = 'no-evidence' | 'emerging' | 'developing' | 'secure'

export interface SkillSummary {
  skillId: string
  /** Distinct questions with independent (no hint, no scaffold) evidence. */
  independentQuestions: number
  attempts: number
  accuracy: number | null
  independentAccuracy: number | null
  scaffoldedAccuracy: number | null
  hintsUsed: number
  level: MasteryLevel
  /** Fewer than 3 independent items: treat the conclusion as provisional. */
  provisional: boolean
}

const INDEPENDENT_STAGES = new Set(['YOU_DO', 'CHECKPOINT', 'APPLICATION'])
const SCAFFOLDED_STAGES = new Set(['WE_DO', 'HOOK', 'NON_EXAMPLE'])
const isGenuine = (a: AttemptRecord) => a.errorTag !== 'invalid-input' && a.errorTag !== 'too-short'
const ratio = (n: number, d: number) => (d === 0 ? null : n / d)

function latestPerQuestion(attempts: AttemptRecord[]): AttemptRecord[] {
  const byQ = new Map<string, AttemptRecord>()
  for (const a of attempts) {
    const cur = byQ.get(a.questionId)
    if (!cur || a.attemptNumber >= cur.attemptNumber) byQ.set(a.questionId, a)
  }
  return [...byQ.values()]
}

/** Summarises evidence for one skill. Completion and time spent are deliberately not used. */
export function summariseSkill(skillId: string, all: AttemptRecord[]): SkillSummary {
  const attempts = all.filter((a) => a.skillIds.includes(skillId) && isGenuine(a))
  const independent = attempts.filter((a) => INDEPENDENT_STAGES.has(a.stage) && a.hintsUsed === 0)
  const scaffolded = attempts.filter((a) => SCAFFOLDED_STAGES.has(a.stage) || a.hintsUsed > 0)
  const gradable = attempts.filter((a) => !a.pendingMarking)
  const indLatest = latestPerQuestion(independent.filter((a) => !a.pendingMarking))
  const indCorrect = indLatest.filter((a) => a.isCorrect).length
  const indAcc = ratio(indCorrect, indLatest.length)
  let level: MasteryLevel = 'no-evidence'
  if (indLatest.length > 0) {
    level = indAcc === 1 && indLatest.length >= 2 ? 'secure' : indAcc !== null && indAcc >= 0.5 ? 'developing' : 'emerging'
  } else if (attempts.length > 0) {
    level = 'emerging'
  }
  return {
    skillId,
    independentQuestions: indLatest.length,
    attempts: attempts.length,
    accuracy: ratio(gradable.filter((a) => a.isCorrect).length, gradable.length),
    independentAccuracy: indAcc,
    scaffoldedAccuracy: ratio(scaffolded.filter((a) => a.isCorrect && !a.pendingMarking).length, scaffolded.filter((a) => !a.pendingMarking).length),
    hintsUsed: attempts.reduce((s, a) => s + a.hintsUsed, 0),
    level,
    provisional: indLatest.length < 3,
  }
}

export interface MisconceptionEvidence {
  misconception: Misconception
  tag: string
  /** Distinct questions on which the error appeared. */
  questionIds: string[]
  attemptIds: string[]
  status: 'likely' | 'possible'
}

/** One wrong answer is only a "possible" misconception. The same error on 2+ different questions is "likely". */
export function misconceptionEvidence(all: AttemptRecord[]): MisconceptionEvidence[] {
  const byTag = new Map<string, AttemptRecord[]>()
  for (const a of all) {
    if (!a.errorTag || !TAG_TO_MISCONCEPTION[a.errorTag]) continue
    byTag.set(a.errorTag, [...(byTag.get(a.errorTag) ?? []), a])
  }
  const out: MisconceptionEvidence[] = []
  for (const [tag, list] of byTag) {
    const m = MISCONCEPTIONS.find((x) => x.id === TAG_TO_MISCONCEPTION[tag])
    if (!m) continue
    const questionIds = [...new Set(list.map((a) => a.questionId))]
    out.push({ misconception: m, tag, questionIds, attemptIds: list.map((a) => a.id), status: questionIds.length >= 2 ? 'likely' : 'possible' })
  }
  return out.sort((a, b) => b.questionIds.length - a.questionIds.length)
}

/** Plain-language summary a teacher can verify against the linked attempts. */
export function diagnosticSummary(name: string, skill: SkillSummary, evidence: MisconceptionEvidence[]): string {
  if (skill.level === 'no-evidence') return `No independent evidence yet for ${name}.`
  const reversal = evidence.find((e) => e.tag === 'rise-run-reversed')
  const prompted = (skill.scaffoldedAccuracy ?? 0) >= 0.8
  const struggling = (skill.independentAccuracy ?? 1) < 0.6
  let text: string
  if (reversal && reversal.status === 'likely') {
    text = `${name} appears to understand the direction of gradient but is not yet consistently calculating rise over run without support.`
  } else if (reversal) {
    text = `${name} made a rise/run reversal once. One error is not enough to confirm a misconception; check the next independent item.`
  } else if (prompted && struggling) {
    text = `${name} is accurate with prompts but has not yet shown the same accuracy independently.`
  } else if (skill.level === 'secure') {
    text = `${name} has answered independent items correctly.`
  } else {
    text = `${name} is developing; the evidence so far is mixed.`
  }
  return skill.provisional ? `${text} (Provisional: only ${skill.independentQuestions} independent item${skill.independentQuestions === 1 ? '' : 's'}.)` : text
}

export function lessonProgress(attempts: AttemptRecord[], lessonId: string, questionIds: string[]) {
  const mine = attempts.filter((a) => a.lessonId === lessonId)
  const attempted = new Set(mine.map((a) => a.questionId))
  const correct = new Set(mine.filter((a) => a.isCorrect).map((a) => a.questionId))
  const done = questionIds.filter((id) => attempted.has(id)).length
  return { attempted: done, correct: questionIds.filter((id) => correct.has(id)).length, total: questionIds.length, fraction: questionIds.length ? done / questionIds.length : 0 }
}
