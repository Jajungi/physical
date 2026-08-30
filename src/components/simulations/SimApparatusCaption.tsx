import type { ReactNode } from 'react'

/** 실험 장치 구조 설명 — 캔버스 아래 HTML (선명한 텍스트) */
export function SimApparatusCaption({
  structure,
  children,
}: {
  structure: string
  children?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
      <p>
        <strong className="text-slate-800">구조:</strong> {structure}
      </p>
      {children && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-700">
          {children}
        </div>
      )}
    </div>
  )
}
