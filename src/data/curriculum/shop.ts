import type { ShopItem } from '@/types'

export const SHOP_ITEMS: ShopItem[] = [
  // Headwear: 5 common, 4 uncommon, 3 rare, 2 epic, 1 legendary
  { id: 'hat-headband', name: 'Red Headband', category: 'hat', price: 25, rarity: 'common', description: 'A simple sweatband for hard-working Labradors.' },
  { id: 'hat-bucket', name: 'Bucket Hat', category: 'hat', price: 30, rarity: 'common', description: 'Sun-safe and relaxed.' },
  { id: 'hat-party', name: 'Party Hat', category: 'hat', price: 35, rarity: 'common', description: 'For celebrating a correct answer.' },
  { id: 'hat-beanie', name: 'Navy Beanie', category: 'hat', price: 40, rarity: 'common', description: 'A cosy knit beanie.' },
  { id: 'hat-flat', name: 'Flat Cap', category: 'hat', price: 45, rarity: 'common', description: 'A classic grey flat cap.' },
  { id: 'hat-beret', name: 'Beret', category: 'hat', price: 65, rarity: 'uncommon', description: 'Artistic and slightly tilted.' },
  { id: 'hat-cap', name: 'Lab Cap', category: 'hat', price: 70, rarity: 'uncommon', description: 'A baseball cap with an amber brim.' },
  { id: 'hat-chef', name: 'Chef Hat', category: 'hat', price: 75, rarity: 'uncommon', description: 'Cooking up some mathematics.' },
  { id: 'hat-cowboy', name: 'Cowboy Hat', category: 'hat', price: 80, rarity: 'uncommon', description: 'Rides the number line.' },
  { id: 'hat-headphones', name: 'Study Headphones', category: 'hat', price: 120, rarity: 'rare', description: 'For focused independent practice.' },
  { id: 'hat-wizard', name: 'Wizard Hat', category: 'hat', price: 140, rarity: 'rare', description: 'Spellbinding graph skills.' },
  { id: 'hat-pirate', name: 'Pirate Hat', category: 'hat', price: 150, rarity: 'rare', description: 'Plots a course by coordinates.' },
  { id: 'hat-crown', name: 'Gradient Crown', category: 'hat', price: 300, rarity: 'epic', description: 'Awarded to people who really like steep lines.' },
  { id: 'hat-viking', name: 'Viking Helmet', category: 'hat', price: 330, rarity: 'epic', description: 'Conquers every quadrant.' },
  { id: 'hat-halo', name: 'Golden Halo', category: 'hat', price: 800, rarity: 'legendary', description: 'A floating, glowing halo with twinkling stars.' },

  // Neckwear
  { id: 'neck-ribbon', name: 'Pink Ribbon', category: 'neckwear', price: 20, rarity: 'common', description: 'A neat bow at the collar.' },
  { id: 'neck-bandana', name: 'Grid Bandana', category: 'neckwear', price: 25, rarity: 'common', description: 'A bandana printed with a tiny coordinate grid.' },
  { id: 'neck-bell', name: 'Jingle Bell', category: 'neckwear', price: 30, rarity: 'common', description: 'A bright gold bell on a red collar.' },
  { id: 'neck-necktie', name: 'Blue Necktie', category: 'neckwear', price: 40, rarity: 'common', description: 'Ready for parent-teacher night.' },
  { id: 'neck-bowtie', name: 'Bow Tie', category: 'neckwear', price: 45, rarity: 'common', description: 'Smart enough for a Friday checkpoint.' },
  { id: 'neck-flowers', name: 'Flower Collar', category: 'neckwear', price: 55, rarity: 'uncommon', description: 'A ring of little blossoms.' },
  { id: 'neck-scarf', name: 'Teal Scarf', category: 'neckwear', price: 60, rarity: 'uncommon', description: 'A warm scarf in lab teal.' },
  { id: 'neck-stripes', name: 'Striped Scarf', category: 'neckwear', price: 65, rarity: 'uncommon', description: 'Red and white stripes.' },
  { id: 'neck-medal', name: 'Star Medal', category: 'neckwear', price: 70, rarity: 'uncommon', description: 'A blue-ribbon medal with a gold star.' },
  { id: 'neck-lei', name: 'Flower Lei', category: 'neckwear', price: 110, rarity: 'rare', description: 'A bright, tropical garland.' },
  { id: 'neck-cape', name: 'Hero Cape', category: 'neckwear', price: 125, rarity: 'rare', description: 'A red cape with a gold clasp.' },
  { id: 'neck-pearls', name: 'Pearl Necklace', category: 'neckwear', price: 135, rarity: 'rare', description: 'A string of shining pearls.' },
  { id: 'neck-gold', name: 'Gold Chain', category: 'neckwear', price: 260, rarity: 'epic', description: 'A chunky gold chain with a medallion.' },
  { id: 'neck-gem', name: 'Amethyst Pendant', category: 'neckwear', price: 290, rarity: 'epic', description: 'A deep purple gem on a silver chain.' },
  { id: 'neck-stars', name: 'Stardust Collar', category: 'neckwear', price: 750, rarity: 'legendary', description: 'A glowing collar of twinkling golden stars.' },

  // Eyewear
  { id: 'eye-patch', name: 'Eye Patch', category: 'eyewear', price: 30, rarity: 'common', description: 'Arr, a mathematical pirate.' },
  { id: 'eye-heart', name: 'Heart Glasses', category: 'eyewear', price: 35, rarity: 'common', description: 'Love at first graph.' },
  { id: 'eye-square', name: 'Square Frames', category: 'eyewear', price: 40, rarity: 'common', description: 'Sharp, geometric frames.' },
  { id: 'eye-sport', name: 'Sports Visor', category: 'eyewear', price: 45, rarity: 'common', description: 'Wraparound and ready to run.' },
  { id: 'eye-glasses', name: 'Round Glasses', category: 'eyewear', price: 55, rarity: 'common', description: 'Precise and observant.' },
  { id: 'eye-monocle', name: 'Monocle', category: 'eyewear', price: 65, rarity: 'uncommon', description: 'Distinguished, with a gold chain.' },
  { id: 'eye-aviator', name: 'Aviators', category: 'eyewear', price: 70, rarity: 'uncommon', description: 'Gold-framed pilot glasses.' },
  { id: 'eye-3d', name: '3D Glasses', category: 'eyewear', price: 75, rarity: 'uncommon', description: 'Red on one side, cyan on the other.' },
  { id: 'eye-goggles', name: 'Lab Goggles', category: 'eyewear', price: 80, rarity: 'uncommon', description: 'Safety first in Vector Lab.' },
  { id: 'eye-shades', name: 'Sunny Shades', category: 'eyewear', price: 110, rarity: 'rare', description: 'Too bright a future to read the axis labels.' },
  { id: 'eye-neon', name: 'Neon Frames', category: 'eyewear', price: 125, rarity: 'rare', description: 'Glowing cyan and pink outlines.' },
  { id: 'eye-steampunk', name: 'Steampunk Specs', category: 'eyewear', price: 140, rarity: 'rare', description: 'Brass rims with tiny gears.' },
  { id: 'eye-visor', name: 'Hologram Visor', category: 'eyewear', price: 270, rarity: 'epic', description: 'A sleek blue visor.' },
  { id: 'eye-gold', name: 'Diamond Specs', category: 'eyewear', price: 290, rarity: 'epic', description: 'Gold frames set with diamonds.' },
  { id: 'eye-galaxy', name: 'Galaxy Lenses', category: 'eyewear', price: 780, rarity: 'legendary', description: 'Swirling cosmic lenses with twinkling stars.' },

  // Backgrounds
  { id: 'bg-grid', name: 'Graph Paper', category: 'background', price: 20, rarity: 'common', description: 'Classic coordinate grid.' },
  { id: 'bg-sky', name: 'Blue Sky', category: 'background', price: 25, rarity: 'common', description: 'A bright day with soft clouds.' },
  { id: 'bg-mint', name: 'Mint Hills', category: 'background', price: 25, rarity: 'common', description: 'Fresh and calm.' },
  { id: 'bg-sand', name: 'Sandy Dunes', category: 'background', price: 30, rarity: 'common', description: 'Warm sand under a low sun.' },
  { id: 'bg-dots', name: 'Plotted Points', category: 'background', price: 35, rarity: 'common', description: 'A grid of plotted dots.' },
  { id: 'bg-blueprint', name: 'Blueprint', category: 'background', price: 65, rarity: 'uncommon', description: 'White lines on engineer blue.' },
  { id: 'bg-forest', name: 'Green Forest', category: 'background', price: 70, rarity: 'uncommon', description: 'Rolling hills and pine trees.' },
  { id: 'bg-sunset', name: 'Sunset Quadrants', category: 'background', price: 75, rarity: 'uncommon', description: 'Four quadrants, four colours.' },
  { id: 'bg-ocean', name: 'Ocean Waves', category: 'background', price: 80, rarity: 'uncommon', description: 'Two layers of rolling waves.' },
  { id: 'bg-night', name: 'Midnight Lab', category: 'background', price: 130, rarity: 'rare', description: 'A deep navy lab with glowing gridlines.' },
  { id: 'bg-aurora', name: 'Aurora', category: 'background', price: 140, rarity: 'rare', description: 'Green and violet light across the night.' },
  { id: 'bg-city', name: 'City Lights', category: 'background', price: 150, rarity: 'rare', description: 'A skyline with lit windows.' },
  { id: 'bg-volcano', name: 'Volcano', category: 'background', price: 300, rarity: 'epic', description: 'Glowing lava under a dark peak.' },
  { id: 'bg-space', name: 'Deep Space', category: 'background', price: 310, rarity: 'epic', description: 'Stars and a ringed planet.' },
  { id: 'bg-cosmos', name: 'Living Cosmos', category: 'background', price: 900, rarity: 'legendary', description: 'Slowly turning rings and twinkling stars.' },

  // Characters
  { id: 'char-axis', name: 'Axis (Axel)', category: 'character', price: 150, rarity: 'rare', description: 'Unlocks Axel, the organised coordinates expert.', character: 'axis' },
  { id: 'char-slope', name: 'Slope (Slobber)', category: 'character', price: 150, rarity: 'rare', description: 'Unlocks Slobber, the relaxed gradient expert.', character: 'slope' },
  { id: 'char-vertex', name: 'Vertex (Tex)', category: 'character', price: 200, rarity: 'epic', description: 'Unlocks Tex, who knows every turning point.', character: 'vertex' },
  { id: 'char-curve', name: 'Curve (Kirby)', category: 'character', price: 200, rarity: 'epic', description: 'Unlocks Kirby, the inventive curve thinker.', character: 'curve' },
]

export const itemById = (id: string) => SHOP_ITEMS.find((i) => i.id === id)

/** Items that were removed from the shop, with the price paid, so saved purchases can be refunded. */
export const REMOVED_ITEM_PRICES: Record<string, number> = { 'col-chocolate': 90, 'col-black': 90 }
