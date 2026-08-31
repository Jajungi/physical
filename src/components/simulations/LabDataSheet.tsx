import { useMemo } from 'react'
import { useLabSession } from '../../contexts/LabSessionContext'

export interface DataColumn {
  key: string
  label: string
  unit?: string
  decimals?: number
}

interface LabDataSheetProps {
  title?: string
  columns: DataColumn[]
  rows: Record<string, number | string>[]
  onDeleteRow?: (index: number) => void
  onClearAll?: () => void
  /** calculatorId → { inputId: columnKey } */
  calcMapping?: Record<string, Record<string, string>>
  theoryValue?: number
  theoryLabel?: string
}

function fmt(v: number | string, decimals = 3) {
  if (typeof v === 'string') return v
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) return v.toExponential(3)
  return v.toFixed(decimals)
}

export function LabDataSheet({
  title = '측정 기록표',
  columns,
  rows,
  onDeleteRow,
  onClearAll,
  calcMapping,
  theoryValue,
  theoryLabel,
}: LabDataSheetProps) {
  const { sendToCalculator } = useLabSession()

  const stats = useMemo(() => {
    const numericCols = columns.filter((c) => rows.some((r) => typeof r[c.key] === 'number'))
    const result: Record<string, { mean: number; std: number }> = {}
    for (const col of numericCols) {
      const vals = rows.map((r) => r[col.key]).filter((v): v is number => typeof v === 'number')
      if (vals.length === 0) continue
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length
      result[col.key] = { mean, std: Math.sqrt(variance) }
    }
    return result
  }, [columns, rows])

  const errorPct =
    theoryValue !== undefined && Object.keys(stats).length > 0
      ? (() => {
          const firstKey = Object.keys(stats)[0]
          const mean = stats[firstKey]?.mean
          if (!mean || theoryValue === 0) return null
          return (Math.abs(mean - theoryValue) / Math.abs(theoryValue)) * 100
        })()
      : null

  return (
    <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold">{title}</h5>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">{rows.length}개 기록</span>
          {onClearAll && rows.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded border border-red-200 px-2 py-0.5 text-[10px] text-red-500 hover:bg-red-50"
            >
              전체 삭제
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted)]">
              <th className="py-2 pr-2">#</th>
              {columns.map((c) => (
                <th key={c.key} className="py-2 pr-3 whitespace-nowrap">
                  {c.label}
                  {c.unit && <span className="ml-0.5 text-[10px]">({c.unit})</span>}
                </th>
              ))}
              {onDeleteRow && <th className="py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-6 text-center text-[var(--color-muted)]">
                  측정값을 기록하면 여기에 표시됩니다
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-2 text-[var(--color-muted)]">{i + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-2 pr-3 font-mono">
                      {fmt(row[c.key], c.decimals ?? 3)}
                    </td>
                  ))}
                  {onDeleteRow && (
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(i)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500"
                        title="이 행 삭제"
                      >
                        삭제
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
          {Object.entries(stats).map(([key, { mean, std }]) => {
            const col = columns.find((c) => c.key === key)
            return (
              <span key={key}>
                {col?.label} 평균: <strong className="font-mono text-[var(--color-ink)]">{fmt(mean)}</strong>
                {rows.length > 1 && (
                  <span className="ml-1">±{fmt(std)}</span>
                )}
              </span>
            )
          })}
          {errorPct !== null && theoryLabel && (
            <span className="text-[var(--color-accent)]">
              {theoryLabel} 대비 오차: {errorPct.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {calcMapping && rows.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(calcMapping).map(([calcId, mapping]) => (
            <button
              key={calcId}
              type="button"
              onClick={() => {
                const last = rows[rows.length - 1]
                const values: Record<string, number> = {}
                for (const [inputId, colKey] of Object.entries(mapping)) {
                  const v = last[colKey]
                  if (typeof v === 'number') values[inputId] = v
                }
                if (Object.keys(stats).length > 0) {
                  const firstKey = Object.keys(stats)[0]
                  if (stats[firstKey] && !values[Object.values(mapping)[0]]) {
                    values[Object.values(mapping)[0]] = stats[firstKey].mean
                  }
                }
                sendToCalculator({ calculatorId: calcId, values })
              }}
              className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2 text-xs font-medium text-[var(--color-accent)] touch-manipulation"
            >
              계산기에 보내기 ↓
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
