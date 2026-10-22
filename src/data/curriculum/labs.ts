import type { CharacterId, LabId } from '@/types'

export interface Character {
  id: CharacterId
  name: string
  nickname: string
  lab: string
  role: string
  personality: string
  accent: string
  /** Mathematical motif drawn on the character's tag. */
  motif: 'arrow' | 'parabola' | 'axes' | 'slope' | 'wave'
}

export const CHARACTERS: Record<CharacterId, Character> = {
  vector: { id: 'vector', name: 'Vector', nickname: 'Hector', lab: 'Vector Lab', role: 'Main guide', personality: 'Confident, curious, adventurous', accent: '#2dd4bf', motif: 'arrow' },
  vertex: { id: 'vertex', name: 'Vertex', nickname: 'Tex', lab: 'Vertex Lab', role: 'Key graph features', personality: 'Clever, precise, observant', accent: '#a78bfa', motif: 'parabola' },
  axis: { id: 'axis', name: 'Axis', nickname: 'Axel', lab: 'Axis Lab', role: 'Coordinates and plotting', personality: 'Organised, energetic, reliable', accent: '#60a5fa', motif: 'axes' },
  slope: { id: 'slope', name: 'Slope', nickname: 'Slobber', lab: 'Slope Lab', role: 'Gradient and rates', personality: 'Relaxed, playful, a little chaotic', accent: '#fbbf24', motif: 'slope' },
  curve: { id: 'curve', name: 'Curve', nickname: 'Kirby', lab: 'Curve Lab', role: 'Non-linear relationships', personality: 'Imaginative, unconventional, inventive', accent: '#f472b6', motif: 'wave' },
}

export interface Lab {
  id: LabId
  name: string
  character: CharacterId
  topic: string
  description: string
  sequence: number
  lessons: { id: string; title: string; playable: boolean }[]
  /** Position on the Vector Lab map as percentages. */
  map: { x: number; y: number }
}

export const LABS: Lab[] = [
  { id: 'axis', name: 'Axis Lab', character: 'axis', topic: 'The Cartesian plane', description: 'Plot points, read coordinates and spot mislabelled axes.', sequence: 1, lessons: [{ id: 'cartesian-plane', title: 'Plotting on the Cartesian plane', playable: false }], map: { x: 16, y: 62 } },
  { id: 'slope', name: 'Slope Lab', character: 'slope', topic: 'Gradient and linear relationships', description: 'Rise over run, rates of change and what a gradient means.', sequence: 2, lessons: [{ id: 'gradient', title: 'Understanding Gradient', playable: true }], map: { x: 38, y: 30 } },
  { id: 'vertex', name: 'Vertex Lab', character: 'vertex', topic: 'Important graph features', description: 'Intercepts, turning points and maximum and minimum values.', sequence: 3, lessons: [{ id: 'graph-features', title: 'Intercepts and turning points', playable: false }], map: { x: 62, y: 66 } },
  { id: 'curve', name: 'Curve Lab', character: 'curve', topic: 'Non-linear relationships', description: 'Tell linear from non-linear and read changing rates.', sequence: 4, lessons: [{ id: 'nonlinear', title: 'Reading curved graphs', playable: false }], map: { x: 84, y: 34 } },
  { id: 'vector', name: 'Vector Lab', character: 'vector', topic: 'Applying graphing to problems', description: 'Taxi fares, phone plans and misleading graphs.', sequence: 5, lessons: [{ id: 'applications', title: 'Graphing in the real world', playable: false }], map: { x: 50, y: 50 } },
]

export const labById = (id: string) => LABS.find((l) => l.id === id)
