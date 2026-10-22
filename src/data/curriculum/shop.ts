import type { ShopItem } from '@/types'

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'neck-bandana', name: 'Grid Bandana', category: 'neckwear', price: 25, rarity: 'common', description: 'A bandana printed with a tiny coordinate grid.' },
  { id: 'neck-bowtie', name: 'Bow Tie', category: 'neckwear', price: 45, rarity: 'common', description: 'Smart enough for a Friday checkpoint.' },
  { id: 'neck-scarf', name: 'Teal Scarf', category: 'neckwear', price: 60, rarity: 'uncommon', description: 'A warm scarf in lab teal.' },
  { id: 'hat-beanie', name: 'Navy Beanie', category: 'hat', price: 40, rarity: 'common', description: 'A cosy knit beanie.' },
  { id: 'hat-cap', name: 'Lab Cap', category: 'hat', price: 70, rarity: 'uncommon', description: 'A baseball cap with an amber brim.' },
  { id: 'hat-headphones', name: 'Study Headphones', category: 'hat', price: 120, rarity: 'rare', description: 'For focused independent practice.' },
  { id: 'hat-crown', name: 'Gradient Crown', category: 'hat', price: 300, rarity: 'epic', description: 'Awarded to people who really like steep lines.' },
  { id: 'eye-glasses', name: 'Round Glasses', category: 'eyewear', price: 55, rarity: 'common', description: 'Precise and observant.' },
  { id: 'eye-shades', name: 'Sunny Shades', category: 'eyewear', price: 110, rarity: 'rare', description: 'Too bright a future to read the axis labels.' },
  { id: 'col-chocolate', name: 'Chocolate Coat', category: 'colour', price: 90, rarity: 'uncommon', description: 'A rich chocolate Labrador colouring.' },
  { id: 'col-black', name: 'Black Coat', category: 'colour', price: 90, rarity: 'uncommon', description: 'A glossy black Labrador colouring.' },
  { id: 'bg-grid', name: 'Graph Paper', category: 'background', price: 20, rarity: 'common', description: 'Classic coordinate grid.' },
  { id: 'bg-sunset', name: 'Sunset Quadrants', category: 'background', price: 75, rarity: 'uncommon', description: 'Four quadrants, four colours.' },
  { id: 'bg-night', name: 'Midnight Lab', category: 'background', price: 130, rarity: 'rare', description: 'A deep navy lab with glowing gridlines.' },
  { id: 'char-axis', name: 'Axis (Axel)', category: 'character', price: 150, rarity: 'rare', description: 'Unlocks Axel, the organised coordinates expert.', character: 'axis' },
  { id: 'char-slope', name: 'Slope (Slobber)', category: 'character', price: 150, rarity: 'rare', description: 'Unlocks Slobber, the relaxed gradient expert.', character: 'slope' },
  { id: 'char-vertex', name: 'Vertex (Tex)', category: 'character', price: 200, rarity: 'epic', description: 'Unlocks Tex, who knows every turning point.', character: 'vertex' },
  { id: 'char-curve', name: 'Curve (Kirby)', category: 'character', price: 200, rarity: 'epic', description: 'Unlocks Kirby, the inventive curve thinker.', character: 'curve' },
]

export const itemById = (id: string) => SHOP_ITEMS.find((i) => i.id === id)
