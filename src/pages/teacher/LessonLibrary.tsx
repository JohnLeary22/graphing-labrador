import { useNavigate } from 'react-router-dom'
import { GRADIENT_LESSON } from '@/data/lessons/gradient'
import { signIn } from '@/services/persistence/actions'
import { SKILLS, MISCONCEPTIONS } from '@/data/curriculum/skills'
import { DEV_LABS, LESSON_FIELD_HEADINGS } from '@/data/curriculum/inDevelopment'
import { MathText } from '@/components/ui/MathText'

const ROW = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <div className="grid gap-1 border-t border-line py-3 md:grid-cols-[210px_1fr]"><dt className="font-semibold">{k}</dt><dd>{children}</dd></div>
)

export function LessonLibrary() {
  const navigate = useNavigate()
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Lesson Library</h1>
        <p className="text-soft">What students are taught, and why. One lesson is complete (Slope Lab); the other four labs are in development.</p>
      </header>
      <article className="card p-6" aria-labelledby="lesson-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="chip">Slope Lab · about {GRADIENT_LESSON.durationMinutes} min</p>
            <h2 id="lesson-h" className="mt-2 font-display text-2xl font-bold">{GRADIENT_LESSON.title}</h2>
            <p className="text-soft">Topic: Gradient and rates of change</p>
          </div>
          <button className="btn btn-primary" onClick={() => { signIn('student'); navigate('/student/lesson/gradient') }}>Preview student lesson (switches to demo student)</button>
        </div>
        <dl className="mt-4">
          <ROW k="Learning intention">{GRADIENT_LESSON.learningIntention}</ROW>
          <ROW k="Success criteria"><ul className="list-disc pl-5">{GRADIENT_LESSON.successCriteria.map((s) => <li key={s}>{s}</li>)}</ul></ROW>
          <ROW k="Curriculum connection"><span className="chip">Draft mapping - needs teacher review</span> Linear relationships and rates of change, NSW Mathematics K-10 (2022) Stage 5. Official outcome codes are not shown until validated against the syllabus.</ROW>
          <ROW k="Worked example (I do)"><MathText text={'For $A(1,\\,2)$ and $B(3,\\,6)$: $$m = \\dfrac{\\htmlClass{m-rise}{6 - 2}}{\\htmlClass{m-run}{3 - 1}} = \\dfrac{\\htmlClass{m-rise}{4}}{\\htmlClass{m-run}{2}} = 2$$ Rise is shown in amber and run in teal; negative values are bracketed and bold, as in $1 - \\htmlClass{m-neg}{(-1)} = 2$.'} /></ROW>
          <ROW k="Prerequisite knowledge">Cartesian coordinates and reading scales.</ROW>
          <ROW k="Literacy demand">Understanding terms such as gradient, rise, run, rate, increase and decrease, and interpreting worded descriptions. Example: "how quickly" asks for a rate, not the highest point.</ROW>
          <ROW k="Numeracy demand">Using graphical information to calculate and interpret a rate, with the units from both axes.</ROW>
          <ROW k="Teaching strategy">Explicit modelling (think-aloud) followed by guided (We do) and independent (You do) practice, with a non-example.</ROW>
          <ROW k="Why this works">The worked example makes the calculation process visible and reduces unnecessary demands on working memory. Guided practice allows students to rehearse the procedure with feedback. Independent practice provides stronger evidence that the student can apply the skill without support.</ROW>
          <ROW k="Common misconception">Students reverse rise and run. Indicator: the student repeatedly calculates the reciprocal of the expected gradient.</ROW>
          <ROW k="Suggested intervention">{MISCONCEPTIONS.find((m) => m.id === 'rise-run-reversed')?.strategy} Then a similar independent question.</ROW>
          <ROW k="Follow-up assessment">Use a new line with unfamiliar coordinates to verify independent understanding.</ROW>
          <ROW k="Differentiation"><ul className="list-disc pl-5"><li>Support: optional hints (recorded, not penalised), colour-coded rise and run, simplified first example, text and table alternative for every graph.</li><li>Extension: more complex contexts and unit conversions (planned).</li><li>Scaffolds are optional and removable: no hints appear automatically in the "You do" stage.</li></ul></ROW>
          <ROW k="Skills assessed"><ul className="list-disc pl-5">{SKILLS.filter((s) => s.id.startsWith('gradient')).map((s) => <li key={s.id}>{s.name}</li>)}</ul></ROW>
        </dl>
      </article>
      {DEV_LABS.map((lab) => (
        <details key={lab.id} className="card group p-4">
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
            <span className="font-display text-lg font-bold">{lab.heading}</span>
            <span className="flex items-center gap-2 text-sm text-soft">{lab.character} <span className="chip">In Development</span></span>
          </summary>
          <dl className="mt-3">
            {LESSON_FIELD_HEADINGS.map((h) => <ROW key={h} k={h}>{'\u2014'}</ROW>)}
          </dl>
        </details>
      ))}
    </div>
  )
}
