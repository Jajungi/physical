import { Link } from 'react-router-dom'
import { PlainFormula } from '../components/PlainFormula'
import { quizCheatSheet, quizDeep } from '../data/quizDeep'
import { units } from '../data/units'

export function QuizPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
          Quiz Prep
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">퀴즈 한눈에</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-muted)]">
          실험 방법보다 실험서에 적힌{' '}
          <strong className="text-[var(--color-ink)]">용어·개념·공식·사소한 문장(TMI)</strong>을
          모았습니다. 퀴즈에 그대로 나올 수 있는 정의·수치·비교까지 넣었습니다.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {quizCheatSheet.map((row) => (
            <a
              key={row.unit}
              href={`#u${row.unit}`}
              className="rounded-lg bg-[var(--color-surface)] px-2.5 py-1.5 text-sm font-semibold text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-accent)]"
            >
              {row.unit}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-10">
        {quizCheatSheet.map((row) => {
          const unit = units.find((u) => u.id === row.unit)
          const deep = quizDeep[row.unit]
          return (
            <article
              key={row.unit}
              id={`u${row.unit}`}
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3">
                <h2 className="font-semibold">
                  <span className="text-[var(--color-accent)]">{row.unit}단원</span> {row.title}
                </h2>
                {unit && (
                  <Link
                    to={`/unit/${unit.slug}#concepts`}
                    className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    단원 자세히 →
                  </Link>
                )}
              </div>

              {deep?.glance && deep.glance.length > 0 && (
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    한눈에 · 용어
                  </p>
                  <ul className="space-y-1.5">
                    {deep.glance.map((g) => (
                      <li
                        key={g}
                        className="flex gap-2 text-sm leading-relaxed text-[var(--color-ink)] before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']"
                      >
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-4 border-b border-[var(--color-border)] p-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    공식
                  </p>
                  <ul className="space-y-2">
                    {row.formulas.map((f) => (
                      <li key={f}>
                        <PlainFormula text={f} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-amber-800 uppercase">
                    함정 · TMI
                  </p>
                  <ul className="space-y-2">
                    {row.traps.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm leading-relaxed text-amber-950"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {deep?.concepts && deep.concepts.length > 0 && (
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    핵심 용어 · 개념 (퀴즈 출제 가능)
                  </p>
                  <div className="space-y-4">
                    {deep.concepts.map((c) => (
                      <div key={c.term}>
                        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                          {c.term}
                          <span className="ml-2 font-normal text-[var(--color-accent)]">{c.summary}</span>
                        </h3>
                        <ul className="mt-1.5 space-y-1">
                          {c.detail.map((d) => (
                            <li key={d.slice(0, 40)} className="text-sm leading-relaxed text-[var(--color-muted)]">
                              · {d}
                            </li>
                          ))}
                        </ul>
                        {c.formula && (
                          <div className="mt-2">
                            <PlainFormula text={c.formula} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deep?.pitfalls && deep.pitfalls.length > 0 && (
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    더 자세한 함정 · 실험서 사소한 포인트
                  </p>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {deep.pitfalls.map((p) => (
                      <li key={p} className="text-sm leading-relaxed text-[var(--color-muted)]">
                        · {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deep?.articles && deep.articles.length > 0 && (
                <div className="space-y-4 px-5 py-4">
                  <p className="text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    설명 더 보기
                  </p>
                  {deep.articles.map((a) => (
                    <div key={a.title}>
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      {a.paragraphs.map((p) => (
                        <p key={p.slice(0, 48)} className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
                          {p}
                        </p>
                      ))}
                      {a.bullets && (
                        <ul className="mt-2 space-y-1">
                          {a.bullets.map((b) => (
                            <li key={b} className="text-sm text-[var(--color-ink)]">
                              → {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
