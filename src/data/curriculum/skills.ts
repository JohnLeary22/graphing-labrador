import type { Misconception, Skill } from '@/types'

const draft = (note: string) => ({ status: 'draft' as const, note })

/**
 * Curriculum mappings are DRAFT. Official NSW Mathematics K-10 (2022) Stage 5 outcome codes
 * must be validated by a teacher against https://curriculum.nsw.edu.au before being displayed.
 */
export const SKILLS: Skill[] = [
  { id: 'coords-plot', name: 'Plot and read ordered pairs', description: 'Plot (x, y) on the Cartesian plane and read coordinates.', curriculum: draft('Stage 5 Cartesian plane / linear relationships - teacher to verify outcome') },
  { id: 'gradient-direction', name: 'Gradient direction', description: 'Decide whether a line has positive, negative, zero or undefined gradient.', curriculum: draft('Stage 5 linear relationships - teacher to verify outcome') },
  { id: 'gradient-calc', name: 'Calculate gradient (rise over run)', description: 'Calculate gradient from a graph or two points.', curriculum: draft('Stage 5 linear relationships - teacher to verify outcome') },
  { id: 'gradient-context', name: 'Interpret gradient as a rate', description: 'Explain what a gradient means in a real context, with units.', curriculum: draft('Stage 5 linear relationships / rates - teacher to verify outcome') },
  { id: 'gradient-explain', name: 'Explain graph reasoning', description: 'Justify mathematical conclusions in words.', curriculum: draft('Working mathematically: communicating - teacher to verify outcome') },
]

export const MISCONCEPTIONS: Misconception[] = [
  { id: 'xy-reversal', name: 'x/y reversal', evidence: 'Plots (y, x) instead of (x, y) on at least two items.', strategy: 'Colour-coded coordinates with "along the corridor, then up the stairs" modelling.', rationale: 'A consistent routine with colour cues reduces working-memory load while the order becomes automatic.', followUp: 'Plot five points, first with colour cues then without.', checkImprovement: 'Student plots three unfamiliar points independently with no swaps.' },
  { id: 'scale-misread', name: 'Misreading graph scales', evidence: 'Counts gridlines instead of reading the scale increment.', strategy: 'Label the value of one square before reading any point.', rationale: 'Making the unit explicit stops the default assumption that one square equals one unit.', followUp: 'Read points from graphs with steps of 2, 5 and 0.5.', checkImprovement: 'Correct readings on a new graph with an unusual scale.' },
  { id: 'intercept-gradient', name: 'Confusing intercept and gradient', evidence: 'Gives the y-intercept when asked for the gradient, or the reverse.', strategy: 'Sort-and-label: "where it starts" versus "how steep".', rationale: 'Contrasting examples and non-examples highlights the differing roles of m and c.', followUp: 'Match five equations to their gradient and intercept.', checkImprovement: 'Correctly states both m and c for two new equations.' },
  { id: 'rise-run-reversed', name: 'Rise and run reversed', evidence: 'Calculates run over rise, giving the reciprocal of the expected gradient.', strategy: 'Visual worked example with the rise and run triangle drawn and labelled separately.', rationale: 'Showing the two measurements separately makes the order of division visible and reduces unnecessary working-memory demands.', followUp: 'Two guided examples, then a similar independent question.', checkImprovement: 'A new line with unfamiliar coordinates answered correctly without hints.' },
  { id: 'negative-sign-ignored', name: 'Incorrect negative gradient', evidence: 'Gives the correct size but a positive sign for a descending line.', strategy: 'Trace the line left to right: going down is a negative rise.', rationale: 'Linking direction of travel to sign gives a concrete check on the answer.', followUp: 'Sort six lines into positive, negative, zero and undefined before calculating.', checkImprovement: 'Predicts sign correctly before calculating on three new lines.' },
  { id: 'unequal-scales', name: 'Comparing unequal scales', evidence: 'Compares steepness of two graphs without checking their axis scales.', strategy: 'Always compute the gradient with units before comparing.', rationale: 'A calculated rate removes the visual distortion caused by differing scales.', followUp: 'Compare two graphs drawn with different scales.', checkImprovement: 'Uses calculated gradients to justify the comparison.' },
  { id: 'percent-misread', name: 'Misinterpreting percentages', evidence: 'Treats a percentage change as a raw difference.', strategy: 'Convert to a worked unit rate before interpreting.', rationale: 'A concrete example anchors the abstract ratio.', followUp: 'Interpret three percentage-change statements.', checkImprovement: 'Explains the base value for a new percentage.' },
  { id: 'height-vs-rate', name: 'Confusing height with rate', evidence: 'Says the highest point shows the fastest rate.', strategy: 'Compare "how high" with "how quickly" using paired questions.', rationale: 'Targets the literacy demand of the phrase "how quickly".', followUp: 'Distance-time questions asking for speed rather than distance.', checkImprovement: 'Chooses gradient for rate questions on a new graph.' },
  { id: 'correlation-causation', name: 'Correlation proves causation', evidence: 'States that one variable causes the other from a scatter trend.', strategy: 'Counter-examples with a hidden third variable.', rationale: 'Non-examples make the limits of the claim explicit.', followUp: 'Evaluate three claims about trends.', checkImprovement: 'Uses cautious wording in a new explanation.' },
  { id: 'units-missing', name: 'Failing to interpret units', evidence: 'Gives a correct number without units, or with the wrong units.', strategy: 'Units-first sentence frames: "for every 1 hour, distance increases by ...".', rationale: 'Sentence frames turn a number into a meaningful statement.', followUp: 'Rewrite three bare numbers as rates with units.', checkImprovement: 'Includes correct units in a new context question.' },
  { id: 'worded-to-equation', name: 'Translating worded problems', evidence: 'Struggles to turn a sentence into an equation or graph.', strategy: 'Annotate the text: underline the constant and the changing amount.', rationale: 'Chunking the text separates language demands from the mathematical ones.', followUp: 'Translate four short worded rules into equations.', checkImprovement: 'Correct equation from a new worded rule.' },
  { id: 'legend-misread', name: 'Misreading titles or legends', evidence: 'Reads values from the wrong series or ignores the title.', strategy: 'Title-axis-legend checklist before answering.', rationale: 'A fixed routine builds the habit of reading all text features first.', followUp: 'Answer questions on two multi-series graphs.', checkImprovement: 'Names the correct series in a new graph.' },
]

/** Lookup from the error tag recorded on attempts to the misconception catalogue. */
export const TAG_TO_MISCONCEPTION: Record<string, string> = {
  'rise-run-reversed': 'rise-run-reversed',
  'negative-sign-ignored': 'negative-sign-ignored',
  'xy-reversal': 'xy-reversal',
  'sign-dropped': 'negative-sign-ignored',
  'unit-missing': 'units-missing',
  'unit-wrong': 'units-missing',
  'intercept-gradient': 'intercept-gradient',
  'scale-misread': 'scale-misread',
  'height-vs-rate': 'height-vs-rate',
}
