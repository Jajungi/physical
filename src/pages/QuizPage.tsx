import { Link } from 'react-router-dom'
import { PlainFormula } from '../components/PlainFormula'
import { quizCheatSheet, quizDeep } from '../data/quizDeep'
import { units } from '../data/units'

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
  const topTraps = traps.slice(0, 5)
  const extraTraps = traps.slice(5)
  const extraPitfalls = (deep?.pitfalls ?? []).filter((p) => !traps.includes(p)).slice(0, 8)

  return (
    <article
      id={`u${unitId}`}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
        <h2 className="font-serif text-xl font-bold tracking-tight">
          <span className="text-[var(--color-accent)]">{unitId}</span>
          <span className="ml-2">{title}</span>
        </h2>
        {unit && (
          <Link
            to={`/unit/${unit.slug}#concepts`}
            className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            단원 페이지 →
          </Link>
        )}
      </header>

      {/* 한눈: 공식 | 함정 */}
      <div className="grid md:grid-cols-[1.15fr_1fr]">
        <div className="border-b border-[var(--color-border)] p-4 md:border-r md:border-b-0 sm:p-5">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
            공식
          </p>
          <div className="space-y-1.5">
            {formulas.map((f) => (
              <PlainFormula key={f} text={f} />
            ))}
          </div>
        </div>

        <div className="border-b border-[var(--color-border)] bg-amber-50/40 p-4 sm:p-5">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-amber-900/70 uppercase">
            함정 · 기억
          </p>
          <ul className="space-y-2">
            {topTraps.map((t) => (
              <li
                key={t}
                className="border-l-2 border-amber-400 pl-2.5 text-sm leading-snug text-amber-950"
              >
                {t}
              </li>
            ))}
          </ul>
          {(extraTraps.length > 0 || extraPitfalls.length > 0) && (
            <details className="mt-3 group">
              <summary className="cursor-pointer list-none text-xs font-medium text-amber-800/80 marker:content-none [&::-webkit-details-marker]:hidden hover:text-amber-950">
                <span className="group-open:hidden">+ 더 많은 함정</span>
                <span className="hidden group-open:inline">− 접기</span>
              </summary>
              <ul className="mt-2 space-y-1.5 border-t border-amber-200/60 pt-2">
                {[...extraTraps, ...extraPitfalls].map((t) => (
                  <li key={t} className="text-xs leading-snug text-amber-900/80">
                    · {t}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {/* 접힘: 용어 */}
      {deep?.concepts && deep.concepts.length > 0 && (
        <details className="group border-b border-[var(--color-border)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-[var(--color-ink)] marker:content-none hover:bg-[var(--color-surface)] sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>
              용어 · 개념
              <span className="ml-2 font-normal text-[var(--color-muted)]">{deep.concepts.length}</span>
            </span>
            <span className="text-[var(--color-muted)] group-open:rotate-180">▾</span>
          </summary>
          <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-2">
            {deep.concepts.map((c) => (
              <div key={c.term} className="bg-white px-4 py-3 sm:px-5">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{c.term}</p>
                <p className="mt-0.5 text-sm leading-snug text-[var(--color-muted)]">{c.summary}</p>
                {c.formula && (
                  <div className="mt-2">
                    <PlainFormula text={c.formula} />
                  </div>
                )}
                {c.detail.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-[var(--color-accent)] hover:underline">
                      설명
                    </summary>
                    <div className="mt-1.5 space-y-1.5">
                      {c.detail.map((d) => (
                        <p key={d.slice(0, 40)} className="text-xs leading-relaxed text-[var(--color-muted)]">
                          {d}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 접힘: 한줄 요약 + 심화 */}
      {((deep?.glance && deep.glance.length > 0) || (deep?.articles && deep.articles.length > 0)) && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-[var(--color-ink)] marker:content-none hover:bg-[var(--color-surface)] sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>한줄 요약 · 심화</span>
            <span className="text-[var(--color-muted)] group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-4 sm:px-5">
            {deep?.glance && deep.glance.length > 0 && (
              <ul className="columns-1 gap-x-6 text-sm leading-snug text-[var(--color-muted)] sm:columns-2">
                {deep.glance.map((g) => (
                  <li key={g} className="mb-1.5 break-inside-avoid">
                    · {g}
                  </li>
                ))}
              </ul>
            )}
            {deep?.articles?.map((a) => (
              <details key={a.title} className="rounded-xl bg-[var(--color-surface)] px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium">{a.title}</summary>
                <div className="mt-2 space-y-1.5 pb-1">
                  {a.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)} className="text-xs leading-relaxed text-[var(--color-muted)]">
                      {p}
                    </p>
                  ))}
                  {a.bullets && (
                    <p className="text-xs text-[var(--color-ink)]">{a.bullets.join(' · ')}</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </details>
      )}
    </article>
  )
}

export function QuizPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
          Quiz Prep
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">퀴즈 한눈에</h1>
        <p className="mt-3 text-[var(--color-muted)]">
          단원마다 <strong className="font-medium text-[var(--color-ink)]">공식 · 함정</strong>만 펼쳐
          둡니다. 용어·심화는 필요할 때 열어보세요.
        </p>
      </header>

      {/* 전체 맵 */}
      <section className="mb-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
          전체 맵 · 클릭하면 해당 단원
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {quizCheatSheet.map((row) => (
            <a
              key={row.unit}
              href={`#u${row.unit}`}
              className="grid grid-cols-[2.5rem_1fr] items-start gap-3 px-4 py-2.5 transition hover:bg-[var(--color-accent-soft)] sm:grid-cols-[2.5rem_8rem_1fr]"
            >
              <span className="pt-0.5 text-center text-sm font-bold text-[var(--color-accent)]">
                {row.unit}
              </span>
              <span className="hidden pt-0.5 text-sm font-medium sm:block">{row.title}</span>
              <span className="min-w-0 truncate font-mono text-xs text-[var(--color-muted)] sm:text-sm">
                <span className="sm:hidden font-sans font-medium text-[var(--color-ink)]">
                  {row.title} ·{' '}
                </span>
                {row.formulas[0]}
              </span>
            </a>
          ))}
        </div>
      </section>

      <nav className="sticky top-[calc(var(--header-height,56px))] z-30 -mx-4 mb-6 flex gap-1 overflow-x-auto bg-[var(--color-surface)]/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:border-[var(--color-border)] sm:px-2">
        {quizCheatSheet.map((row) => (
          <a
            key={row.unit}
            href={`#u${row.unit}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white hover:ring-[var(--color-accent)]"
          >
            {row.unit}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
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
