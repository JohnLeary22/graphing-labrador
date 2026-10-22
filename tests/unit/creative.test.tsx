import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NamePrompt, CREATIVE_MODE_DESCRIPTION } from '@/pages/student/NamePrompt'
import { Shop } from '@/pages/student/Shop'
import { Leaderboard } from '@/pages/student/Leaderboard'
import { QuestionCard } from '@/components/assessments/QuestionCard'
import { getState, resetDemo } from '@/services/persistence/store'
import { buyItem, coinsFor, setStudentName, signIn } from '@/services/persistence/actions'
import { DEMO_STUDENT_ID } from '@/data/demo/seed'
import { CREATIVE_LOOKS } from '@/data/demo/creative'
import { SHOP_ITEMS } from '@/data/curriculum/shop'
import { questionById } from '@/data/lessons/gradient'

const S = DEMO_STUDENT_ID

beforeEach(() => {
  resetDemo()
  signIn('student')
})

describe('Creative mode checkbox on the name screen', () => {
  it('shows the checkbox titled Creative mode with the exact description, unticked by default', () => {
    render(<NamePrompt studentId={S} />)
    const box = screen.getByRole('checkbox', { name: 'Creative mode' })
    expect(box).not.toBeChecked()
    expect(box).toHaveAccessibleDescription('This is implemented for EDUC2151 only - unlimited coins are granted to workshop rewards')
    expect(CREATIVE_MODE_DESCRIPTION).toBe('This is implemented for EDUC2151 only - unlimited coins are granted to workshop rewards')
  })
  it('turns Creative mode on only when ticked, and still requires a name', () => {
    render(<NamePrompt studentId={S} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Your preferred name'), { target: { value: 'Alex' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Creative mode' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(getState().creativeMode).toBe(true)
    expect(getState().students.find((s) => s.id === S)!.name).toBe('Alex')
  })
  it('leaves normal mode untouched when not ticked', () => {
    setStudentName(S, 'Alex', false)
    expect(getState().creativeMode).toBe(false)
    expect(Object.keys(getState().appearance)).toEqual([S])
  })
})

describe('Creative mode coins', () => {
  it('shows an infinity symbol for the balance, never "need more", and does not deduct on purchase', () => {
    setStudentName(S, 'Alex', true)
    const before = coinsFor(getState(), S)
    render(<MemoryRouter><Shop /></MemoryRouter>)
    expect(screen.getAllByText(/\u221e coins/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/need \d+ more/)).toBeNull()
    expect(buyItem(S, 'bg-cosmos')).toEqual({ ok: true })
    expect(getState().inventory[S]).toContain('bg-cosmos')
    expect(coinsFor(getState(), S)).toBe(before)
    expect(buyItem(S, 'bg-cosmos')).toEqual({ ok: false, error: 'owned' })
  })
  it('can buy every item, including the most expensive', () => {
    setStudentName(S, 'Alex', true)
    for (const i of SHOP_ITEMS) expect(buyItem(S, i.id)).toEqual({ ok: true })
    expect(getState().inventory[S]).toHaveLength(SHOP_ITEMS.length)
  })
  it('still shows the coin gain badge on a question while the balance stays infinite', () => {
    setStudentName(S, 'Alex', true)
    render(<MemoryRouter><QuestionCard question={questionById('grad-youdo-1')!} lessonId="gradient" studentId={S} onResolved={() => {}} /></MemoryRouter>)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1/2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByText('+10 coins')).toBeInTheDocument()
  })
  it('normal mode still enforces the balance', () => {
    setStudentName(S, 'Alex', false)
    expect(buyItem(S, 'bg-cosmos')).toEqual({ ok: false, error: 'insufficient' })
  })
})

describe('Creative mode classmates', () => {
  const looks = Object.values(CREATIVE_LOOKS)
  it('gives all nine classmates a look, with every character used and uneven numbers', () => {
    const counts: Record<string, number> = {}
    for (const l of looks) counts[l.character] = (counts[l.character] ?? 0) + 1
    expect(looks).toHaveLength(9)
    expect(Object.keys(counts).sort()).toEqual(['axis', 'curve', 'slope', 'vector', 'vertex'])
    expect(counts.slope).toBeLessThanOrEqual(2)
    expect(counts.axis).toBeLessThanOrEqual(2)
    expect(new Set(Object.values(counts)).size).toBeGreaterThan(2)
  })
  it('gives every classmate a different set of cosmetics', () => {
    const keys = looks.map((l) => `${l.hat}|${l.neckwear}|${l.eyewear}|${l.background}`)
    expect(new Set(keys).size).toBe(9)
    for (const k of ['hat', 'neckwear', 'eyewear', 'background'] as const) expect(new Set(looks.map((l) => l[k])).size).toBe(9)
  })
  it('makes exactly one Kirby, wearing all four legendary items', () => {
    const kirbys = looks.filter((l) => l.character === 'curve')
    expect(kirbys).toHaveLength(1)
    const legends = SHOP_ITEMS.filter((i) => i.rarity === 'legendary' && i.category !== 'character').map((i) => i.id).sort()
    expect([kirbys[0].hat, kirbys[0].neckwear, kirbys[0].eyewear, kirbys[0].background].sort()).toEqual(legends)
    expect(looks.filter((l) => legends.includes(l.hat ?? '')).length).toBe(1)
  })
  it('puts Kirby at the top of the leaderboard with high XP, only in Creative mode', () => {
    setStudentName(S, 'Alex', true)
    const { container } = render(<MemoryRouter><Leaderboard /></MemoryRouter>)
    const first = container.querySelector('ol li')!
    expect(first.textContent).toContain('Noah')
    expect(first.textContent).toMatch(/4\d{3} XP/)
    expect(getState().appearance.s6.character).toBe('curve')
  })
  it('does not apply showcase looks in normal mode', () => {
    setStudentName(S, 'Alex', false)
    const { container } = render(<MemoryRouter><Leaderboard /></MemoryRouter>)
    expect(container.querySelector('ol li')!.textContent).not.toMatch(/4\d{3} XP/)
    expect(getState().appearance.s6).toBeUndefined()
  })
})
