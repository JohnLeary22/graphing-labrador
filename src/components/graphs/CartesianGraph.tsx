import { useMemo, useRef, useState } from 'react'
import { Grid3x3, Minus, Plus, RotateCcw, Eye } from 'lucide-react'
import type { Point } from '@/types'
import { clamp, formatGradient, formatNumber, gradient, lineEndpoints, snap, ticks, toMath, toPixel, zoomBounds } from '@/lib/math/graph'
import type { Bounds, Viewport } from '@/lib/math/graph'
import { gradientTex } from '@/lib/math/tex'
import { Tex } from '@/components/ui/MathText'

export interface GraphPoint {
  id: string
  label: string
  x: number
  y: number
  draggable?: boolean
  /** Show only the label, not the coordinates (used for read-the-coordinates questions). */
  hideCoords?: boolean
}

interface Props {
  bounds: Bounds
  xStep: number
  yStep: number
  xLabel?: string
  yLabel?: string
  title?: string
  points: GraphPoint[]
  line?: { from: string; to: string }
  showTriangle?: boolean
  onPointChange?: (id: string, p: Point) => void
  onReset?: () => void
  /** When set, clicking the graph calls onPlot with the nearest grid point. */
  onPlot?: (p: Point) => void
  plotted?: Point | null
  showGradient?: boolean
}

const W = 560
const H = 420
const PAD = 40

export function CartesianGraph({
  bounds, xStep, yStep, xLabel = 'x', yLabel = 'y', title, points, line, showTriangle, onPointChange, onReset, onPlot, plotted, showGradient = true,
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [grid, setGrid] = useState(true)
  const [coords, setCoords] = useState(true)
  const [dragId, setDragId] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const view = useMemo(() => zoomBounds(bounds, zoom), [bounds, zoom])
  const vp: Viewport = { ...view, width: W, height: H, padding: PAD }
  const px = (p: Point) => toPixel(vp, p)

  const xTicks = ticks(view.xMin, view.xMax, xStep)
  const yTicks = ticks(view.yMin, view.yMax, yStep)
  const xEvery = Math.max(1, Math.ceil(xTicks.length / 14))
  const yEvery = Math.max(1, Math.ceil(yTicks.length / 10))
  const axisX = view.xMin <= 0 && view.xMax >= 0 ? 0 : view.xMin
  const axisY = view.yMin <= 0 && view.yMax >= 0 ? 0 : view.yMin
  const origin = px({ x: axisX, y: axisY })

  const byId = (id: string) => points.find((p) => p.id === id)
  const a = line ? byId(line.from) : undefined
  const b = line ? byId(line.to) : undefined
  const grad = a && b ? gradient(a, b) : null
  const ends = a && b ? lineEndpoints(a, b, view) : null
  const gt = a && b && grad?.kind === 'defined' ? gradientTex(a, b) : null

  function pointerToMath(e: React.PointerEvent): Point {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    const m = toMath(vp, { x, y })
    return { x: clamp(snap(m.x, xStep), view.xMin, view.xMax), y: clamp(snap(m.y, yStep), view.yMin, view.yMax) }
  }

  function onMove(e: React.PointerEvent) {
    if (dragId && onPointChange) onPointChange(dragId, pointerToMath(e))
  }

  function onKey(e: React.KeyboardEvent, p: GraphPoint) {
    if (!p.draggable || !onPointChange) return
    const d: Record<string, [number, number]> = { ArrowRight: [xStep, 0], ArrowLeft: [-xStep, 0], ArrowUp: [0, yStep], ArrowDown: [0, -yStep] }
    const delta = d[e.key]
    if (!delta) return
    e.preventDefault()
    onPointChange(p.id, {
      x: clamp(snap(p.x + delta[0], xStep), view.xMin, view.xMax),
      y: clamp(snap(p.y + delta[1], yStep), view.yMin, view.yMax),
    })
  }

  const description =
    `${title ?? 'Graph'}. x-axis ${xLabel} from ${formatNumber(view.xMin)} to ${formatNumber(view.xMax)}, y-axis ${yLabel} from ${formatNumber(view.yMin)} to ${formatNumber(view.yMax)}. ` +
    (points.length ? `Points: ${points.map((p) => (p.hideCoords ? `${p.label} (coordinates hidden for this question)` : `${p.label} (${formatNumber(p.x)}, ${formatNumber(p.y)})`)).join('; ')}. ` : '') +
    (grad ? `Gradient of the line is ${formatGradient(grad)}.` : '')

  return (
    <figure className="card overflow-hidden">
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-line px-3 py-2 text-sm">
        <span className="font-semibold">{title ?? 'Graph'}</span>
        <span className="ml-auto flex gap-1">
          <button className="btn !px-2 !py-1" aria-label="Zoom in" onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}><Plus size={16} /></button>
          <button className="btn !px-2 !py-1" aria-label="Zoom out" onClick={() => setZoom((z) => Math.min(2.5, z * 1.25))}><Minus size={16} /></button>
          <button className="btn !px-2 !py-1" aria-pressed={grid} aria-label="Toggle grid" onClick={() => setGrid((v) => !v)}><Grid3x3 size={16} /></button>
          <button className="btn !px-2 !py-1" aria-pressed={coords} aria-label="Toggle coordinate labels" onClick={() => setCoords((v) => !v)}><Eye size={16} /></button>
          <button className="btn !px-2 !py-1" aria-label="Reset graph" onClick={() => { setZoom(1); onReset?.() }}><RotateCcw size={16} /></button>
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-none select-none"
        style={{ background: 'var(--graph-bg)', cursor: onPlot ? 'crosshair' : undefined }}
        role="group"
        aria-label={description}
        onPointerMove={onMove}
        onPointerUp={() => setDragId(null)}
        onPointerLeave={() => setDragId(null)}
        onClick={(e) => {
          if (!onPlot || dragId) return
          onPlot(pointerToMath(e as unknown as React.PointerEvent))
        }}
      >
        {grid && (
          <g stroke="var(--grid)" strokeWidth="1">
            {xTicks.map((t) => <line key={`gx${t}`} x1={px({ x: t, y: view.yMin }).x} x2={px({ x: t, y: view.yMax }).x} y1={px({ x: t, y: view.yMin }).y} y2={px({ x: t, y: view.yMax }).y} />)}
            {yTicks.map((t) => <line key={`gy${t}`} x1={px({ x: view.xMin, y: t }).x} x2={px({ x: view.xMax, y: t }).x} y1={px({ x: view.xMin, y: t }).y} y2={px({ x: view.xMax, y: t }).y} />)}
          </g>
        )}
        {/* axes */}
        <g stroke="var(--ink)" strokeWidth="2">
          <line x1={px({ x: view.xMin, y: axisY }).x} x2={px({ x: view.xMax, y: axisY }).x} y1={origin.y} y2={origin.y} />
          <line x1={origin.x} x2={origin.x} y1={px({ x: axisX, y: view.yMin }).y} y2={px({ x: axisX, y: view.yMax }).y} />
        </g>
        <g fill="var(--ink-soft)" fontSize="12">
          {xTicks.map((t, i) => (t !== 0 || axisY !== 0) && i % xEvery === 0 && <text key={`tx${t}`} x={px({ x: t, y: axisY }).x} y={origin.y + 16} textAnchor="middle">{formatNumber(t)}</text>)}
          {yTicks.map((t, i) => (t !== 0 || axisX !== 0) && i % yEvery === 0 && <text key={`ty${t}`} x={origin.x - 8} y={px({ x: axisX, y: t }).y + 4} textAnchor="end">{formatNumber(t)}</text>)}
          {axisX === 0 && axisY === 0 && <text x={origin.x - 8} y={origin.y + 16} textAnchor="end">0</text>}
          <text x={W - PAD + 4} y={origin.y - 8} textAnchor="end" fontWeight="700" fill="var(--ink)">{xLabel}</text>
          <text x={origin.x + 8} y={PAD - 14} fontWeight="700" fill="var(--ink)">{yLabel}</text>
        </g>
        {/* line */}
        {ends && <line x1={px(ends[0]).x} y1={px(ends[0]).y} x2={px(ends[1]).x} y2={px(ends[1]).y} stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />}
        {/* rise / run triangle */}
        {showTriangle && a && b && grad && (
          <g fontSize="13" fontWeight="700">
            <line x1={px(a).x} y1={px(a).y} x2={px({ x: b.x, y: a.y }).x} y2={px({ x: b.x, y: a.y }).y} stroke="var(--brand)" strokeWidth="2.5" strokeDasharray="6 4" />
            <line x1={px({ x: b.x, y: a.y }).x} y1={px({ x: b.x, y: a.y }).y} x2={px(b).x} y2={px(b).y} stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="6 4" />
            <text x={(px(a).x + px({ x: b.x, y: a.y }).x) / 2} y={px(a).y + (b.y >= a.y ? 18 : -8)} textAnchor="middle" fill="var(--brand)">run = {formatNumber(b.x - a.x)}</text>
            <text x={px({ x: b.x, y: a.y }).x + 8} y={(px({ x: b.x, y: a.y }).y + px(b).y) / 2} fill="var(--accent)">rise = {formatNumber(b.y - a.y)}</text>
          </g>
        )}
        {plotted && <circle cx={px(plotted).x} cy={px(plotted).y} r="8" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" />}
        {/* points */}
        {points.map((p) => {
          const c = px(p)
          return (
            <g
              key={p.id}
              tabIndex={p.draggable ? 0 : undefined}
              role={p.draggable ? 'slider' : undefined}
              aria-label={p.draggable ? `Point ${p.label} at (${formatNumber(p.x)}, ${formatNumber(p.y)}). Use arrow keys to move.` : undefined}
              aria-valuetext={p.draggable ? `(${formatNumber(p.x)}, ${formatNumber(p.y)})` : undefined}
              onKeyDown={(e) => onKey(e, p)}
              onPointerDown={(e) => { if (p.draggable) { e.preventDefault(); svgRef.current?.setPointerCapture(e.pointerId); setDragId(p.id) } }}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.id)}
              onBlur={() => setHover(null)}
              style={{ cursor: p.draggable ? 'grab' : 'default', outline: 'none' }}
            >
              {p.draggable && <circle cx={c.x} cy={c.y} r="18" fill="var(--accent)" opacity="0.18" />}
              <circle cx={c.x} cy={c.y} r="7.5" fill={p.draggable ? 'var(--accent)' : 'var(--brand)'} stroke="var(--ink)" strokeWidth="2" />
              {(coords || hover === p.id) && (
                <text x={c.x + 11} y={c.y - 10} fontSize="13" fontWeight="700" fill="var(--ink)">{p.hideCoords ? p.label : `${p.label}(${formatNumber(p.x)}, ${formatNumber(p.y)})`}</text>
              )}
              <title>{p.hideCoords ? p.label : `${p.label} (${formatNumber(p.x)}, ${formatNumber(p.y)})`}</title>
            </g>
          )
        })}
      </svg>
      {showGradient && a && b && grad && (
        <div className="border-t border-line px-3 py-2 text-sm" aria-live="polite">
          {gt ? (
            <Tex tex={gt.tex} alt={gt.alt} display />
          ) : (
            <p>The run is 0, so this is a vertical line and its gradient is <strong>undefined</strong>.</p>
          )}
        </div>
      )}
      <details className="border-t border-line px-3 py-2 text-sm">
        <summary className="cursor-pointer font-semibold">Text and table alternative</summary>
        <p className="mt-2 text-soft">{description}</p>
        {points.length > 0 && (
          <table className="mt-2 w-full text-left">
            <caption className="sr-only">Points on the graph</caption>
            <thead><tr><th scope="col">Point</th><th scope="col">x</th><th scope="col">y</th></tr></thead>
            <tbody>{points.map((p) => <tr key={p.id}><th scope="row">{p.label}</th><td>{p.hideCoords ? '?' : formatNumber(p.x)}</td><td>{p.hideCoords ? '?' : formatNumber(p.y)}</td></tr>)}</tbody>
          </table>
        )}
      </details>
    </figure>
  )
}
