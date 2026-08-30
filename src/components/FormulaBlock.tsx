import { BlockMath } from 'react-katex'

function convertSqrt(input: string): string {
  let result = ''
  let i = 0
  while (i < input.length) {
    if (input[i] === '√') {
      i++
      if (input[i] === '(') {
        let depth = 1
        const start = i + 1
        i++
        while (i < input.length && depth > 0) {
          if (input[i] === '(') depth++
          else if (input[i] === ')') depth--
          i++
        }
        result += `\\sqrt{${convertSqrt(input.slice(start, i - 1))}}`
      } else {
        let j = i
        while (j < input.length && /[\d.]/.test(input[j])) j++
        result += `\\sqrt{${input.slice(i, j)}}`
        i = j
      }
    } else {
      result += input[i]
      i++
    }
  }
  return result
}

function unicodeMathToLatex(text: string): string {
  let s = convertSqrt(text)
  s = s
    .replace(/χm/g, '\\chi_m')
    .replace(/χ/g, '\\chi')
    .replace(/ρ/g, '\\rho')
    .replace(/λ/g, '\\lambda')
    .replace(/Δ/g, '\\Delta')
    .replace(/\+ BM\b/g, '+ B_M')
    .replace(/\bBM\b/g, 'B_M')
    .replace(/tan⁻¹/g, '\\arctan')
    .replace(/\batan\b/g, '\\arctan')
    .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
    .replace(/([A-Za-z0-9\)\]]+)²/g, '$1^2')
    .replace(/([A-Za-z0-9\)\]]+)³/g, '$1^3')
    .replace(/\((직렬|병렬|유한|공기)\)/g, '_{\\text{$1}}')
    .replace(/×/g, '\\times')
    .replace(/·/g, ' \\cdot ')
    .replace(/−/g, '-')
    .replace(/→/g, '\\rightarrow')
    .replace(/ε/g, '\\varepsilon')
    .replace(/θ/g, '\\theta')
    .replace(/φ/g, '\\phi')
    .replace(/μ/g, '\\mu')
    .replace(/π/g, '\\pi')
    .replace(/Ω/g, '\\Omega')
    .replace(/⁻/g, '^-')
    .replace(/⁸/g, '8')
    .replace(/⁷/g, '7')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3')
    .replace(/_res/g, '_{\\mathrm{res}}')
    .replace(/_rms/g, '_{\\mathrm{rms}}')
    .replace(/_peak/g, '_{\\mathrm{peak}}')
  // μ₀n → \mu_0 n (spacing for readability)
  s = s.replace(/\\mu_0n/g, '\\mu_0 n')
  return s.trim()
}

/** Split Korean annotations out of formula strings before KaTeX rendering. */
export function parseFormula(raw: string): { latex: string; note?: string } {
  let text = raw.trim()
  let note: string | undefined

  const trailingNote = text.match(/^(.+?)\s+\(([^)]*[\uAC00-\uD7A3][^)]*)\)\s*$/)
  if (trailingNote) {
    text = trailingNote[1].trim()
    note = trailingNote[2]
  }

  const prefixLabel = text.match(/^([\uAC00-\uD7A3][^:]{0,24}):\s*(.+)$/)
  if (prefixLabel) {
    note = note ? `${prefixLabel[1]} · ${note}` : prefixLabel[1]
    text = prefixLabel[2].trim()
  }

  if (/^[\uAC00-\uD7A3\s，。·]+$/.test(text)) {
    return { latex: '', note: text + (note ? ` (${note})` : '') }
  }

  const latex = unicodeMathToLatex(text)

  return { latex, note }
}

export function FormulaBlock({ formula }: { formula: string }) {
  const { latex, note } = parseFormula(formula)

  if (!latex) {
    return <p className="text-[var(--color-muted)]">{note ?? formula}</p>
  }

  return (
    <div>
      <BlockMath math={latex} />
      {note && <p className="mt-2 text-sm text-[var(--color-muted)]">{note}</p>}
    </div>
  )
}
