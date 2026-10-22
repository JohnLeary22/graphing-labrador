import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartesianGraph } from '@/components/graphs/CartesianGraph'
import { RubricView, RUBRIC_LEVELS, STRONG_RESPONSE_HEADING } from '@/components/assessments/RubricView'
import { QuestionCard } from '@/components/assessments/QuestionCard'
import { MathText } from '@/components/ui/MathText'
import { Landing } from '@/pages/public/Landing'
import { LabsMap } from '@/pages/student/LabsMap'
import { LessonLibrary } from '@/pages/teacher/LessonLibrary'
import { TeacherLayout } from '@/components/layout/Layouts'
import { questionById } from '@/data/lessons/gradient'
import { DEMO_DISCLAIMER } from '@/data/copy'
import { DEMO_CLASS } from '@/data/demo/seed'
import { gradientTex, plainMath, speak } from '@/lib/math/tex'
import { signIn } from '@/services/persistence/actions'
import { CORRECT_MESSAGE, INCORRECT_MESSAGE } from '@/lib/scoring/messages'
import type { OpenQuestion } from '@/types'

const bounds = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }

describe('CartesianGraph accessibility and keyboard', () => {
  it('moves a draggable point with arrow keys', () => {
    const onChange = vi.fn()
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={[{ id: 'B', label: 'B', x: 1, y: 1, draggable: true }]} onPointChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('B', { x: 2, y: 1 })
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith('B', { x: 1, y: 2 })
  })
  it('does not move past the plotting boundary', () => {
    const onChange = vi.fn()
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={[{ id: 'B', label: 'B', x: 5, y: 5, draggable: true }]} onPointChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('B', { x: 5, y: 5 })
  })
  it('labels the draggable point for screen readers', () => {
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={[{ id: 'B', label: 'B', x: 3, y: -2, draggable: true }]} onPointChange={() => {}} />)
    expect(screen.getByRole('slider')).toHaveAccessibleName(/Point B at \(3, -2\)/)
  })
  it('typesets the gradient working as a fraction and updates when the point moves', () => {
    const points = [{ id: 'A', label: 'A', x: 1, y: 2 }, { id: 'B', label: 'B', x: 3, y: 6 }]
    const { container, rerender } = render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={points} line={{ from: 'A', to: 'B' }} />)
    expect(container.querySelector('.katex .mfrac')).not.toBeNull()
    expect(screen.getByRole('math', { name: /4 over 2.*equals 2/ })).toBeInTheDocument()
    rerender(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={[points[0], { ...points[1], y: 8 }]} line={{ from: 'A', to: 'B' }} />)
    expect(screen.getByRole('math', { name: /6 over 2.*equals 3/ })).toBeInTheDocument()
  })
  it('reports a vertical line gradient as undefined', () => {
    const points = [{ id: 'A', label: 'A', x: 2, y: 0 }, { id: 'B', label: 'B', x: 2, y: 4 }]
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={points} line={{ from: 'A', to: 'B' }} />)
    expect(screen.getByText('undefined')).toBeInTheDocument()
  })
  it('can hide the working until the question is answered', () => {
    const points = [{ id: 'A', label: 'A', x: 1, y: 2 }, { id: 'B', label: 'B', x: 3, y: 6 }]
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={points} line={{ from: 'A', to: 'B' }} showGradient={false} />)
    expect(screen.queryByRole('math')).toBeNull()
  })
  it('provides a table alternative listing the points', () => {
    render(<CartesianGraph bounds={bounds} xStep={1} yStep={1} points={[{ id: 'A', label: 'A', x: 1, y: 2 }]} />)
    expect(screen.getByRole('table', { name: /points on the graph/i })).toBeInTheDocument()
  })
})

describe('mathematical notation', () => {
  it('renders vertical fractions with KaTeX and a text alternative', () => {
    const { container } = render(<MathText text={'Gradient $\\dfrac{4}{2} = 2$'} />)
    expect(container.querySelector('.katex .mfrac')).not.toBeNull()
    expect(screen.getByRole('math')).toHaveAccessibleName('4 over 2 equals 2')
  })
  it('renders exponents and subscripts', () => {
    const { container } = render(<MathText text={'$x^2 + y_1$'} />)
    expect(container.querySelector('.katex .msupsub')).not.toBeNull()
  })
  it('gives R(-3,-1) S(1,1) a full rise-over-run fraction with the negative marked', () => {
    const g = gradientTex({ x: -3, y: -1, label: 'R' }, { x: 1, y: 1, label: 'S' })!
    expect(g.tex).toContain('\\dfrac')
    expect(g.tex).toContain('1 - \\htmlClass{m-neg}{(-1)}')
    expect(g.tex).toContain('1 - \\htmlClass{m-neg}{(-3)}')
    expect(g.alt).toMatch(/1 minus negative 1.*1 minus negative 3.*2 over 4.*equals 0\.5/)
    const { container } = render(<MathText text={`$$${g.tex}$$`} />)
    expect(container.querySelectorAll('.katex .m-neg').length).toBeGreaterThanOrEqual(2)
    expect(container.querySelectorAll('.katex .m-rise').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.katex .m-run').length).toBeGreaterThan(0)
  })
  it('does not change the maths: 4/2 -> 2, -6/3 -> -2, and a vertical line has no tex', () => {
    expect(gradientTex({ x: 1, y: 2, label: 'A' }, { x: 3, y: 6, label: 'B' })!.tex).toContain('m-result}{2}')
    expect(gradientTex({ x: 1, y: 6, label: 'P' }, { x: 4, y: 0, label: 'Q' })!.tex).toContain('m-result}{-2}')
    expect(gradientTex({ x: 2, y: 0, label: 'A' }, { x: 2, y: 4, label: 'B' })).toBeNull()
  })
  it('converts TeX to readable text', () => {
    expect(speak('\\dfrac{-6}{3} = -2')).toBe('-6 over 3 equals -2'.replace(/-/g, 'minus '))
    expect(plainMath('Plot $(-3,\\,2)$ now')).toBe('Plot ( minus 3, 2) now')
  })
  it('does not render student-style text as TeX', () => {
    const { container } = render(<MathText text="15 km/h" />)
    expect(container.querySelector('.katex')).toBeNull()
  })
})

describe('question card feedback', () => {
  it('shows exactly the incorrect message on a wrong attempt, without the answer', () => {
    render(<QuestionCard question={questionById('grad-youdo-1')!} lessonId="gradient" studentId="s1" onResolved={() => {}} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(INCORRECT_MESSAGE)
    expect(status.textContent).not.toMatch(/0\.5|1\/2/)
    expect(screen.getByRole('button', { name: 'Check again' })).toBeEnabled()
  })
  it('shows exactly the correct message on a right attempt', () => {
    render(<QuestionCard question={questionById('grad-youdo-1')!} lessonId="gradient" studentId="s1" onResolved={() => {}} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1/2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('status').textContent).toContain(CORRECT_MESSAGE)
  })
})

describe('reflection marking rubric', () => {
  const q = questionById('grad-reflect-1') as OpenQuestion
  const SPEC = [
    'Example of a strong response',
    'Correct mathematical interpretation',
    'Strong: Correctly identifies graph features and explains their meaning in context.',
    'Developing: Reads values correctly but does not explain what they represent.',
    'Needs support: Misinterprets what gradient or other features mean.',
    'Needs support (0)', 'Developing (1)', 'Strong (2)',
    'Appropriate mathematical language and units',
    'Strong: Uses correct vocabulary and units.',
    'Developing: Uses some vocabulary; units inconsistent.',
    'Needs support: Little mathematical language; units missing.',
    'Explanation and justification',
    'Strong: Explains why the answer is reasonable using evidence.',
    'Developing: States a conclusion with limited support.',
    'Needs support: No justification.',
  ]
  const lines = (el: HTMLElement) => Array.from(el.querySelectorAll('h4, p, li, label')).map((n) => n.textContent?.trim() ?? '')

  it('contains the required text word for word, in the student view', () => {
    const { container } = render(<RubricView question={q} />)
    const got = lines(container)
    for (const s of SPEC) expect(got).toContain(s)
  })
  it('contains the required text word for word, in the teacher view', () => {
    const { container } = render(<RubricView question={q} scores={{}} onScore={() => {}} />)
    const got = lines(container)
    for (const s of SPEC) expect(got).toContain(s)
  })
  it('is identical for students and teachers apart from the controls', () => {
    const student = render(<RubricView question={q} />).container
    const teacher = render(<RubricView question={q} onScore={() => {}} scores={{}} />).container
    expect(lines(student)).toEqual(lines(teacher))
    expect(student.textContent).toBe(teacher.textContent)
  })
  it('lists headings and criteria in the specified order, three criteria in total', () => {
    const { container } = render(<RubricView question={q} />)
    const headings = Array.from(container.querySelectorAll('h4')).map((h) => h.textContent)
    expect(headings).toEqual([STRONG_RESPONSE_HEADING, 'Correct mathematical interpretation', 'Appropriate mathematical language and units', 'Explanation and justification'])
    expect(RUBRIC_LEVELS.map((l) => l.label)).toEqual(['Needs support (0)', 'Developing (1)', 'Strong (2)'])
  })
  it('does not let students assign marks', () => {
    const { container } = render(<RubricView question={q} />)
    expect(container.querySelectorAll('input')).toHaveLength(0)
  })
  it('gives teachers working score controls (3 criteria x 3 levels)', () => {
    const onScore = vi.fn()
    render(<RubricView question={q} scores={{}} onScore={onScore} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(9)
    fireEvent.click(screen.getAllByRole('radio', { name: 'Strong (2)' })[0])
    expect(onScore).toHaveBeenCalledWith('correct-interpretation', 2)
  })
  it('is shown to students near the reflection input via View Marking Rubric', () => {
    render(<QuestionCard question={q} lessonId="gradient" studentId="s1" onResolved={() => {}} />)
    expect(screen.getByText('View Marking Rubric')).toBeInTheDocument()
    expect(screen.getByText(/total out of 6/)).toBeInTheDocument()
  })
})

describe('landing page', () => {
  it('shows the exact demonstration disclaimer, including the spelling "fitcional"', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    const expected = 'Demonstration mode: all demo names and responses are fitcional (and AI-generated) and progress is saved only in this browser. It is not shared between users or devices.'
    expect(DEMO_DISCLAIMER).toBe(expected)
    expect(screen.getByText(expected)).toBeInTheDocument()
    expect(document.body.textContent).toContain('fitcional')
  })
  it('uses "Vector Lab" with a space', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    expect(document.body.textContent).toContain('Vector Lab')
    expect(document.body.textContent).not.toContain('VectorLab')
  })
})

describe('My Labs', () => {
  const renderLabs = () => render(<MemoryRouter><LabsMap /></MemoryRouter>)
  it('shows five separate lab cards with the right names and characters', () => {
    renderLabs()
    const cards = screen.getAllByRole('listitem')
    expect(cards).toHaveLength(5)
    const text = cards.map((c) => c.textContent ?? '')
    const expected: [string, string][] = [['Vector Lab', 'Hector'], ['Vertex Lab', 'Tex'], ['Axis Lab', 'Axel'], ['Slope Lab', 'Slobber'], ['Curve Lab', 'Kirby']]
    expected.forEach(([lab, mascot], i) => {
      expect(text[i]).toContain(lab)
      expect(text[i]).toContain(mascot)
    })
  })
  it('only Slope Lab is openable; the others say In Development', () => {
    renderLabs()
    expect(screen.getAllByText('In Development')).toHaveLength(4)
    expect(screen.getAllByRole('link', { name: /Open/ })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Open Slope Lab/ })).toBeInTheDocument()
  })
  it('has the required footer text and no VectorLab spelling', () => {
    renderLabs()
    expect(screen.getByText('Slope Lab (Slobber) has a complete playable lesson. The other labs are still under construction :/')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('VectorLab')
  })
})

describe('teacher portal', () => {
  it('names the teacher Mr John Leary', () => {
    signIn('teacher')
    render(<MemoryRouter><TeacherLayout /></MemoryRouter>)
    expect(screen.getByText('Mr John Leary')).toBeInTheDocument()
    expect(DEMO_CLASS.teacherName).toBe('Mr John Leary')
    expect(document.body.textContent).not.toContain('Rivera')
  })
  it('Lesson Library has no Question Demands section and has four compact, collapsed In Development panels', () => {
    const { container } = render(<MemoryRouter><LessonLibrary /></MemoryRouter>)
    expect(screen.queryByText(/Question demands/i)).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Understanding Gradient' })).toBeInTheDocument()
    const panels = Array.from(container.querySelectorAll('details'))
    expect(panels).toHaveLength(4)
    const names = panels.map((p) => p.querySelector('summary')?.textContent ?? '')
    for (const lab of ['In Development: Axis Lab', 'In Development: Vector Lab', 'In Development: Vertex Lab', 'In Development: Curve Lab']) {
      expect(names.some((n) => n.includes(lab))).toBe(true)
    }
    for (const p of panels) {
      expect(p.open).toBe(false)
      expect(p.querySelector('summary')?.textContent).toContain('In Development')
    }
  })
  it('each In Development panel has the Slope Lab field headings in the same order, each showing only a dash', () => {
    const { container } = render(<MemoryRouter><LessonLibrary /></MemoryRouter>)
    const article = container.querySelector('article')!
    const slopeHeadings = Array.from(article.querySelectorAll('dt')).map((d) => d.textContent)
    for (const panel of Array.from(container.querySelectorAll('details'))) {
      expect(Array.from(panel.querySelectorAll('dt')).map((d) => d.textContent)).toEqual(slopeHeadings)
      for (const dd of Array.from(panel.querySelectorAll('dd'))) expect(dd.textContent).toBe('\u2014')
    }
    expect(slopeHeadings).toHaveLength(14)
  })
})
