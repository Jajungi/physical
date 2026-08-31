import { useState } from 'react'

export interface GuidedStep {
  id: string
  label: string
  /** Return true when this step's requirement is met */
  isComplete?: () => boolean
}

interface GuidedStepsProps {
  steps: GuidedStep[]
  currentStep: number
  onStepChange?: (step: number) => void
}

export function GuidedSteps({ steps, currentStep, onStepChange }: GuidedStepsProps) {
  const [open, setOpen] = useState(false)
  const canAdvance =
    currentStep < steps.length - 1 &&
    (steps[currentStep].isComplete ? steps[currentStep].isComplete!() : true)

  return (
    <div className="rounded-xl border border-slate-600 bg-[#1e293b] text-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-2 px-3 py-3 text-left text-sm sm:px-4 lg:pointer-events-none"
      >
        <span className="min-w-0 font-medium">
          실험 단계 {currentStep + 1}/{steps.length}
          <span className="mt-0.5 block font-normal text-slate-400 sm:mt-0 sm:ml-2 sm:inline">
            — {steps[currentStep]?.label}
          </span>
        </span>
        <span className="text-slate-400 lg:hidden">{open ? '▲' : '▼'}</span>
      </button>

      <div className={`border-t border-slate-700 px-4 pb-4 ${open ? 'block' : 'hidden lg:block'}`}>
        <ol className="mt-3 space-y-2">
          {steps.map((step, i) => {
            const done = step.isComplete?.() ?? i < currentStep
            const active = i === currentStep
            return (
              <li
                key={step.id}
                className={`flex gap-2 text-sm leading-relaxed ${
                  active ? 'font-medium text-white' : done ? 'text-slate-500 line-through' : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active ? 'bg-[var(--color-accent)]' : done ? 'bg-slate-600' : 'bg-slate-700'
                  }`}
                >
                  {done && !active ? '✓' : i + 1}
                </span>
                {step.label}
              </li>
            )
          })}
        </ol>

        {onStepChange && currentStep < steps.length - 1 && (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => onStepChange(currentStep + 1)}
            className="mt-3 w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white disabled:opacity-40 touch-manipulation"
          >
            다음 단계 →
          </button>
        )}
      </div>
    </div>
  )
}
