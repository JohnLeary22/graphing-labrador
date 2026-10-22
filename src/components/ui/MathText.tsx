import katex from 'katex'
import 'katex/dist/katex.min.css'
import { speak } from '@/lib/math/tex'

/** TeX is authored in the data files (never typed by students); only \htmlClass is trusted. */
const OPTIONS = { throwOnError: false, output: 'html' as const, strict: 'ignore' as const, trust: (c: { command: string }) => c.command === '\\htmlClass' }

export function Tex({ tex, display = false, alt }: { tex: string; display?: boolean; alt?: string }) {
  const html = katex.renderToString(tex, { ...OPTIONS, displayMode: display })
  return (
    <span role="math" aria-label={alt ?? speak(tex)} className={display ? 'block my-2 overflow-x-auto' : undefined}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  )
}

/** Renders text where $...$ is inline maths and $$...$$ is display maths. */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$$') ? <Tex key={i} tex={p.slice(2, -2)} display /> : p.startsWith('$') ? <Tex key={i} tex={p.slice(1, -1)} /> : <span key={i}>{p}</span>,
      )}
    </>
  )
}
