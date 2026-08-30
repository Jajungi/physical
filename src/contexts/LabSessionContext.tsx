import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface CalcPrefill {
  calculatorId: string
  values: Record<string, number>
}

interface LabSessionContextValue {
  unitId: number | null
  setUnitId: (id: number) => void
  prefill: CalcPrefill | null
  sendToCalculator: (prefill: CalcPrefill) => void
  consumePrefill: (calculatorId: string) => Record<string, number> | null
  clearPrefill: () => void
}

const LabSessionContext = createContext<LabSessionContextValue | null>(null)

export function LabSessionProvider({ children }: { children: ReactNode }) {
  const [unitId, setUnitId] = useState<number | null>(null)
  const [prefill, setPrefill] = useState<CalcPrefill | null>(null)

  const sendToCalculator = useCallback((next: CalcPrefill) => {
    setPrefill(next)
    requestAnimationFrame(() => {
      const el = document.getElementById('calculators')
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 152
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  }, [])

  const consumePrefill = useCallback(
    (calculatorId: string) => {
      if (!prefill || prefill.calculatorId !== calculatorId) return null
      const values = prefill.values
      setPrefill(null)
      return values
    },
    [prefill],
  )

  const clearPrefill = useCallback(() => setPrefill(null), [])

  const value = useMemo(
    () => ({ unitId, setUnitId, prefill, sendToCalculator, consumePrefill, clearPrefill }),
    [unitId, prefill, sendToCalculator, consumePrefill, clearPrefill],
  )

  return <LabSessionContext.Provider value={value}>{children}</LabSessionContext.Provider>
}

export function useLabSession() {
  const ctx = useContext(LabSessionContext)
  if (!ctx) throw new Error('useLabSession must be used within LabSessionProvider')
  return ctx
}
