export interface DevLab {
  id: 'axis' | 'vector' | 'vertex' | 'curve'
  heading: string
  character: string
  teaches: string[]
  /** What exists in the app today. */
  implemented: string[]
  /** What is planned but not built. */
  planned: string[]
  assessment: string[]
  status: string
}

/** Plans only. No official outcome codes are given until a teacher validates the syllabus mapping. */
export const DEV_LABS: DevLab[] = [
  {
    id: 'axis',
    heading: 'In Development: Axis Lab',
    character: 'Axel',
    teaches: ['Reading and plotting ordered pairs on the Cartesian plane', 'Axes, origin and quadrants', 'Positive and negative coordinates and reading scales', 'Spotting incorrectly labelled axes'],
    implemented: ['Lab card and Axel character', 'Plot-a-point question type (click or typed coordinates), used inside the Slope Lab checkpoint', 'x/y reversal and dropped-sign error tagging'],
    planned: ['Full lesson with I do / We do / You do', 'Identify-a-coordinate, find-the-incorrect-point and mislabelled-axis activities', 'Coordinate treasure hunt'],
    assessment: ['Planned: auto-marked plotting and reading tasks with misconception tags (reversing x and y, ignoring negatives, misreading the scale)'],
    status: 'Not started as a lesson. Supporting graph and scoring tools exist.',
  },
  {
    id: 'vector',
    heading: 'In Development: Vector Lab',
    character: 'Hector',
    teaches: ['Applying graphing to real problems (taxi fares, phone plans, travel, temperature)', 'Choosing a suitable representation and comparing options', 'Judging whether a graph is misleading'],
    implemented: ['Lab card and Hector character', 'A real-world distance and time question inside the Slope Lab lesson'],
    planned: ['Scenario-based challenges that bring the other labs together', 'Comparing two pricing models and finding where costs are equal', 'Misleading-scale detection'],
    assessment: ['Planned: answers plus written reasoning. Written reasoning will be teacher-marked, not auto-marked.'],
    status: 'Not started as a lesson.',
  },
  {
    id: 'vertex',
    heading: 'In Development: Vertex Lab',
    character: 'Tex',
    teaches: ['Intercepts and turning points', 'Maximum and minimum values', 'Linking graphs, equations and context', 'Quadratic graphs as extension (Paths) content'],
    implemented: ['Lab card and Tex character'],
    planned: ['Locating intercepts and turning points on interactive graphs', 'Matching graph features to descriptions', 'Finding errors in graph interpretations'],
    assessment: ['Planned: interactive point-selection tasks and matching, with feedback by error type.'],
    status: 'Not started.',
  },
  {
    id: 'curve',
    heading: 'In Development: Curve Lab',
    character: 'Kirby',
    teaches: ['Telling linear from non-linear relationships', 'Reading curved graphs and changing rates', 'Comparing tables and graphs', 'Interpreting simple models'],
    implemented: ['Lab card and Kirby character'],
    planned: ['Classifying graphs as linear or non-linear', 'Matching tables to graphs', 'Manipulating a simple curve', 'Extension tasks kept separate from the Core pathway'],
    assessment: ['Planned: classification and matching tasks, plus interpretation questions.'],
    status: 'Not started.',
  },
]
