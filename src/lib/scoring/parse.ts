/**
 * Parses student numeric input. Accepts integers, decimals, fractions ("-3/4"),
 * mixed whitespace, a Unicode minus sign and a trailing unit ("15 km/h").
 * Returns null if no number can be read.
 */
const NUMBER_RE = /^([-+]?\s*\d*\.?\d+)\s*(?:\/\s*(-?\d*\.?\d+))?/

function clean(input: string): string {
  return input.trim().replace(/\u2212/g, '-').replace(/(\d),(?=\d{3}\b)/g, '$1')
}

export function parseNumber(input: string): number | null {
  const m = clean(input).match(NUMBER_RE)
  if (!m) return null
  const num = parseFloat(m[1].replace(/\s+/g, ''))
  if (Number.isNaN(num)) return null
  if (m[2] !== undefined) {
    const den = parseFloat(m[2])
    if (den === 0 || Number.isNaN(den)) return null
    return num / den
  }
  return num
}

/** Text left after the leading number, lower-cased and trimmed, e.g. "km/h". */
export function trailingText(input: string): string {
  return clean(input).replace(NUMBER_RE, '').trim().toLowerCase()
}

/**
 * Canonical form of a unit so spelling variants compare equal, e.g. "kilometres per hour",
 * "km/hr" and "Km / H" all become "km/h". Different units stay different.
 */
export function normaliseUnit(raw: string): string {
  let s = raw.toLowerCase().replace(/[.]/g, '')
  s = s.replace(/kilomet(?:er|re)s?/g, 'km').replace(/\bmet(?:er|re)s?\b/g, 'm')
  s = s.replace(/\b(?:hours?|hrs?)\b/g, 'h').replace(/\bminutes?\b|\bmins?\b/g, 'min').replace(/\bseconds?\b|\bsecs?\b/g, 's')
  s = s.replace(/\blit(?:er|re)s?\b/g, 'l').replace(/degrees?\s*celsius|\bdegrees?\b|\bcelsius\b|°\s*c\b/g, '°c')
  s = s.replace(/\bdollars?\b/g, '$').replace(/\bper\b/g, '/')
  s = s.replace(/\s+/g, '')
  s = s.replace(/\/hrs?$/, '/h')
  if (s === 'kmh' || s === 'kph' || s === 'kmph' || s === 'kmhr') s = 'km/h'
  return s
}

export function approxEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance
}
