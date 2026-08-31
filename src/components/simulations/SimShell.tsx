import { useState, type ReactNode } from 'react'

interface SimShellProps {
  title: string
  description: string
  children: ReactNode
  hint?: string
  steps?: string[]
  currentStep?: number
}

export function SimShell({ title, description, children, hint, steps, currentStep }: SimShellProps) {
  const [stepsOpen, setStepsOpen] = useState(false)

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] to-white px-3 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-xs font-bold text-white">
            LAB
          </span>
          <div className="min-w-0">
            <h4 className="text-base font-semibold leading-snug sm:text-lg">{title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
          </div>
        </div>
      </div>

      {steps && steps.length > 0 && (
        <>
          {/* Mobile: collapsible steps */}
          <div className="border-b border-[var(--color-border)] bg-[#1e293b] lg:hidden">
            <button
              type="button"
              onClick={() => setStepsOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white"
            >
              <span className="font-medium">
                실험 절차
                {currentStep !== undefined && ` — ${currentStep + 1}/${steps.length}단계`}
              </span>
              <span className="text-slate-400">{stepsOpen ? '▲' : '▼'}</span>
            </button>
            {stepsOpen && (
              <ol className="space-y-2 border-t border-slate-700 px-4 pb-4">
                {steps.map((step, i) => (
                  <li
                    key={step}
                    className={`flex gap-2.5 text-sm leading-relaxed ${
                      currentStep === i
                        ? 'font-medium text-white'
                        : currentStep !== undefined && i < currentStep
                          ? 'text-slate-500 line-through'
                          : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        currentStep === i ? 'bg-[var(--color-accent)]' : 'bg-slate-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
            {!stepsOpen && currentStep !== undefined && (
              <p className="border-t border-slate-700 px-4 pb-3 text-xs leading-relaxed text-slate-400">
                현재: {steps[currentStep]}
              </p>
            )}
          </div>

          {/* Desktop: full step list */}
          <div className="hidden border-b border-[var(--color-border)] bg-[#1e293b] px-5 py-4 text-white lg:block">
            <p className="mb-3 text-xs font-medium tracking-widest text-slate-400 uppercase">
              실험 절차 {currentStep !== undefined ? `— ${currentStep + 1} / ${steps.length}단계` : ''}
            </p>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li
                  key={step}
                  className={`flex gap-2.5 text-sm leading-relaxed ${
                    currentStep === i
                      ? 'font-medium text-white'
                      : currentStep !== undefined && i < currentStep
                        ? 'text-slate-500 line-through'
                        : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      currentStep === i
                        ? 'bg-[var(--color-accent)]'
                        : currentStep !== undefined && i < currentStep
                          ? 'bg-slate-600'
                          : 'bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      <div className="min-w-0 bg-[#f0f4f8] p-3 sm:p-5">{children}</div>

      {hint && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 sm:px-5">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-accent)]">실험 팁</span> — {hint}
          </p>
        </div>
      )}
    </div>
  )
}

export function SimModeTabs<T extends string>({
  modes,
  value,
  onChange,
}: {
  modes: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition touch-manipulation sm:px-4 ${
            value === m.id
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 active:bg-slate-50'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export function SimSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  const display =
    typeof value === 'number' && value % 1 !== 0 ? value.toFixed(Math.max(0, -Math.floor(Math.log10(step)))) : value

  const handleNumber = (raw: string) => {
    const n = parseFloat(raw)
    if (!Number.isFinite(n)) return
    onChange(Math.max(min, Math.min(max, n)))
  }

  return (
    <label className="block rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 touch-manipulation sm:px-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="min-w-0 text-sm font-medium">{label}</span>
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleNumber(e.target.value)}
            className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-right font-mono text-base font-semibold text-[var(--color-accent)] outline-none focus:border-[var(--color-accent)] sm:w-24"
          />
          <span className="text-xs text-[var(--color-muted)]">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-3 w-full cursor-pointer accent-[var(--color-accent)]"
      />
      <div className="mt-1 flex justify-between text-[10px] text-[var(--color-muted)]">
        <span>{min}{unit}</span>
        <span className="font-mono">{display}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </label>
  )
}

export function SimReadout({
  items,
}: {
  items: { label: string; value: string; highlight?: boolean }[]
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl px-4 py-3 ${
            item.highlight
              ? 'bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)]/40'
              : 'bg-white ring-1 ring-[var(--color-border)]'
          }`}
        >
          <p className="text-xs text-[var(--color-muted)]">{item.label}</p>
          <p className="mt-0.5 break-all font-mono text-sm font-semibold sm:text-base">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function SimSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <label className="block rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm touch-manipulation">
      <span className="mb-2 block font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-base outline-none focus:border-[var(--color-accent)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function LabPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800 shadow-lg">
      <div className="border-b border-slate-600 bg-slate-900 px-3 py-2">
        <p className="text-center text-xs font-medium tracking-widest text-slate-400 uppercase">{title}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

export function DigitalDisplay({
  label,
  value,
  unit,
  size = 'md',
  description,
}: {
  label: string
  value: string
  unit: string
  size?: 'sm' | 'md' | 'lg'
  description?: string
}) {
  const textSize = size === 'lg' ? 'text-xl sm:text-2xl' : size === 'sm' ? 'text-sm' : 'text-base sm:text-lg'
  return (
    <div className="text-center">
      <p className="mb-0.5 text-[10px] font-medium tracking-wide text-slate-600">{label}</p>
      {description && <p className="mb-1 text-[9px] leading-tight text-slate-400">{description}</p>}
      <div className="rounded bg-[#0a1a0a] px-2 py-2 font-mono text-[#33ff33] shadow-inner sm:px-3">
        <span className={`${textSize} font-bold tracking-widest`}>{value}</span>
        <span className="ml-1 text-xs text-[#22aa22]">{unit}</span>
      </div>
    </div>
  )
}

export function GalvanometerGauge({
  value,
  maxValue,
  balanced,
}: {
  value: number
  maxValue: number
  balanced: boolean
}) {
  const angle = Math.max(-60, Math.min(60, (value / maxValue) * 60))
  return (
    <div className="text-center">
      <p className="mb-1 text-[10px] tracking-wider text-slate-500 uppercase">검류계 (Galvanometer)</p>
      <div className="relative mx-auto h-20 w-36 rounded-t-full bg-gradient-to-b from-slate-700 to-slate-900 shadow-inner sm:h-24 sm:w-40">
        <svg viewBox="0 0 160 96" className="h-full w-full">
          {[-60, -30, 0, 30, 60].map((a) => {
            const rad = ((a - 90) * Math.PI) / 180
            const x1 = 80 + Math.cos(rad) * 55
            const y1 = 80 + Math.sin(rad) * 55
            const x2 = 80 + Math.cos(rad) * 65
            const y2 = 80 + Math.sin(rad) * 65
            return (
              <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />
            )
          })}
          <line
            x1="80"
            y1="80"
            x2={80 + Math.cos(((angle - 90) * Math.PI) / 180) * 50}
            y2={80 + Math.sin(((angle - 90) * Math.PI) / 180) * 50}
            stroke={balanced ? '#4ade80' : '#f87171'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="80" cy="80" r="4" fill="#cbd5e1" />
        </svg>
        {balanced && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
            0 μA — 평형
          </div>
        )}
      </div>
    </div>
  )
}

export function OscilloscopeScreen({
  children,
  label,
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border-2 border-slate-600 bg-[#0a0f0a]">
      {label && (
        <div className="border-b border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-[10px] text-slate-400 sm:text-xs">
          {label}
        </div>
      )}
      <div className="relative min-w-0 [&_canvas]:block [&_canvas]:h-auto [&_canvas]:w-full [&_canvas]:max-w-full">
        {children}
      </div>
    </div>
  )
}

/** Canvas wrapper — always fits the screen width (no sideways clip/scroll). */
export function SimCanvas({
  children,
  label,
  className = '',
}: {
  children: ReactNode
  label?: string
  className?: string
}) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-xl border-2 border-slate-300 bg-white p-1.5 sm:p-3 ${className}`}>
      {label && <p className="mb-2 text-center text-xs text-slate-500">{label}</p>}
      <div className="min-w-0 w-full [&_canvas]:block [&_canvas]:h-auto [&_canvas]:w-full [&_canvas]:max-w-full">
        {children}
      </div>
    </div>
  )
}
