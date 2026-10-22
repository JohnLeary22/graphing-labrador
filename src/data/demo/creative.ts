import type { CharacterId, Equipped, Transaction } from '@/types'
import { itemById } from '@/data/curriculum/shop'
import { balanceOf, makeId } from '@/lib/rewards/economy'

/**
 * Creative mode (EDUC2151 workshop only): the fictional classmates each get their own character and look,
 * and one classmate, Kirby, wears every legendary item and sits at the top of the leaderboard.
 * Counts: Hector 3, Tex 2, Slobber 2, Axel 1, Kirby 1.
 */
export const CREATIVE_LOOKS: Record<string, Equipped & { character: CharacterId }> = {
  s2: { character: 'slope', hat: 'hat-cap', neckwear: 'neck-bandana', eyewear: 'eye-sport', background: 'bg-forest' },
  s3: { character: 'axis', hat: 'hat-beret', neckwear: 'neck-flowers', eyewear: 'eye-heart', background: 'bg-sunset' },
  s4: { character: 'vector', hat: 'hat-viking', neckwear: 'neck-cape', eyewear: 'eye-shades', background: 'bg-volcano' },
  s5: { character: 'slope', hat: 'hat-chef', neckwear: 'neck-necktie', eyewear: 'eye-glasses', background: 'bg-mint' },
  s6: { character: 'curve', hat: 'hat-halo', neckwear: 'neck-stars', eyewear: 'eye-galaxy', background: 'bg-cosmos' },
  s7: { character: 'vector', hat: 'hat-wizard', neckwear: 'neck-pearls', eyewear: 'eye-monocle', background: 'bg-aurora' },
  s8: { character: 'vertex', hat: 'hat-headphones', neckwear: 'neck-medal', eyewear: 'eye-goggles', background: 'bg-city' },
  s9: { character: 'vertex', hat: 'hat-bucket', neckwear: 'neck-lei', eyewear: 'eye-neon', background: 'bg-ocean' },
  s10: { character: 'vector', hat: 'hat-pirate', neckwear: 'neck-gold', eyewear: 'eye-patch', background: 'bg-space' },
}

/** The classmate shown as Kirby with all four legendary items. */
export const CREATIVE_TOP_STUDENT = 's6'
export const CREATIVE_TOP_XP = 4800

const RARITY_WEIGHT: Record<string, number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 10 }

/** Total rarity of the four items a classmate wears. */
export function lookScore(look: Equipped): number {
  return [look.hat, look.neckwear, look.eyewear, look.background].reduce((sum, id) => sum + (RARITY_WEIGHT[itemById(id ?? '')?.rarity ?? ''] ?? 0), 0)
}

export const CREATIVE_XP_SECOND = 2800
export const CREATIVE_XP_LOWEST = 200

/**
 * Target XP for each classmate other than the top one: rarer looks get more XP, spread evenly
 * from 2800 for the second place down to 200 for the lowest.
 */
export function creativeXpTargets(): Record<string, number> {
  const ranked = Object.entries(CREATIVE_LOOKS)
    .filter(([id]) => id !== CREATIVE_TOP_STUDENT)
    .sort((a, b) => lookScore(b[1]) - lookScore(a[1]))
  const step = (CREATIVE_XP_SECOND - CREATIVE_XP_LOWEST) / (ranked.length - 1)
  return Object.fromEntries(ranked.map(([id], i) => [id, Math.round((CREATIVE_XP_SECOND - i * step) / 10) * 10]))
}

/** Adds the transactions that bring each classmate up to their target XP. Safe to run more than once. */
export function withCreativeXp(txs: Transaction[], at: string): Transaction[] {
  const out = [...txs]
  for (const [id, target] of Object.entries(creativeXpTargets())) {
    const key = `XP:creative-xp:${id}`
    if (out.some((t) => t.key === key)) continue
    const current = balanceOf(out, id, 'XP')
    if (target > current) out.push({ id: makeId('tx'), studentId: id, type: 'XP', amount: target - current, reason: 'Creative mode showcase', key, at })
  }
  return out
}
