import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SHOP_ITEMS } from '@/data/curriculum/shop'
import { BACKGROUNDS, EYES, HATS, NECK } from '@/components/mascots/cosmetics'
import { Labrador } from '@/components/mascots/Labrador'
import { Shop } from '@/pages/student/Shop'
import { getState, resetDemo } from '@/services/persistence/store'
import { DEMO_STUDENT_ID } from '@/data/demo/seed'
import { setStudentName, signIn } from '@/services/persistence/actions'
import { coinsFor } from '@/services/persistence/actions'
import type { Rarity } from '@/types'

const S = DEMO_STUDENT_ID
const CATS = ['hat', 'neckwear', 'eyewear', 'background'] as const
const ART = { hat: HATS, neckwear: NECK, eyewear: EYES, background: BACKGROUNDS }
const ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

describe('shop catalogue', () => {
  it('has no coat colour category or items', () => {
    expect(SHOP_ITEMS.some((i) => (i.category as string) === 'colour' || i.id.startsWith('col-'))).toBe(false)
  })
  it.each(CATS)('%s has 5 common, 4 uncommon, 3 rare, 2 epic and exactly 1 legendary item', (cat) => {
    const items = SHOP_ITEMS.filter((i) => i.category === cat)
    const count = (r: Rarity) => items.filter((i) => i.rarity === r).length
    expect(ORDER.map(count)).toEqual([5, 4, 3, 2, 1])
  })
  it.each(CATS)('every %s item has artwork and an unique id', (cat) => {
    const items = SHOP_ITEMS.filter((i) => i.category === cat)
    for (const i of items) expect(ART[cat][i.id], i.id).toBeTruthy()
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })
  it('rarer items cost more on average, and legendaries are the most expensive in their category', () => {
    for (const cat of CATS) {
      const items = SHOP_ITEMS.filter((i) => i.category === cat)
      const avg = (r: Rarity) => items.filter((i) => i.rarity === r).reduce((a, i) => a + i.price, 0) / items.filter((i) => i.rarity === r).length
      const avgs = ORDER.map(avg)
      expect([...avgs].sort((a, b) => a - b)).toEqual(avgs)
      expect(items.find((i) => i.rarity === 'legendary')!.price).toBe(Math.max(...items.map((i) => i.price)))
    }
  })
  it('keeps the ids and prices of items players may already own', () => {
    const price = (id: string) => SHOP_ITEMS.find((i) => i.id === id)?.price
    expect(price('neck-bandana')).toBe(25)
    expect(price('hat-crown')).toBe(300)
    expect(price('bg-night')).toBe(130)
    expect(SHOP_ITEMS.filter((i) => i.category === 'character')).toHaveLength(4)
  })
})

describe('legendary artwork', () => {
  const legends = SHOP_ITEMS.filter((i) => i.rarity === 'legendary' && i.category !== 'character')
  it('has one legendary per category and each is animated', () => {
    expect(legends).toHaveLength(4)
    for (const item of legends) {
      const cat = item.category as (typeof CATS)[number]
      const { container } = render(<svg>{ART[cat][item.id]}</svg>)
      expect(container.querySelector('.leg-float, .leg-glow, .leg-twinkle, .leg-spin'), item.id).not.toBeNull()
    }
  })
  it('non-legendary artwork is not animated', () => {
    for (const cat of CATS) {
      for (const item of SHOP_ITEMS.filter((i) => i.category === cat && i.rarity !== 'legendary')) {
        const { container } = render(<svg>{ART[cat][item.id]}</svg>)
        expect(container.querySelector('[class*="leg-"]'), item.id).toBeNull()
      }
    }
  })
  it('renders every cosmetic on every character without error', () => {
    for (const c of ['vector', 'vertex', 'axis', 'slope', 'curve'] as const) {
      const eq = { hat: 'hat-halo', neckwear: 'neck-stars', eyewear: 'eye-galaxy', background: 'bg-cosmos' }
      const { container } = render(<Labrador character={c} equipped={eq} />)
      expect(container.querySelectorAll('.leg-twinkle').length).toBeGreaterThan(3)
    }
  })
})

describe('shop page', () => {
  beforeEach(() => {
    resetDemo()
    signIn('student')
    setStudentName(S, 'Alex')
  })
  it('lists All from the lowest price to the highest', () => {
    render(<MemoryRouter><Shop /></MemoryRouter>)
    const cards = screen.getAllByRole('listitem')
    const prices = cards.map((li) => Number((within(li).getByRole('button', { name: /\d/ }).textContent ?? '').match(/\d+/)![0]))
    expect(prices).toHaveLength(SHOP_ITEMS.length)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
    expect(prices[0]).toBe(20)
    expect(prices[prices.length - 1]).toBe(900)
  })
  it('has no coat colours filter', () => {
    render(<MemoryRouter><Shop /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /coat/i })).toBeNull()
  })
})

describe('saved data from before the change', () => {
  it('refunds removed coat colours once, unequips them and keeps everything else', async () => {
    resetDemo()
    const raw = JSON.parse(localStorage.getItem('graphing-labrador-demo-v1')!)
    raw.inventory[S] = ['neck-bandana', 'col-black']
    raw.appearance[S] = { character: 'vector', neckwear: 'neck-bandana', colour: 'col-black' }
    const before = raw.transactions.filter((t: { studentId: string }) => t.studentId === S).reduce((a: number, t: { type: string; amount: number }) => a + (t.type === 'COINS' ? t.amount : 0), 0)
    localStorage.setItem('graphing-labrador-demo-v1', JSON.stringify(raw))
    vi.resetModules()
    const fresh = await import('@/services/persistence/store')
    const st = fresh.getState()
    expect(st.inventory[S]).toEqual(['neck-bandana'])
    expect(st.appearance[S]).toEqual({ character: 'vector', neckwear: 'neck-bandana' })
    expect(coinsFor(st, S)).toBe(before + 90)
    // Loading again does not refund twice.
    vi.resetModules()
    const again = await import('@/services/persistence/store')
    expect(coinsFor(again.getState(), S)).toBe(before + 90)
  })
  it('does nothing to a normal save', () => {
    resetDemo()
    expect(getState().inventory[S]).toEqual([])
  })
})
