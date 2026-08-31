import type { ReactNode } from 'react'
import { GuidedSteps, type GuidedStep } from './GuidedSteps'

interface SimWorkbenchProps {
  figureRef?: string
  bench: ReactNode
  /** 실험 중 바꾸며 값을 찾는 조작 — 벤치 바로 아래 */
  liveControls?: ReactNode
  /** 미리 정하는 설정(모드·부품 선택 등) — 하단 패널 */
  setupControls?: ReactNode
  /** @deprecated liveControls + setupControls 사용 권장 */
  controls?: ReactNode
  instruments?: ReactNode
  dataSheet?: ReactNode
  steps?: GuidedStep[]
  currentStep?: number
  onStepChange?: (step: number) => void
}

function LivePanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]/50 p-3 sm:p-4">
      <p className="mb-2.5 text-[10px] font-semibold tracking-wide text-[var(--color-accent)] uppercase">
        실험 조작
      </p>
      {children}
    </div>
  )
}

function SetupPanel({ children }: { children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-[var(--color-border)] bg-white open:pb-3" open>
      <summary className="cursor-pointer list-none px-3 py-3 text-[10px] font-semibold tracking-wide text-[var(--color-muted)] uppercase select-none marker:content-none sm:px-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between">
          실험 설정
          <span className="text-[9px] font-normal normal-case text-slate-400 group-open:hidden">펼치기</span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-[var(--color-border)]/60 px-3 pt-3 sm:px-4">{children}</div>
    </details>
  )
}

export function SimWorkbench({
  figureRef,
  bench,
  liveControls,
  setupControls,
  controls,
  instruments,
  dataSheet,
  steps,
  currentStep = 0,
  onStepChange,
}: SimWorkbenchProps) {
  const live = liveControls ?? (setupControls ? undefined : controls)
  const setup = setupControls

  return (
    <div className="flex min-w-0 flex-col gap-0">
      {figureRef && (
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            실험서 {figureRef}
          </span>
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="mb-4">
          <GuidedSteps steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="min-h-[32vh] min-w-0">{bench}</div>

        {live && <LivePanel>{live}</LivePanel>}

        {instruments && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="mb-2 text-[10px] font-medium tracking-wide text-slate-500 uppercase">측정값</p>
            {instruments}
          </div>
        )}

        {setup && <SetupPanel>{setup}</SetupPanel>}
      </div>

      {dataSheet && <div className="mt-4">{dataSheet}</div>}
    </div>
  )
}
