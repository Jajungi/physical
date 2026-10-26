import { Link, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { units } from '../data/units'

export function Layout() {
  const location = useLocation()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const isHome = path === '/' || path.endsWith('/physical')
  const isQuiz = path.endsWith('/quiz')
  const currentSlug = path.includes('/unit/')
    ? path.split('/unit/')[1]?.split('/')[0] ?? null
    : null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0">
            <Logo size={36} />
          </Link>

          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                isHome
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-ink)]'
              }`}
            >
              목차
            </Link>
            <Link
              to="/quiz"
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                isQuiz
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-ink)]'
              }`}
            >
              퀴즈
            </Link>
          </nav>
        </div>

        {/* 단원: 번호만 — 제목은 title로 */}
        <nav className="border-t border-[var(--color-border)]/70">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 hidden shrink-0 text-xs text-[var(--color-muted)] sm:inline">
              단원
            </span>
            {units.map((u) => {
              const active = currentSlug === u.slug
              return (
                <Link
                  key={u.id}
                  to={`/unit/${u.slug}`}
                  title={`${u.id}단원 ${u.title}`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                    active
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {u.id}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-[var(--color-muted)]">
            일반물리실험2 · 전자기학 실험서 기반 학습 자료
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            LMS 공지·교수 지시가 이 사이트와 다르면 공지를 우선합니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
