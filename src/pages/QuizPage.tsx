import { Link } from 'react-router-dom'
import { PlainFormula } from '../components/PlainFormula'
import { quizCheatSheet } from '../data/quizDeep'
import { units } from '../data/units'

export function QuizPage() {
  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-white px-6 pt-14 pb-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
            Quiz Prep
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">퀴즈 한눈에</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-muted)]">
            실험서에 적힌 <strong className="font-medium text-[var(--color-ink)]">공식·사소한 개념</strong>만
            모았습니다. 자세한 설명·시각화는 각 단원 «자세히»로 들어가세요.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {quizCheatSheet.map((row) => (
              <a
                key={row.unit}
                href={`#u${row.unit}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-accent)]"
              >
                {row.unit}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-6 py-12">
        {quizCheatSheet.map((row) => {
          const unit = units.find((u) => u.id === row.unit)
          return (
            <article
              key={row.unit}
              id={`u${row.unit}`}
              className="scroll-mt-[calc(var(--header-height)+16px)] rounded-2xl border border-[var(--color-border)] bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
                <h2 className="text-lg font-semibold">
                  <span className="text-[var(--color-accent)]">{row.unit}.</span> {row.title}
                </h2>
                {unit && (
                  <Link
                    to={`/unit/${unit.slug}#concepts`}
                    className="shrink-0 text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    단원 페이지 →
                  </Link>
                )}
              </div>

              <div className="grid gap-6 p-5 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
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
                  <p className="mb-3 text-xs font-semibold tracking-wide text-amber-800 uppercase">
                    함정 · 사소한 포인트
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
            </article>
          )
        })}
      </section>
    </div>
  )
}
