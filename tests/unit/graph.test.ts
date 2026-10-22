import { describe, expect, it } from 'vitest'
import { clamp, formatGradient, gradient, lineEndpoints, quadrant, snap, ticks, toMath, toPixel, xInterceptOfLinear, yIntercept, zoomBounds } from '@/lib/math/graph'
import type { Viewport } from '@/lib/math/graph'

const vp: Viewport = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, width: 440, height: 440, padding: 20 }

describe('coordinate transforms', () => {
  it('places the origin in the centre of the plot area', () => {
    expect(toPixel(vp, { x: 0, y: 0 })).toEqual({ x: 220, y: 220 })
  })
  it('puts positive y above the origin (smaller pixel y)', () => {
    expect(toPixel(vp, { x: 0, y: 5 }).y).toBe(20)
    expect(toPixel(vp, { x: 0, y: -5 }).y).toBe(420)
  })
  it('round-trips arbitrary points including fractions and negatives', () => {
    for (const p of [{ x: -3, y: 2 }, { x: 4.5, y: -1.25 }, { x: 0.1, y: 0.3 }]) {
      const back = toMath(vp, toPixel(vp, p))
      expect(back.x).toBeCloseTo(p.x, 9)
      expect(back.y).toBeCloseTo(p.y, 9)
    }
  })
  it('maps bounds corners to the padding edges', () => {
    expect(toPixel(vp, { x: -5, y: 5 })).toEqual({ x: 20, y: 20 })
    expect(toPixel(vp, { x: 5, y: -5 })).toEqual({ x: 420, y: 420 })
  })
})

describe('gradient', () => {
  it('A(1,2) B(3,6) has gradient 2', () => {
    expect(gradient({ x: 1, y: 2 }, { x: 3, y: 6 })).toEqual({ kind: 'defined', rise: 4, run: 2, value: 2 })
  })
  it('handles negative gradients', () => {
    const g = gradient({ x: 1, y: 6 }, { x: 4, y: 0 })
    expect(g.kind === 'defined' && g.value).toBe(-2)
  })
  it('is order independent', () => {
    const a = gradient({ x: 1, y: 2 }, { x: 3, y: 6 })
    const b = gradient({ x: 3, y: 6 }, { x: 1, y: 2 })
    expect(a.kind === 'defined' && b.kind === 'defined' && a.value === b.value).toBe(true)
  })
  it('horizontal line has gradient 0 (not undefined)', () => {
    const g = gradient({ x: -2, y: 3 }, { x: 4, y: 3 })
    expect(g.kind === 'defined' && g.value).toBe(0)
  })
  it('vertical line is undefined, not 0', () => {
    const g = gradient({ x: 2, y: -1 }, { x: 2, y: 5 })
    expect(g.kind).toBe('undefined')
    expect(formatGradient(g)).toBe('undefined')
  })
  it('handles fractional coordinates', () => {
    const g = gradient({ x: 0.5, y: 1.5 }, { x: 2.5, y: 2.5 })
    expect(g.kind === 'defined' && g.value).toBeCloseTo(0.5)
  })
})

describe('intercepts and lines', () => {
  it('y-intercept of y = 2x + 1 is 1', () => {
    expect(yIntercept({ x: 0, y: 1 }, { x: 1, y: 3 })).toBe(1)
  })
  it('x-intercept of y = -x + 4 is 4', () => {
    expect(xInterceptOfLinear(-1, 4)).toBe(4)
  })
  it('horizontal lines have no x-intercept', () => {
    expect(xInterceptOfLinear(0, 3)).toBeNull()
  })
  it('vertical line has no y-intercept', () => {
    expect(yIntercept({ x: 2, y: 0 }, { x: 2, y: 1 })).toBeNull()
  })
  it('clips a diagonal line to the bounds', () => {
    const b = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }
    const ends = lineEndpoints({ x: 0, y: 0 }, { x: 1, y: 2 }, b)!
    expect(ends[0]).toEqual({ x: -2.5, y: -5 })
    expect(ends[1]).toEqual({ x: 2.5, y: 5 })
  })
  it('extends vertical and horizontal lines across the bounds', () => {
    const b = { xMin: -5, xMax: 5, yMin: -3, yMax: 3 }
    expect(lineEndpoints({ x: 2, y: 0 }, { x: 2, y: 1 }, b)).toEqual([{ x: 2, y: -3 }, { x: 2, y: 3 }])
    expect(lineEndpoints({ x: 0, y: 1 }, { x: 1, y: 1 }, b)).toEqual([{ x: -5, y: 1 }, { x: 5, y: 1 }])
  })
  it('returns null for identical points', () => {
    expect(lineEndpoints({ x: 1, y: 1 }, { x: 1, y: 1 }, { xMin: -5, xMax: 5, yMin: -5, yMax: 5 })).toBeNull()
  })
})

describe('helpers', () => {
  it('snaps to a step without floating point noise', () => {
    expect(snap(0.30000000000000004, 0.1)).toBe(0.3)
    expect(snap(2.4, 1)).toBe(2)
    expect(snap(-2.6, 1)).toBe(-3)
  })
  it('clamps at the plotting boundary', () => {
    expect(clamp(9, -5, 5)).toBe(5)
    expect(clamp(-9, -5, 5)).toBe(-5)
  })
  it('classifies quadrants', () => {
    expect(quadrant({ x: -3, y: 2 })).toBe(2)
    expect(quadrant({ x: 4, y: -1 })).toBe(4)
    expect(quadrant({ x: 0, y: 2 })).toBe('axis')
  })
  it('generates ticks at multiples of the step', () => {
    expect(ticks(-5, 5, 5)).toEqual([-5, 0, 5])
    expect(ticks(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })
  it('zooms about the centre', () => {
    expect(zoomBounds({ xMin: -4, xMax: 4, yMin: -2, yMax: 2 }, 0.5)).toEqual({ xMin: -2, xMax: 2, yMin: -1, yMax: 1 })
  })
})
