import { useEffect, useState } from 'react'
import { FormulaBlock } from './FormulaBlock'
import { useLabSession } from '../contexts/LabSessionContext'
import type { Calculator } from '../types'

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(3)
  return value.toPrecision(4)
}

interface FormulaCalculatorProps {
  calculator: Calculator
  part?: string
}

export function FormulaCalculator({ calculator, part }: FormulaCalculatorProps) {
  const { consumePrefill } = useLabSession()
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(calculator.inputs.map((input) => [input.id, input.defaultValue])),
  )
  const [prefillNotice, setPrefillNotice] = useState(false)

  useEffect(() => {
    const imported = consumePrefill(calculator.id)
    if (imported) {
      setValues((prev) => ({ ...prev, ...imported }))
      setPrefillNotice(true)
      const t = setTimeout(() => setPrefillNotice(false), 3000)
      return () => clearTimeout(t)
    }
  }, [calculator.id, consumePrefill])

  const results = calculator.compute(values)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-semibold sm:text-lg">{calculator.title}</h4>
        {part && (
          <span className="rounded-md bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {part}
          </span>
        )}
      </div>
      {prefillNotice && (
        <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
          시뮬레이션 측정값이 자동 입력되었습니다
        </p>
      )}
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{calculator.description}</p>
      <div className="mt-4 overflow-x-auto rounded-xl bg-[var(--color-accent-soft)] px-3 py-3 sm:px-4">
        <FormulaBlock formula={calculator.formula} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {calculator.inputs.map((input) => (
          <label key={input.id} className="block touch-manipulation">
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {input.label}
              {input.unit && <span className="ml-1 text-[var(--color-muted)]">({input.unit})</span>}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={input.step ?? 'any'}
              value={values[input.id]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [input.id]: parseFloat(e.target.value) || 0 }))
              }
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Object.entries(results).map(([key, result]) => (
          <div
            key={key}
            className="rounded-xl bg-[var(--color-surface)] px-4 py-3 ring-1 ring-[var(--color-border)]"
          >
            <p className="text-xs font-medium tracking-wide text-[var(--color-muted)] uppercase">
              {result.label}
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-[var(--color-accent)] sm:text-xl">
              {formatValue(result.value)}
              {result.unit && (
                <span className="ml-1.5 text-sm font-normal text-[var(--color-muted)]">{result.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
