import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConceptVisual } from '../components/ConceptVisual'
import { FormulaBlock } from '../components/FormulaBlock'
import { FormulaCalculator } from '../components/FormulaCalculator'
import { ImageCarousel } from '../components/ImageCarousel'
import { ScrollExpand } from '../components/ScrollExpand'
import { AdvancedWiki, MethodWiki } from '../components/WikiArticle'
import { UnitSimulation } from '../components/simulations'
import { useLabSession } from '../contexts/LabSessionContext'
import { overviews } from '../data/overviews'
import { quizDeep } from '../data/quizDeep'
import { getUnitBySlug, units } from '../data/units'
import { allWikiContent } from '../data/wikiContent'
import { handleSectionClick, scrollToSection } from '../utils/scrollToSection'

const sections = [
  { id: 'summary', label: '요약' },
  { id: 'concepts', label: '개념·설명' },
  { id: 'formulas', label: '공식' },
  { id: 'pitfalls', label: '사소한 포인트' },
  { id: 'method', label: '실험 방법' },
  { id: 'simulation', label: '시뮬레이션' },
  { id: 'materials', label: '준비물' },
  { id: 'calculators', label: '계산기' },
  { id: 'advanced', label: '심화' },
  { id: 'quiz', label: '체크리스트' },
  { id: 'images', label: '실험서' },
] as const

export function UnitPage() {
  const { slug } = useParams<{ slug: string }>()
  const unit = slug ? getUnitBySlug(slug) : undefined
  const { setUnitId } = useLabSession()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (unit) setUnitId(unit.id)
  }, [unit, setUnitId])

  useEffect(() => {
    if (!unit) return
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash))
    }
  }, [unit])

  if (!unit) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">단원을 찾을 수 없습니다</h1>
        <Link to="/" className="mt-4 inline-block text-[var(--color-accent)]">
          ← 목차로 돌아가기
        </Link>
      </div>
    )
  }

  const deep = quizDeep[unit.id]
  const wiki = allWikiContent[unit.id]
  const overview = overviews[unit.id]
  const prev = units.find((u) => u.id === unit.id - 1)
  const next = units.find((u) => u.id === unit.id + 1)

  const visibleSections = sections.filter((s) => {
    if (s.id === 'simulation' && unit.id === 10) return false
    if (s.id === 'pitfalls' && (!deep || deep.pitfalls.length === 0)) return false
    return true
  })

  return (
    <div>
      <ScrollExpand
        imageSrc={unit.heroImage}
        title={unit.title}
        subtitle={unit.englishTitle}
        unitNumber={unit.id}
      />

      <nav className="sticky top-[var(--header-height)] z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {visibleSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => handleSectionClick(e, s.id)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)]"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <article className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_260px]">
          <div className="wiki-prose min-w-0">
            <section id="summary" className="scroll-target">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight">요약</h2>
              <div className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-8">
                <p className="text-lg leading-relaxed font-medium text-[var(--color-ink)]">
                  {unit.summary}
                </p>

                {deep && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                      한눈에
                    </h3>
                    <ul className="space-y-2">
                      {deep.glance.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2.5 text-[var(--color-muted)] before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']"
                        >
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {overview && (
                  <>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                        실험 목적
                      </h3>
                      <p className="leading-relaxed text-[var(--color-muted)]">{overview.purpose}</p>
                    </div>
                    {overview.measurement && (
                      <div className="rounded-xl bg-[var(--color-accent-soft)] px-4 py-3">
                        <h3 className="mb-1 text-sm font-semibold text-[var(--color-accent)]">측정 요약</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                          {overview.measurement}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <p className="text-sm text-[var(--color-muted)]">
                  퀴즈는{' '}
                  <Link to="/quiz" className="font-medium text-[var(--color-accent)] hover:underline">
                    전 단원 한눈에
                  </Link>
                  에서 공식·함정을 먼저 훑을 수 있습니다.
                </p>
              </div>
            </section>

            {/* Concepts — detailed + visual */}
            <section id="concepts" className="scroll-target mt-20">
              <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">개념·설명</h2>
              <p className="mb-8 text-[var(--color-muted)]">
                실험서에 나온 정의와 관계식을 풀어 쓴 부분입니다. 시뮬레이션으로 직관을 보완하세요.
              </p>

              {deep?.visual && (
                <div className="mb-10 rounded-2xl border border-[var(--color-border)] bg-white p-6">
                  <p className="mb-4 text-sm font-semibold text-[var(--color-accent)]">개념 시각화</p>
                  <ConceptVisual id={deep.visual} />
                </div>
              )}

              {deep ? (
                <div className="space-y-6">
                  {deep.concepts.map((c) => (
                    <article
                      key={c.term}
                      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
                    >
                      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3">
                        <h3 className="text-lg font-semibold text-[var(--color-ink)]">{c.term}</h3>
                        <p className="mt-1 text-sm text-[var(--color-accent)]">{c.summary}</p>
                      </div>
                      <div className="space-y-3 px-5 py-4">
                        {c.detail.map((p) => (
                          <p key={p.slice(0, 48)} className="leading-relaxed text-[var(--color-muted)]">
                            {p}
                          </p>
                        ))}
                        {c.formula && (
                          <div className="overflow-x-auto rounded-xl bg-[var(--color-surface)] px-4 py-3">
                            <FormulaBlock formula={c.formula} />
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      {unit.concepts.map((row, i) => (
                        <tr key={row.term} className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-surface)]/50'}>
                          <td className="px-5 py-3.5 font-medium whitespace-nowrap text-[var(--color-accent)]">
                            {row.term}
                          </td>
                          <td className="px-5 py-3.5 text-[var(--color-muted)]">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section id="formulas" className="scroll-target mt-20">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight">핵심 공식</h2>
              <div className="space-y-3">
                {unit.formulas.map((f) => (
                  <div
                    key={f}
                    className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white px-5 py-4"
                  >
                    <FormulaBlock formula={f} />
                  </div>
                ))}
              </div>
            </section>

            {deep && deep.pitfalls.length > 0 && (
              <section id="pitfalls" className="scroll-target mt-20">
                <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">사소한 포인트</h2>
                <p className="mb-6 text-[var(--color-muted)]">
                  실험서에 짧게 적혀 퀴즈에 자주 나오는 디테일입니다.
                </p>
                <ul className="space-y-2">
                  {deep.pitfalls.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm leading-relaxed text-amber-950"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section id="method" className="scroll-target mt-20">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight">실험 방법</h2>
              {wiki?.methodSections ? (
                <MethodWiki sections={wiki.methodSections} />
              ) : (
                <ol className="space-y-3">
                  {unit.method.map((step, i) => (
                    <li
                      key={step}
                      className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-bold text-[var(--color-accent)]">
                        {i + 1}
                      </span>
                      <span className="pt-1 text-[var(--color-muted)]">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {unit.id !== 10 && (
              <section id="simulation" className="scroll-target mt-20 min-w-0">
                <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">실험 시뮬레이션</h2>
                <p className="mb-8 text-[var(--color-muted)]">
                  개념을 그림으로 확인하거나, 측정값을 미리 검증할 때 사용하세요.
                </p>
                <UnitSimulation unitId={unit.id} />
              </section>
            )}

            <section id="materials" className="scroll-target mt-20">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight">준비물</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {unit.materials.map((m) => (
                  <li
                    key={m}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-muted)]"
                  >
                    {m}
                  </li>
                ))}
              </ul>
              {unit.safety && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-800">⚠️ 안전 주의</p>
                  <ul className="mt-2 space-y-1">
                    {unit.safety.map((s) => (
                      <li key={s} className="text-sm text-amber-700">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section id="calculators" className="scroll-target mt-20">
              <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">실험 계산기</h2>
              {unit.calculators.length > 0 ? (
                <>
                  <p className="mb-8 text-[var(--color-muted)]">
                    측정값을 넣으면 관련 공식 결과를 바로 확인합니다.
                  </p>
                  <div className="space-y-8">
                    {unit.calculators.map((calc) => (
                      <FormulaCalculator key={calc.id} calculator={calc} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[var(--color-muted)]">창의실험 주제에 맞춰 계산기가 추가됩니다.</p>
              )}
            </section>

            <section id="advanced" className="scroll-target mt-20">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight">심화 개념</h2>
              {deep?.articles && deep.articles.length > 0 ? (
                <AdvancedWiki articles={deep.articles} />
              ) : wiki?.advancedArticles ? (
                <AdvancedWiki articles={wiki.advancedArticles} />
              ) : (
                <div className="space-y-3">
                  {unit.advanced.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 text-[var(--color-muted)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="quiz" className="scroll-target mt-20">
              <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">퀴즈 체크리스트</h2>
              <p className="mb-6 text-sm text-[var(--color-muted)]">
                외웠는지 스스로 체크하세요.{' '}
                <Link to="/quiz" className="text-[var(--color-accent)] hover:underline">
                  전 단원 한눈에
                </Link>
              </p>
              <ul className="space-y-2">
                {unit.quizChecks.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3.5"
                  >
                    <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
                    <span className="text-sm text-[var(--color-muted)]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="images" className="scroll-target mt-20">
              <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight">실험서 원문</h2>
              <p className="mb-6 text-sm text-[var(--color-muted)]">
                좌우로 넘겨 실험서 페이지를 확인하세요. 클릭하면 확대됩니다.
              </p>
              <ImageCarousel images={unit.images} title={unit.title} />
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-height)+52px)] space-y-6">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <p className="text-xs font-medium tracking-wide text-[var(--color-muted)] uppercase">
                  이 단원
                </p>
                <p className="mt-2 text-2xl font-bold">{unit.id}단원</p>
                <p className="mt-1 font-medium">{unit.title}</p>
                {unit.week && (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">Week {unit.week}</p>
                )}
                <Link
                  to="/quiz"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  퀴즈 한눈에 →
                </Link>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <p className="text-xs font-medium tracking-wide text-[var(--color-muted)] uppercase">
                  페이지 목차
                </p>
                <ul className="mt-3 space-y-0.5">
                  {visibleSections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={(e) => handleSectionClick(e, s.id)}
                        className="block rounded-lg px-2 py-1.5 text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <nav className="mt-20 flex justify-between gap-4 border-t border-[var(--color-border)] pt-10">
          {prev ? (
            <Link
              to={`/unit/${prev.slug}`}
              className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 transition hover:border-[var(--color-accent)]/40"
            >
              <p className="text-xs text-[var(--color-muted)]">← 이전</p>
              <p className="mt-1 font-medium">
                {prev.id}단원 {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/unit/${next.slug}`}
              className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 text-right transition hover:border-[var(--color-accent)]/40"
            >
              <p className="text-xs text-[var(--color-muted)]">다음 →</p>
              <p className="mt-1 font-medium">
                {next.id}단원 {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  )
}
