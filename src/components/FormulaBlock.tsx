import { Component, type ReactNode } from 'react'
import { BlockMath } from 'react-katex'
import { PlainFormula } from './PlainFormula'

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
      } else if (input[i] === '[') {
        let depth = 1
        const start = i + 1
        i++
        while (i < input.length && depth > 0) {
          if (input[i] === '[') depth++
          else if (input[i] === ']') depth--
          i++
        }
        result += `\\sqrt{${convertSqrt(input.slice(start, i - 1))}}`
      } else {
        let j = i
        while (j < input.length && /[\dA-Za-z_\\{}.]/.test(input[j])) j++
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
    .replace(/Δ([A-Za-z])/g, '\\Delta $1')
    .replace(/Δ/g, '\\Delta ')
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
    .replace(/θp/g, '\\theta_p')
    .replace(/θ([0-9₂])/g, '\\theta_$1')
    .replace(/θ/g, '\\theta')
    .replace(/φ/g, '\\phi')
    .replace(/μ0/g, '\\mu_0')
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
    .replace(/\bcos\b/g, '\\cos')
    .replace(/\bsin\b/g, '\\sin')
    .replace(/\btan\b/g, '\\tan')
    .replace(/2\\pi f/g, '2\\pi f')
  s = s.replace(/\\mu_0n/g, '\\mu_0 n')
  return s.trim()
}

/** Split Korean annotations out of formula strings before KaTeX rendering. */
export function parseFormula(raw: string): { latex: string; note?: string; plainOnly?: boolean } {
  let text = raw.trim()
  let note: string | undefined

  // Too much Korean / prose → plain text only
  const koreanCount = (text.match(/[\uAC00-\uD7A3]/g) || []).length
  if (koreanCount >= 6 || /따라|때|만드는|합|검증|이론/.test(text)) {
    return { latex: '', note: text, plainOnly: true }
  }

  const trailingNote = text.match(/^(.+?)\s+\(([^)]*[\uAC00-\uD7A3⟂][^)]*)\)\s*$/)
  if (trailingNote) {
    text = trailingNote[1].trim()
    note = trailingNote[2]
  }

  const prefixLabel = text.match(/^([\uAC00-\uD7A3][^:]{0,24}):\s*(.+)$/)
  if (prefixLabel) {
    note = note ? `${prefixLabel[1]} · ${note}` : prefixLabel[1]
    text = prefixLabel[2].trim()
  }

  if (/^[\uAC00-\uD7A3\s，。·→⟂≈%]+$/.test(text)) {
    return { latex: '', note: text + (note ? ` (${note})` : ''), plainOnly: true }
  }

  const latex = unicodeMathToLatex(text)
  return { latex, note }
}

class KatexErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

export function FormulaBlock({ formula }: { formula: string }) {
  const { latex, note, plainOnly } = parseFormula(formula)
  const fallback = <PlainFormula text={formula} />

  if (plainOnly || !latex) {
    return note ? <PlainFormula text={note} /> : fallback
  }

  return (
    <KatexErrorBoundary fallback={fallback}>
      <div>
        <div className="overflow-x-auto">
          <BlockMath math={latex} />
        </div>
        {note && <p className="mt-2 text-sm text-[var(--color-muted)]">{note}</p>}
      </div>
    </KatexErrorBoundary>
  )
}
