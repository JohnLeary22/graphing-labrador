import type { Point } from '@/types'

export interface Bounds {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface Viewport extends Bounds {
  width: number
  height: number
  padding: number
}

/** Maps mathematical coordinates to SVG pixels (y axis points up in maths, down in SVG). */
export function toPixel(v: Viewport, p: Point): Point {
  const w = v.width - 2 * v.padding
  const h = v.height - 2 * v.padding
  return {
    x: v.padding + ((p.x - v.xMin) / (v.xMax - v.xMin)) * w,
    y: v.padding + ((v.yMax - p.y) / (v.yMax - v.yMin)) * h,
  }
}

export function toMath(v: Viewport, px: Point): Point {
  const w = v.width - 2 * v.padding
  const h = v.height - 2 * v.padding
  return {
    x: v.xMin + ((px.x - v.padding) / w) * (v.xMax - v.xMin),
    y: v.yMax - ((px.y - v.padding) / h) * (v.yMax - v.yMin),
  }
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export function snap(n: number, step: number): number {
  const s = Math.round(n / step) * step
  // Remove floating point noise such as 0.30000000000000004.
  return Math.round(s * 1e6) / 1e6
}

export function clampPoint(p: Point, b: Bounds): Point {
  return { x: clamp(p.x, b.xMin, b.xMax), y: clamp(p.y, b.yMin, b.yMax) }
}

export type Gradient =
  | { kind: 'defined'; rise: number; run: number; value: number }
  | { kind: 'undefined'; rise: number; run: 0 }

/** Gradient = rise / run. A vertical line (run = 0) has an undefined gradient, not zero. */
export function gradient(a: Point, b: Point): Gradient {
  const rise = b.y - a.y
  const run = b.x - a.x
  if (run === 0) return { kind: 'undefined', rise, run: 0 }
  return { kind: 'defined', rise, run, value: rise / run }
}

export function yIntercept(a: Point, b: Point): number | null {
  const g = gradient(a, b)
  if (g.kind === 'undefined') return null
  return a.y - g.value * a.x
}

/** Evaluate y = mx + c. */
export function evalLinear(m: number, c: number, x: number): number {
  return m * x + c
}

export function xInterceptOfLinear(m: number, c: number): number | null {
  if (m === 0) return null
  return -c / m
}

/** Endpoints of the infinite line through a and b, clipped to the bounds. Returns null if a === b. */
export function lineEndpoints(a: Point, b: Point, bounds: Bounds): [Point, Point] | null {
  if (a.x === b.x && a.y === b.y) return null
  if (a.x === b.x) return [{ x: a.x, y: bounds.yMin }, { x: a.x, y: bounds.yMax }]
  const m = (b.y - a.y) / (b.x - a.x)
  const c = a.y - m * a.x
  if (m === 0) return [{ x: bounds.xMin, y: c }, { x: bounds.xMax, y: c }]
  const candidates: Point[] = [
    { x: bounds.xMin, y: m * bounds.xMin + c },
    { x: bounds.xMax, y: m * bounds.xMax + c },
    { x: (bounds.yMin - c) / m, y: bounds.yMin },
    { x: (bounds.yMax - c) / m, y: bounds.yMax },
  ].filter(
    (p) =>
      p.x >= bounds.xMin - 1e-9 && p.x <= bounds.xMax + 1e-9 && p.y >= bounds.yMin - 1e-9 && p.y <= bounds.yMax + 1e-9,
  )
  if (candidates.length < 2) return null
  candidates.sort((p, q) => p.x - q.x || p.y - q.y)
  return [candidates[0], candidates[candidates.length - 1]]
}

export function quadrant(p: Point): 1 | 2 | 3 | 4 | 'axis' {
  if (p.x === 0 || p.y === 0) return 'axis'
  if (p.x > 0) return p.y > 0 ? 1 : 4
  return p.y > 0 ? 2 : 3
}

/** Tick values from min to max at multiples of step. */
export function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = []
  const start = Math.ceil(min / step - 1e-9)
  const end = Math.floor(max / step + 1e-9)
  for (let i = start; i <= end; i++) out.push(Math.round(i * step * 1e6) / 1e6 || 0)
  return out
}

export function formatNumber(n: number, maxDecimals = 2): string {
  if (Object.is(n, -0)) return '0'
  const s = n.toFixed(maxDecimals)
  return String(parseFloat(s))
}

export function formatGradient(g: Gradient): string {
  return g.kind === 'undefined' ? 'undefined' : formatNumber(g.value)
}

/** Zoom bounds about their centre. factor < 1 zooms in. */
export function zoomBounds(b: Bounds, factor: number): Bounds {
  const cx = (b.xMin + b.xMax) / 2
  const cy = (b.yMin + b.yMax) / 2
  const hw = ((b.xMax - b.xMin) / 2) * factor
  const hh = ((b.yMax - b.yMin) / 2) * factor
  return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh }
}
