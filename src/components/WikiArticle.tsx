import type { AdvancedArticle, MethodSection } from '../types'

export function MethodWiki({ sections }: { sections: MethodSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="mb-2 text-xl font-semibold text-[var(--color-ink)]">{section.heading}</h3>
          {section.intro && (
            <p className="mb-5 leading-relaxed text-[var(--color-muted)]">{section.intro}</p>
          )}
          <ol className="space-y-4">
            {section.steps.map((step, i) => (
              <li
                key={step.title}
                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
              >
                <div className="flex gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h4 className="pt-0.5 font-semibold">{step.title}</h4>
                </div>
                <div className="space-y-3 px-5 py-4">
                  <p className="leading-relaxed text-[var(--color-muted)]">{step.body}</p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="rounded-xl bg-blue-50 px-4 py-3">
                      <p className="mb-1 text-xs font-semibold text-blue-700">💡 이렇게 하면 좋아요</p>
                      <ul className="space-y-1">
                        {step.tips.map((t) => (
                          <li key={t} className="text-sm leading-relaxed text-blue-800">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.caution && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                      ⚠️ {step.caution}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {section.notes && section.notes.length > 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-white px-5 py-4">
              <p className="mb-2 text-sm font-semibold text-[var(--color-ink)]">추가 메모</p>
              <ul className="space-y-1.5">
                {section.notes.map((n) => (
                  <li key={n} className="text-sm leading-relaxed text-[var(--color-muted)]">
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function AdvancedWiki({ articles }: { articles: AdvancedArticle[] }) {
  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <article
          key={article.title}
          className="rounded-2xl border border-[var(--color-border)] bg-white p-6 md:p-8"
        >
          <h3 className="mb-4 border-b border-[var(--color-border)] pb-3 text-xl font-semibold">
            {article.title}
          </h3>
          <div className="wiki-prose space-y-4">
            {article.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="leading-relaxed text-[var(--color-muted)]">
                {p}
              </p>
            ))}
            {article.bullets && (
              <ul className="mt-2 space-y-2">
                {article.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2 text-[var(--color-muted)] before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']"
                  >
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
