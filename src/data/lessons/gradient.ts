import type { GraphSpec, Question, Stage } from '@/types'

export const GRADIENT_LESSON_ID = 'gradient'

export interface LessonStep {
  id: string
  stage: Stage | 'I_DO' | 'SUMMARY'
  title: string
  intro?: string
  graph?: GraphSpec
  /** Think-aloud lines revealed one at a time (I DO). */
  thinkAloud?: string[]
  questions: Question[]
}

const base = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xStep: 1, yStep: 1 }

const reversalFeedback =
  'You have divided the horizontal change by the vertical change. Gradient is vertical change (rise) divided by horizontal change (run). Find the rise first, then divide by the run.'
const signFeedback =
  'The size is right but check the sign. Read the line from left to right: if it goes down, the rise is negative, so the gradient is negative.'

export const GRADIENT_LESSON = {
  id: GRADIENT_LESSON_ID,
  labId: 'slope',
  title: 'Understanding Gradient',
  durationMinutes: 35,
  learningIntention: 'Understand gradient as the rate of change between two variables.',
  successCriteria: [
    'Identify whether a graph has a positive, negative or zero gradient.',
    'Calculate gradient using rise over run.',
    'Interpret gradient in context, with units.',
  ],
  steps: [
    {
      id: 'hook',
      stage: 'HOOK',
      title: 'Move the point',
      intro: 'Drag point B (or focus it and use the arrow keys). Watch the line and the gradient value change.',
      graph: {
        ...base,
        title: 'Line through A and B',
        points: [
          { id: 'A', label: 'A', x: 1, y: 1 },
          { id: 'B', label: 'B', x: 4, y: 3, draggable: true },
        ],
        line: { from: 'A', to: 'B' },
        showTriangle: true,
        readout: 'always',
      },
      questions: [
        {
          id: 'grad-hook-1',
          stage: 'HOOK',
          type: 'MCQ',
          prompt: 'What happens to the line when point B moves upward (and A stays still)?',
          skillIds: ['gradient-direction'],
          maxMarks: 1,
          difficulty: 1,
          demands: { literacy: 'Understanding "steeper" and "upward" as descriptions of change.', numeracy: 'Noticing how a change in y affects steepness.' },
          hints: ['Try moving B up and look at the gradient value.'],
          explanation: 'Moving B up increases the rise, so the line gets steeper and the gradient increases.',
          correctId: 'steeper',
          options: [
            { id: 'steeper', text: 'It gets steeper', feedback: 'Yes.' },
            { id: 'flatter', text: 'It gets flatter', feedback: 'Look again: when B moves up, does the vertical change get bigger or smaller?', tag: 'other' },
            { id: 'same', text: 'It stays the same', feedback: 'The line passes through both points, so moving B changes the line.', tag: 'other' },
          ],
        },
      ],
    },
    {
      id: 'i-do',
      stage: 'I_DO',
      title: 'I do: watch the thinking',
      intro: 'Follow each step. Notice that the decisions come before the calculation.',
      graph: {
        ...base,
        xMin: -1,
        xMax: 6,
        yMin: -1,
        yMax: 8,
        title: 'A(1, 2) and B(3, 6)',
        points: [
          { id: 'A', label: 'A', x: 1, y: 2 },
          { id: 'B', label: 'B', x: 3, y: 6 },
        ],
        line: { from: 'A', to: 'B' },
        showTriangle: true,
        readout: 'always',
      },
      thinkAloud: [
        'First I check what the axes are. The horizontal axis is $x$ and the vertical axis is $y$.',
        'I read the two points: $A(1,\\,2)$ and $B(3,\\,6)$.',
        'Rise is the vertical change. I go from $y = 2$ up to $y = 6$: $$\\htmlClass{m-rise}{\\text{rise}} = 6 - 2 = \\htmlClass{m-rise}{4}$$',
        'Run is the horizontal change. I go from $x = 1$ to $x = 3$: $$\\htmlClass{m-run}{\\text{run}} = 3 - 1 = \\htmlClass{m-run}{2}$$',
        'Gradient is rise over run: $$m = \\dfrac{\\htmlClass{m-rise}{\\text{rise}}}{\\htmlClass{m-run}{\\text{run}}} = \\dfrac{\\htmlClass{m-rise}{4}}{\\htmlClass{m-run}{2}} = \\mathbf{2}$$',
        'Check: the line goes up as I move right, so a positive answer makes sense.',
      ],
      questions: [],
    },
    {
      id: 'we-do',
      stage: 'WE_DO',
      title: 'We do: work it out together',
      intro: 'Use the same steps on a new line. You will get feedback on each step.',
      graph: {
        ...base,
        xMin: -1,
        xMax: 6,
        yMin: -1,
        yMax: 8,
        title: 'P(1, 6) and Q(4, 0)',
        points: [
          { id: 'P', label: 'P', x: 1, y: 6 },
          { id: 'Q', label: 'Q', x: 4, y: 0 },
        ],
        line: { from: 'P', to: 'Q' },
        showTriangle: true,
      },
      questions: [
        {
          id: 'grad-wedo-rise', stage: 'WE_DO', type: 'NUMERIC', answer: -6,
          prompt: 'Going from $P$ to $Q$, what is the rise (vertical change)?',
          skillIds: ['gradient-calc'], maxMarks: 1, difficulty: 1,
          demands: { literacy: 'Knowing "rise" means vertical change, and that it can be negative.', numeracy: 'Subtracting y-coordinates in the correct order.' },
          hints: ['$\\text{rise} = y_Q - y_P$'],
          explanation: '$\\text{Rise} = 0 - 6 = -6$. The line goes down, so the rise is negative.',
          errorChecks: [{ tag: 'negative-sign-ignored', kind: 'negated', feedback: 'Check the direction. Moving from P to Q the line goes down, so the rise is negative.' }],
        },
        {
          id: 'grad-wedo-run', stage: 'WE_DO', type: 'NUMERIC', answer: 3,
          prompt: 'What is the run (horizontal change) from $P$ to $Q$?',
          skillIds: ['gradient-calc'], maxMarks: 1, difficulty: 1,
          demands: { literacy: 'Knowing "run" means horizontal change.', numeracy: 'Subtracting x-coordinates in the same order as the rise.' },
          hints: ['$\\text{run} = x_Q - x_P$'],
          explanation: '$\\text{Run} = 4 - 1 = 3$.',
        },
        {
          id: 'grad-wedo-grad', stage: 'WE_DO', type: 'NUMERIC', answer: -2,
          prompt: 'Now calculate the gradient: $\\dfrac{\\text{rise}}{\\text{run}}$.',
          skillIds: ['gradient-calc', 'gradient-direction'], maxMarks: 2, difficulty: 2,
          demands: { literacy: 'Linking the words "rise over run" to a division.', numeracy: 'Dividing signed numbers.' },
          hints: ['Use your rise and run from the last two steps.'],
          explanation: '$$m = \\dfrac{-6}{3} = -2$$ A negative gradient means the line goes down from left to right.',
          errorChecks: [
            { tag: 'rise-run-reversed', kind: 'reciprocal', feedback: reversalFeedback },
            { tag: 'negative-sign-ignored', kind: 'negated', feedback: signFeedback },
          ],
        },
      ],
    },
    {
      id: 'you-do',
      stage: 'YOU_DO',
      title: 'You do: try one on your own',
      intro: 'No automatic hints here. Hints are optional and are recorded to help your teacher support you.',
      graph: {
        ...base,
        title: 'R(-3, -1) and S(1, 1)',
        points: [
          { id: 'R', label: 'R', x: -3, y: -1 },
          { id: 'S', label: 'S', x: 1, y: 1 },
        ],
        line: { from: 'R', to: 'S' },
        showTriangle: true,
      },
      questions: [
        {
          id: 'grad-youdo-1', stage: 'YOU_DO', type: 'NUMERIC', answer: 0.5,
          prompt: 'Calculate the gradient of the line through $R$ and $S$.',
          skillIds: ['gradient-calc'], maxMarks: 2, difficulty: 2,
          demands: { literacy: 'Reading coordinates with negative values.', numeracy: 'Subtracting negative numbers; giving a fraction or decimal.' },
          hints: ['Write down both points first.', '$\\text{Rise} = 1 - \\htmlClass{m-neg}{(-1)}$ and $\\text{run} = 1 - \\htmlClass{m-neg}{(-3)}$.', '$\\text{Rise} = 2$ and $\\text{run} = 4$, so $m = \\dfrac{2}{4}$.'],
          explanation: '$$m = \\dfrac{1 - \\htmlClass{m-neg}{(-1)}}{1 - \\htmlClass{m-neg}{(-3)}} = \\dfrac{2}{4} = \\dfrac{1}{2}$$',
          errorChecks: [
            { tag: 'rise-run-reversed', kind: 'reciprocal', feedback: reversalFeedback },
            { tag: 'negative-sign-ignored', kind: 'negated', feedback: signFeedback },
          ],
        },
      ],
    },
    {
      id: 'non-example',
      stage: 'NON_EXAMPLE',
      title: 'Spot the mistake',
      intro: 'Maya worked out the gradient of the line through $A(1,\\,2)$ and $B(3,\\,6)$. Read her working carefully.',
      graph: {
        ...base,
        xMin: -1, xMax: 6, yMin: -1, yMax: 8,
        title: 'Maya used A(1, 2) and B(3, 6)',
        points: [
          { id: 'A', label: 'A', x: 1, y: 2 },
          { id: 'B', label: 'B', x: 3, y: 6 },
        ],
        line: { from: 'A', to: 'B' },
      },
      questions: [
        {
          id: 'grad-nonex-1', stage: 'NON_EXAMPLE', type: 'MCQ',
          prompt: 'Maya wrote: “$\\text{run} = 2$ and $\\text{rise} = 4$, so $$\\text{gradient} = \\dfrac{\\text{run}}{\\text{rise}} = \\dfrac{2}{4} = 0.5$$” What is her mistake?',
          skillIds: ['gradient-calc'], maxMarks: 1, difficulty: 2,
          demands: { literacy: 'Evaluating a written solution.', numeracy: 'Knowing the order of the division.' },
          hints: ['Check which measurement is on top in rise over run.'],
          explanation: 'Gradient is rise divided by run, so the correct gradient is $\\dfrac{4}{2} = 2$.',
          correctId: 'swapped',
          options: [
            { id: 'swapped', text: 'She divided run by rise instead of rise by run.', feedback: 'Correct.' },
            { id: 'rise', text: 'Her rise should be 6.', feedback: 'Rise is the change in y: 6 - 2 = 4, so her rise is correct. Look at the division.', tag: 'other' },
            { id: 'neg', text: 'The gradient should be negative.', feedback: 'The line goes up from left to right, so the gradient is positive.', tag: 'other' },
          ],
        },
      ],
    },
    {
      id: 'application',
      stage: 'APPLICATION',
      title: 'Use it in the real world',
      intro: 'A cyclist rides at a steady pace. The graph shows distance travelled over time.',
      graph: {
        xMin: 0, xMax: 5, yMin: 0, yMax: 80, xStep: 1, yStep: 10,
        xLabel: 'Time (hours)', yLabel: 'Distance (km)',
        title: 'Cyclist: distance and time',
        points: [
          { id: 'S', label: 'start', x: 0, y: 0 },
          { id: 'E', label: 'end', x: 4, y: 60 },
        ],
        line: { from: 'S', to: 'E' },
      },
      questions: [
        {
          id: 'grad-app-1', stage: 'APPLICATION', type: 'NUMERIC', answer: 15, unit: 'km/h',
          prompt: 'How quickly is the cyclist travelling? Give the gradient with its units (for example $12\\ \\text{km/h}$).',
          skillIds: ['gradient-context'], maxMarks: 2, difficulty: 2,
          demands: {
            literacy: 'Understand that "how quickly" asks for a rate, not simply the highest point on the graph.',
            numeracy: 'Calculate the gradient as a rate using the units on both axes.',
          },
          hints: ['Rise is the change in distance. Run is the change in time.', '$\\text{Rise} = 60\\ \\text{km}$ and $\\text{run} = 4\\ \\text{hours}$.'],
          explanation: '$$m = \\dfrac{60\\ \\text{km}}{4\\ \\text{h}} = 15\\ \\text{km/h}$$',
          errorChecks: [{ tag: 'rise-run-reversed', kind: 'reciprocal', feedback: reversalFeedback }],
        },
      ],
    },
    {
      id: 'checkpoint',
      stage: 'CHECKPOINT',
      title: 'Checkpoint',
      intro: 'Three short questions in different forms.',
      graph: {
        ...base,
        xMin: -5, xMax: 14, yMin: -3, yMax: 14,
        xStep: 1, yStep: 1,
        title: 'Points (2, 3) and (5, 12)',
        points: [
          { id: 'C', label: 'C', x: 2, y: 3 },
          { id: 'D', label: 'D', x: 5, y: 12 },
        ],
        line: { from: 'C', to: 'D' },
      },
      questions: [
        {
          id: 'grad-check-1', stage: 'CHECKPOINT', type: 'NUMERIC', answer: 3,
          prompt: 'Calculate the gradient of the line through $C(2,\\,3)$ and $D(5,\\,12)$.',
          skillIds: ['gradient-calc'], maxMarks: 2, difficulty: 2,
          demands: { literacy: 'Reading coordinates in (x, y) order.', numeracy: 'Rise over run with larger values.' },
          hints: ['$\\text{Rise} = 12 - 3$ and $\\text{run} = 5 - 2$.'],
          explanation: '$$m = \\dfrac{12 - 3}{5 - 2} = \\dfrac{9}{3} = 3$$',
          errorChecks: [
            { tag: 'rise-run-reversed', kind: 'reciprocal', feedback: reversalFeedback },
            { tag: 'negative-sign-ignored', kind: 'negated', feedback: signFeedback },
          ],
        },
        {
          id: 'grad-check-2', stage: 'CHECKPOINT', type: 'PLOT_POINT', target: { x: -3, y: 2 },
          prompt: 'Plot the point $(-3,\\,2)$ on the graph below, by clicking it or by typing the coordinates.',
          skillIds: ['coords-plot'], maxMarks: 1, difficulty: 1,
          demands: { literacy: 'Interpreting the ordered pair notation.', numeracy: 'Using negative coordinates.' },
          hints: ['The $x$-coordinate comes first: move 3 left of the origin, then 2 up.'],
          explanation: '$x = -3$ is 3 units left of the origin and $y = 2$ is 2 units up.',
          errorChecks: [
            { tag: 'xy-reversal', kind: 'swapXY', feedback: 'You have plotted (2, -3). The x-coordinate comes first: move along the x-axis, then up or down.' },
            { tag: 'sign-dropped', kind: 'signDropped', feedback: 'The size is right but check the signs: -3 means 3 units to the LEFT of the origin.' },
          ],
        },
        {
          id: 'grad-check-3', stage: 'CHECKPOINT', type: 'MCQ',
          prompt: 'What is the gradient of a vertical line?',
          skillIds: ['gradient-direction'], maxMarks: 1, difficulty: 2,
          demands: { literacy: 'Understanding the term "undefined".', numeracy: 'Recognising that dividing by a run of 0 is not possible.' },
          hints: ['What is the run of a vertical line?'],
          explanation: 'A vertical line has a run of 0, and dividing by zero is not possible, so its gradient is undefined.',
          correctId: 'undefined',
          options: [
            { id: 'zero', text: '$0$', feedback: 'A gradient of 0 describes a horizontal line. A vertical line has a run of 0, which makes the gradient undefined.', tag: 'zero-vs-undefined' },
            { id: 'undefined', text: 'Undefined', feedback: 'Correct.' },
            { id: 'one', text: '$1$', feedback: 'A gradient of 1 rises one unit for each unit across. A vertical line does not move across at all.', tag: 'other' },
          ],
        },
      ],
    },
    {
      id: 'reflection',
      stage: 'REFLECTION',
      title: 'Reflect',
      intro: 'Your teacher will read and mark this response.',
      questions: [
        {
          id: 'grad-reflect-1', stage: 'REFLECTION', type: 'EXPLAIN_REASONING',
          prompt: 'What does gradient tell us that the height of a graph alone does not?',
          skillIds: ['gradient-explain', 'gradient-context'], maxMarks: 6, difficulty: 3,
          demands: { literacy: 'Explaining a relationship using mathematical vocabulary.', numeracy: 'Linking gradient to rate of change.' },
          hints: [],
          explanation: '',
          rubricCriteria: ['correct-interpretation', 'language-units', 'justification'],
          strongExample: 'Height only tells you the value at one moment. Gradient tells you how quickly the value is changing, for example 15 km/h.',
        },
      ],
    },
  ] as LessonStep[],
}

export const ALL_LESSON_QUESTIONS: Question[] = GRADIENT_LESSON.steps.flatMap((s) => s.questions)
export const questionById = (id: string) => ALL_LESSON_QUESTIONS.find((q) => q.id === id)

export const RUBRIC = {
  title: 'Graph interpretation rubric (sample)',
  criteria: [
    { id: 'relevant-info', name: 'Identifying relevant information', strong: 'Selects the right variables, points and scale from the graph.', developing: 'Reads some values correctly but misses key information.', support: 'Misreads the scale or confuses the axes.', next: 'Model the title-axis-scale checklist with a think-aloud.' },
    { id: 'correct-interpretation', name: 'Correct mathematical interpretation', strong: 'Correctly identifies graph features and explains their meaning in context.', developing: 'Reads values correctly but does not explain what they represent.', support: 'Misinterprets what gradient or other features mean.', next: 'Revisit meaning of gradient using a modelled worked example and guided questioning.' },
    { id: 'calculation', name: 'Accurate calculation or construction', strong: 'Calculates or constructs accurately with clear working.', developing: 'Minor errors in working; approach is sound.', support: 'Method is incorrect or missing.', next: 'Provide a worked example with rise and run drawn separately.' },
    { id: 'language-units', name: 'Appropriate mathematical language and units', strong: 'Uses correct vocabulary and units.', developing: 'Uses some vocabulary; units inconsistent.', support: 'Little mathematical language; units missing.', next: 'Use units-first sentence frames.' },
    { id: 'justification', name: 'Explanation and justification', strong: 'Explains why the answer is reasonable using evidence.', developing: 'States a conclusion with limited support.', support: 'No justification.', next: 'Model "because ..." sentences and have the student rewrite their answer.' },
  ],
}
