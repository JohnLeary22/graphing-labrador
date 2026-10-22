export type CharacterId = 'vector' | 'vertex' | 'axis' | 'slope' | 'curve'
export type LabId = 'axis' | 'slope' | 'vertex' | 'curve' | 'vector'
export type Role = 'student' | 'teacher'

/** Gradual release stage of the question within a lesson. */
export type Stage = 'HOOK' | 'WE_DO' | 'YOU_DO' | 'NON_EXAMPLE' | 'APPLICATION' | 'CHECKPOINT' | 'REFLECTION'

export interface Point {
  x: number
  y: number
}

export interface Skill {
  id: string
  name: string
  description: string
  /** Draft mappings must be validated by a teacher against the NSW syllabus before official codes are shown. */
  curriculum: { status: 'draft'; note: string }
}

export interface Misconception {
  id: string
  name: string
  evidence: string
  strategy: string
  rationale: string
  followUp: string
  checkImprovement: string
}

export interface Demands {
  literacy: string
  numeracy: string
}

export interface QuestionBase {
  id: string
  stage: Stage
  prompt: string
  skillIds: string[]
  maxMarks: number
  difficulty: 1 | 2 | 3
  demands: Demands
  hints: string[]
  /** Shown after a correct response. */
  explanation: string
}

export interface ErrorCheck {
  tag: string
  /** Named matcher implemented in lib/scoring/evaluate.ts */
  kind: 'reciprocal' | 'negated' | 'swapXY' | 'signDropped' | 'unitMissing'
  feedback: string
}

export interface NumericQuestion extends QuestionBase {
  type: 'NUMERIC'
  answer: number
  tolerance?: number
  unit?: string
  errorChecks?: ErrorCheck[]
}

export interface McqOption {
  id: string
  text: string
  feedback: string
  tag?: string
}

export interface McqQuestion extends QuestionBase {
  type: 'MCQ'
  options: McqOption[]
  correctId: string
}

export interface PlotQuestion extends QuestionBase {
  type: 'PLOT_POINT'
  target: Point
  errorChecks?: ErrorCheck[]
}

export interface OpenQuestion extends QuestionBase {
  type: 'EXPLAIN_REASONING'
  rubricCriteria: string[]
  strongExample: string
}

export interface CoordinateQuestion extends QuestionBase {
  type: 'READ_POINT'
  target: Point
  errorChecks?: ErrorCheck[]
}

export interface MatchItem {
  id: string
  label: string
  /** Small line drawing shown beside the item. */
  line?: { from: Point; to: Point }
}

export interface MatchQuestion extends QuestionBase {
  type: 'MATCH'
  items: MatchItem[]
  options: { id: string; text: string }[]
  /** itemId -> optionId */
  answers: Record<string, string>
}

export type Question = NumericQuestion | McqQuestion | PlotQuestion | OpenQuestion | CoordinateQuestion | MatchQuestion

export interface GraphSpec {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xStep: number
  yStep: number
  xLabel?: string
  yLabel?: string
  title?: string
  points?: { id: string; label: string; x: number; y: number; draggable?: boolean; hideCoords?: boolean }[]
  line?: { from: string; to: string }
  showTriangle?: boolean
  /** 'always' shows the live gradient working; 'after' hides it until the question is answered. */
  readout?: 'always' | 'after'
}

export interface EvaluationResult {
  correct: boolean
  marks: number
  /** For auto-marked questions this is always one of the two standard messages. */
  feedback: string
  /** Optional, student-requested nudge about a tagged mistake. Never contains the answer. */
  hint?: string
  tag?: string
  /** True when a teacher must mark the response. */
  pendingMarking?: boolean
}

export interface AttemptRecord {
  id: string
  studentId: string
  questionId: string
  lessonId: string
  stage: Stage
  skillIds: string[]
  response: string
  isCorrect: boolean
  marks: number
  maxMarks: number
  attemptNumber: number
  hintsUsed: number
  errorTag?: string
  pendingMarking?: boolean
  at: string
}

export interface Transaction {
  id: string
  studentId: string
  type: 'COINS' | 'XP'
  amount: number
  reason: string
  /** Prevents the same reward being granted twice. */
  key: string
  at: string
}

export type ItemCategory = 'hat' | 'neckwear' | 'eyewear' | 'colour' | 'background' | 'character'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic'

export interface ShopItem {
  id: string
  name: string
  category: ItemCategory
  price: number
  rarity: Rarity
  description: string
  /** For category 'character': which Labrador it unlocks. */
  character?: CharacterId
}

export interface Equipped {
  hat?: string
  neckwear?: string
  eyewear?: string
  colour?: string
  background?: string
}

export interface EconomyConfig {
  dailyCheckIn: number
  /** Whole-lesson bonus. Per-question rewards are fixed (see lib/rewards/economy.ts) and not configurable. */
  checkpointComplete: number
  xpPerCheckpoint: number
}

export interface LessonPosition {
  stepIdx: number
  qIdx: number
  /** Think-aloud lines already revealed in the current step. */
  thinkN: number
  complete: boolean
  /** True while a finished lesson is being replayed for revision. */
  revision: boolean
}

export interface Student {
  id: string
  name: string
  displayName: string
  classId: string
}

export interface TeacherNote {
  id: string
  studentId: string
  note: string
  at: string
}

export interface Intervention {
  id: string
  studentId: string
  skillId: string
  strategy: string
  activity: string
  status: 'assigned' | 'review' | 'completed'
  at: string
}

export interface MarkRecord {
  attemptId: string
  scores: Record<string, number>
  comment: string
  released: boolean
  total: number
}
