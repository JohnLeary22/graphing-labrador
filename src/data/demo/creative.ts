import type { CharacterId, Equipped } from '@/types'

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
