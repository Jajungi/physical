import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ImageWithFallback } from '../components/ImageWithFallback'
import { units } from '../data/units'

export function HomePage() {
  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-white px-6 pt-14 pb-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase">
            General Physics Lab II
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">전체 목차</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-muted)]">
            10개 단원의 개념·실험 방법·시뮬레이션·계산기·실험서 원문입니다. 퀴즈 공식·함정만 빠르게
            보려면{' '}
            <Link to="/quiz" className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline">
              퀴즈
            </Link>
            로 가세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {units.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.04, 0.2) }}
            >
              <Link
                to={`/unit/${unit.slug}`}
                className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-accent)]/35 hover:shadow-md"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface)] sm:h-28 sm:w-24">
                  <ImageWithFallback
                    src={unit.heroImage}
                    alt=""
                    unitNumber={unit.id}
                    fallbackLabel={String(unit.id)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-xs font-bold text-[var(--color-accent)]">
                    {unit.id}
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  {unit.week && (
                    <p className="text-xs text-[var(--color-muted)]">Week {unit.week}</p>
                  )}
                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight group-hover:text-[var(--color-accent)]">
                    {unit.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {unit.summary}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
