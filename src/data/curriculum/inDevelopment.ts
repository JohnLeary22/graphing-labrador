/** Labs that have no lesson yet. Teachers see the same fields as the Slope Lab lesson, each showing a dash. */
export const DEV_LABS = [
  { id: 'axis', heading: 'In Development: Axis Lab', character: 'Axel' },
  { id: 'vector', heading: 'In Development: Vector Lab', character: 'Hector' },
  { id: 'vertex', heading: 'In Development: Vertex Lab', character: 'Tex' },
  { id: 'curve', heading: 'In Development: Curve Lab', character: 'Kirby' },
] as const

/** Same headings, in the same order, as the Slope Lab lesson information. */
export const LESSON_FIELD_HEADINGS = [
  'Learning intention',
  'Success criteria',
  'Curriculum connection',
  'Worked example (I do)',
  'Prerequisite knowledge',
  'Literacy demand',
  'Numeracy demand',
  'Teaching strategy',
  'Why this works',
  'Common misconception',
  'Suggested intervention',
  'Follow-up assessment',
  'Differentiation',
  'Skills assessed',
] as const
