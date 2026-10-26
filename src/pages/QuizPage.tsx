import { Link } from 'react-router-dom'
import { FormulaBlock } from '../components/FormulaBlock'
import { quizCheatSheet } from '../data/quizDeep'
import { units } from '../data/units'

export function QuizPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-12">
        <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
          Quiz Prep
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          퀴즈 한눈에
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-muted)]">
          실험 방법보다 실험서에 적힌 <strong className="text-[var(--color-ink)]">개념·공식·사소한 문장</strong>을
          모았습니다. 약한 단원은 카드에서 단원 페이지로 들어가 시각화·자세한 설명을 보세요.
        </p>
      </header>

      <section className="mb-14 space-y-4">
        {quizCheatSheet.map((row) => {
          const unit = units.find((u) => u.id === row.unit)
          return (
            <article
              key={row.unit}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3">
                <h2 className="font-semibold">
                  <span className="text-[var(--color-accent)]">{row.unit}단원</span>{' '}
                  {row.title}
                </h2>
                {unit && (
                  <Link
                    to={`/unit/${unit.slug}#concepts`}
                    className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    자세히 →
                  </Link>
                )}
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                    공식
                  </p>
                  <ul className="space-y-2">
                    {row.formulas.map((f) => (
                      <li
                        key={f}
                        className="overflow-x-auto rounded-lg bg-[var(--color-surface)] px-3 py-2"
                      >
                        <FormulaBlock formula={f} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-amber-700 uppercase">
                    함정·사소한 포인트
                  </p>
                  <ul className="space-y-1.5">
                    {row.traps.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-900"
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

      <p className="text-center text-sm text-[var(--color-muted)]">
        LMS·교수 공지가 우선입니다.
      </p>
    </div>
  )
}
