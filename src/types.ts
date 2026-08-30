export interface CalcInput {
  id: string
  label: string
  unit: string
  defaultValue: number
  step?: number
}

export interface Calculator {
  id: string
  title: string
  description: string
  formula: string
  inputs: CalcInput[]
  compute: (values: Record<string, number>) => Record<string, { label: string; value: number; unit: string }>
}

export interface ConceptRow {
  term: string
  description: string
}

export interface MethodStep {
  title: string
  body: string
  tips?: string[]
  caution?: string
}

export interface MethodSection {
  heading: string
  intro?: string
  steps: MethodStep[]
  notes?: string[]
}

export interface AdvancedArticle {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Unit {
  id: number
  slug: string
  title: string
  englishTitle: string
  week?: number
  summary: string
  heroImage: string
  concepts: ConceptRow[]
  formulas: string[]
  method: string[]
  materials: string[]
  safety?: string[]
  quizChecks: string[]
  references: { label: string; url?: string }[]
  advanced: string[]
  images: string[]
  calculators: Calculator[]
}
