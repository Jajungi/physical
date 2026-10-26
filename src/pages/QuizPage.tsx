import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { quizCheatSheet, quizDeep } from '../data/quizDeep'
import { units } from '../data/units'

function chips(text: string): string[] {
  return text
    .split(/\s*·\s*/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function Chip({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'amber' | 'soft' }) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-50 text-amber-950 ring-amber-200/80'
      : tone === 'soft'
        ? 'bg-[var(--color-surface)] text-[var(--color-muted)] ring-[var(--color-border)]'
        : 'bg-white text-[var(--color-ink)] ring-[var(--color-border)]'
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[13px] leading-snug ring-1 ${toneClass}`}>
      {children}
    </span>
  )
}

function UnitCard({
  unitId,
  title,
  formulas,
  traps,
}: {
  unitId: number
  title: string
  formulas: string[]
  traps: string[]
}) {
  const unit = units.find((u) => u.id === unitId)
  const deep = quizDeep[unitId]
  const concepts = deep?.concepts ?? []
  const remember = traps.slice(0, 6)

  return (
    <article
      id={`u${unitId}`}
      className="scroll-mt-20 rounded-2xl border border-[var(--color-border)] bg-white"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 pb-3">
        <h2 className="font-serif text-2xl font-bold tracking-tight">
          <span className="text-[var(--color-accent)]">{unitId}</span>
          <span className="ml-2.5">{title}</span>
        </h2>
        {unit && (
          <Link
            to={`/unit/${unit.slug}#concepts`}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            자세히 →
          </Link>
        )}
      </header>

      {/* 공식 — 여유 있게 */}
      <div className="px-5 pb-5">
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
          공식
        </p>
        <div className="flex flex-col gap-2">
          {formulas.map((f) => (
            <p
              key={f}
              className="font-mono text-[13px] leading-relaxed text-[var(--color-ink)] sm:text-sm"
            >
              {f}
            </p>
          ))}
        </div>
      </div>

      {/* 개념 키워드 사전 */}
      {concepts.length > 0 && (
        <div className="border-t border-[var(--color-border)] px-5 py-5">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
            개념
          </p>
          <dl className="space-y-4">
            {concepts.map((c) => (
              <div
                key={c.term}
                className="grid gap-1.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4 sm:items-start"
              >
                <dt className="text-sm font-semibold text-[var(--color-ink)]">{c.term}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {chips(c.summary).map((k) => (
                    <Chip key={k}>{k}</Chip>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* 함정 — 칩만, 소수 */}
      <div className="border-t border-[var(--color-border)] bg-amber-50/50 px-5 py-5">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-amber-900/60 uppercase">
          함정 · 기억
        </p>
        <div className="flex flex-wrap gap-1.5">
          {remember.map((t) => (
            <Chip key={t} tone="amber">
              {t}
            </Chip>
          ))}
        </div>
      </div>
    </article>
  )
}

export function QuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
          Quiz Prep
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">퀴즈 한눈에</h1>
        <p className="mt-3 text-[var(--color-muted)]">
          단원별 <strong className="font-medium text-[var(--color-ink)]">공식 · 개념 키워드 · 함정</strong>
          . 긴 설명은 단원 페이지에 있습니다.
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2">
        {quizCheatSheet.map((row) => (
          <a
            key={row.unit}
            href={`#u${row.unit}`}
            className="rounded-full px-3 py-1.5 text-sm text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-accent)] hover:ring-[var(--color-accent)]/40"
          >
            <span className="font-semibold text-[var(--color-accent)]">{row.unit}</span>
            <span className="ml-1.5 hidden sm:inline">{row.title}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {quizCheatSheet.map((row) => (
          <UnitCard
            key={row.unit}
            unitId={row.unit}
            title={row.title}
            formulas={row.formulas}
            traps={row.traps}
          />
        ))}
      </div>
    </div>
  )
}
