import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ImageWithFallback } from '../components/ImageWithFallback'
import { units } from '../data/units'

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent" />
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium tracking-widest text-[var(--color-accent)] uppercase"
          >
            General Physics Lab II
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-serif text-5xl font-bold tracking-tight md:text-7xl"
          >
            일물실
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]"
          >
            전자기학 실험의 개념, 실험 방법, 참고자료, 실험서 원문을 위키처럼 정리했습니다.
            실험 중 측정값을 바로 넣어볼 수 있는 계산기도 단원별로 준비되어 있습니다.
          </motion.p>
        </div>
      </section>

      {/* Unit cards */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {units.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/unit/${unit.slug}`}
                className="group flex overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:border-[var(--color-accent)]/30 hover:shadow-lg"
              >
                <div className="relative w-32 shrink-0 overflow-hidden md:w-40">
                  <ImageWithFallback
                    src={unit.heroImage}
                    alt={unit.title}
                    unitNumber={unit.id}
                    fallbackLabel={unit.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[var(--color-accent)]/10" />
                  <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-sm font-bold text-[var(--color-accent)]">
                    {unit.id}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center p-5 md:p-6">
                  <p className="text-xs font-medium tracking-wide text-[var(--color-muted)] uppercase">
                    {unit.englishTitle}
                    {unit.week && <span className="ml-2">· Week {unit.week}</span>}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight group-hover:text-[var(--color-accent)]">
                    {unit.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {unit.summary}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[var(--color-accent)]">
                    {unit.calculators.length}개 계산기 →
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
