import { Link, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { units } from '../data/units'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const currentSlug = location.pathname.startsWith('/unit/')
    ? location.pathname.replace('/unit/', '')
    : null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/60 bg-[var(--color-surface)]/95 backdrop-blur-xl">
        {/* Top row */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center">
            <Logo size={38} />
          </Link>

          <Link
            to="/"
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
              isHome
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/40'
            }`}
          >
            전체 목차
          </Link>
        </div>

        {/* Unit navigation — all 10 units */}
        <nav className="border-t border-[var(--color-border)]/60">
          <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            {units.map((u) => {
              const active = currentSlug === u.slug
              return (
                <Link
                  key={u.id}
                  to={`/unit/${u.slug}`}
                  title={`${u.id}단원 ${u.title}`}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? 'bg-[var(--color-accent)] font-medium text-white'
                      : 'text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-ink)]'
                  }`}
                >
                  <span className="font-semibold">{u.id}</span>
                  <span className="ml-1.5 hidden sm:inline">{u.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm text-[var(--color-muted)]">
            일반물리실험2 · 전자기학 실험서 기반 학습 자료
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            LMS 공지·교수 지시가 이 사이트와 다르면 공지를 우선합니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
