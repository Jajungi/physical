/** 퀴즈 한눈용 — KaTeX 없이 유니코드 수식을 그대로 보여 깨짐을 막음 */
export function PlainFormula({ text }: { text: string }) {
  return (
    <code className="block whitespace-pre-wrap break-words rounded-md bg-[var(--color-surface)] px-2.5 py-1.5 font-mono text-[12.5px] leading-snug text-[var(--color-ink)] ring-1 ring-[var(--color-border)]/60">
      {text}
    </code>
  )
}
