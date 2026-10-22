import type { Point } from '@/types'
import { formatNumber } from '@/lib/math/graph'

function readGroup(s: string, i: number): [string, number] {
  if (s[i] !== '{') return [s[i] ?? '', i + 1]
  let depth = 0
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1]
  }
  return [s.slice(i + 1), s.length]
}

/** Converts simple TeX to words for screen readers, e.g. \dfrac{4}{2} -> "4 over 2". */
export function speak(tex: string): string {
  let s = tex.replace(/\\htmlClass\{[^}]*\}/g, '')
  for (;;) {
    const m = s.match(/\\d?frac/)
    if (!m || m.index === undefined) break
    const [a, i1] = readGroup(s, m.index + m[0].length)
    const [b, i2] = readGroup(s, i1)
    s = `${s.slice(0, m.index)} ${a} over ${b} ${s.slice(i2)}`
  }
  s = s
    .replace(/\\(?:text|mathbf|mathrm)\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:left|right)/g, '')
    .replace(/\^\{\\circ\}/g, ' degrees ')
    .replace(/\\times/g, ' times ')
    .replace(/\\(?:,|;|:|!|quad|qquad)|~|\\ /g, ' ')
    .replace(/\^\{?2\}?/g, ' squared')
    .replace(/\^\{?3\}?/g, ' cubed')
    .replace(/\^\{([^}]*)\}|\^(.)/g, ' to the power of $1$2')
    .replace(/_\{([^}]*)\}|_(.)/g, ' $1$2')
    .replace(/[{}]/g, '')
    .replace(/-/g, ' minus ')
    .replace(/=/g, ' equals ')
    .replace(/\\/g, '')
  return s.replace(/\s+/g, ' ').trim()
}

/** Plain-text version of a string containing $...$ maths, for tables and truncated previews. */
export function plainMath(text: string): string {
  return text.replace(/\$\$?([^$]+)\$\$?/g, (_, t: string) => speak(t))
}

const isLetter = (l: string) => /^[A-Za-z]$/.test(l)
const sub = (l: string) => (isLetter(l) ? l : `\\text{${l.replace(/[^A-Za-z0-9 ]/g, '')}}`)
/** Negative values are bracketed and emphasised so students can see why 1 - (-1) = 2. */
const sv = (n: number) => (n < 0 ? `\\htmlClass{m-neg}{(${formatNumber(n)})}` : formatNumber(n))
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function gradientTex(a: Point & { label: string }, b: Point & { label: string }): { tex: string; alt: string } | null {
  const rise = b.y - a.y
  const run = b.x - a.x
  if (run === 0) return null
  const rise_ = (t: string) => `\\htmlClass{m-rise}{${t}}`
  const run_ = (t: string) => `\\htmlClass{m-run}{${t}}`
  const value = rise / run
  const A = sub(a.label)
  const B = sub(b.label)
  const ints = Number.isInteger(rise) && Number.isInteger(run)
  let reduced = ''
  let reducedAlt = ''
  if (ints && gcd(rise, run) > 1) {
    const g = gcd(rise, run)
    const r = rise / g
    const n = run / g
    const sign = n < 0 ? -1 : 1
    if (Math.abs(n) !== 1) {
      reduced = ` = \\dfrac{${rise_(String(r * sign))}}{${run_(String(Math.abs(n)))}}`
      reducedAlt = `, which simplifies to ${r * sign} over ${Math.abs(n)}`
    }
  }
  const tail = ` = \\htmlClass{m-result}{${formatNumber(value)}}`
  const tex =
    `m = \\dfrac{${rise_(`y_{${B}} - y_{${A}}`)}}{${run_(`x_{${B}} - x_{${A}}`)}}` +
    ` = \\dfrac{${rise_(`${sv(b.y)} - ${sv(a.y)}`)}}{${run_(`${sv(b.x)} - ${sv(a.x)}`)}}` +
    ` = \\dfrac{${rise_(formatNumber(rise))}}{${run_(formatNumber(run))}}${reduced}${tail}`
  const alt =
    `Gradient equals rise over run: y ${b.label} minus y ${a.label}, over x ${b.label} minus x ${a.label}. ` +
    `Substituting: ${formatNumber(b.y)} minus ${a.y < 0 ? `negative ${formatNumber(Math.abs(a.y))}` : formatNumber(a.y)}, over ${formatNumber(b.x)} minus ${a.x < 0 ? `negative ${formatNumber(Math.abs(a.x))}` : formatNumber(a.x)}. ` +
    `That is ${formatNumber(rise)} over ${formatNumber(run)}${reducedAlt}, which equals ${formatNumber(value)}.`
  return { tex, alt }
}
