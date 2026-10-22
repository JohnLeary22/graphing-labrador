// Converts the Markdown report to a print-ready HTML file using only Node. Run: node docs/build-report.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const md = readFileSync(join(dir, 'GRAPHING_LABRADOR_FULL_REPORT.md'), 'utf8').split('\n')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/ /g, '-')

function inline(s) {
  const codes = []
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(`<code>${esc(c)}</code>`) - 1}\u0000`)
  s = esc(s)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)])
}

const out = []
let i = 0
while (i < md.length) {
  const line = md[i]
  if (line.startsWith('```')) {
    const buf = []
    i++
    while (i < md.length && !md[i].startsWith('```')) buf.push(md[i++])
    i++
    out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`)
    continue
  }
  const h = line.match(/^(#{1,4}) (.*)$/)
  if (h) {
    const n = h[1].length
    out.push(`<h${n} id="${slug(h[2])}">${inline(h[2])}</h${n}>`)
    i++
    continue
  }
  if (line.startsWith('|')) {
    const rows = []
    while (i < md.length && md[i].startsWith('|')) rows.push(md[i++])
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
    const head = cells(rows[0])
    const body = rows.slice(2).map(cells)
    out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`)
    continue
  }
  if (line.startsWith('>')) {
    const buf = []
    while (i < md.length && md[i].startsWith('>')) buf.push(md[i++].replace(/^>\s?/, ''))
    const paras = buf.join('\n').split(/\n\n/).map((p) => `<p>${p.split('\n').map(inline).join('<br>')}</p>`)
    out.push(`<blockquote>${paras.join('')}</blockquote>`)
    continue
  }
  if (/^(- |\d+\. )/.test(line)) {
    const ordered = /^\d+\. /.test(line)
    const items = []
    while (i < md.length && /^(- |\d+\. |   )/.test(md[i])) {
      if (/^(- |\d+\. )/.test(md[i])) items.push(md[i].replace(/^(- |\d+\. )/, ''))
      else items[items.length - 1] += '\n' + md[i].trim()
      i++
    }
    const tag = ordered ? 'ol' : 'ul'
    out.push(`<${tag}>${items.map((t) => `<li>${t.split('\n').map(inline).join('<br>')}</li>`).join('')}</${tag}>`)
    continue
  }
  if (line.trim() === '') {
    i++
    continue
  }
  const buf = []
  while (i < md.length && md[i].trim() !== '' && !/^(#|\||>|```|- |\d+\. )/.test(md[i])) buf.push(md[i++])
  out.push(`<p>${buf.map(inline).join('<br>')}</p>`)
}

const css = `
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0b1b3a; line-height: 1.5; font-size: 11pt; max-width: 900px; margin: 0 auto; padding: 24px; }
h1 { font-size: 26pt; color: #0b1b3a; border-bottom: 4px solid #14b8a6; padding-bottom: 8px; }
h2 { font-size: 17pt; margin-top: 28px; color: #0b2a5a; border-bottom: 2px solid #fbbf24; padding-bottom: 4px; break-after: avoid; }
h3 { font-size: 13pt; margin-top: 20px; color: #0e7490; break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; break-inside: auto; }
th { background: #0b1b3a; color: #fff; text-align: left; }
th, td { border: 1px solid #c9d2e3; padding: 5px 8px; vertical-align: top; }
tr { break-inside: avoid; }
tbody tr:nth-child(even) { background: #f3f6fb; }
code { background: #eef2f8; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; font-family: ui-monospace, Menlo, Consolas, monospace; }
pre { background: #0b1b3a; color: #e6edf8; padding: 12px; border-radius: 6px; overflow-x: auto; break-inside: avoid; }
pre code { background: none; color: inherit; }
blockquote { border-left: 4px solid #14b8a6; background: #f1faf9; margin: 12px 0; padding: 4px 14px; break-inside: avoid; }
a { color: #0e7490; text-decoration: none; }
ul, ol { padding-left: 22px; }
@media print { body { padding: 0; max-width: none; font-size: 10pt; } a { color: inherit; } h2 { break-before: auto; } }
`

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<title>Graphing Labrador - Full Website Report</title>
<style>${css}</style>
</head>
<body>
${out.join('\n')}
</body>
</html>
`
writeFileSync(join(dir, 'GRAPHING_LABRADOR_FULL_REPORT.html'), html)
console.log('Wrote GRAPHING_LABRADOR_FULL_REPORT.html')
