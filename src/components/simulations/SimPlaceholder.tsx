export function SimPlaceholder({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-2xl">
        🔬
      </div>
      <p className="font-medium text-[var(--color-ink)]">
        {message ?? '주제 확정 후 시뮬레이션이 추가됩니다'}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        창의실험 주제가 정해지면 이곳에 맞춤 시뮬레이션을 구성할 예정입니다.
      </p>
    </div>
  )
}
