/** 퀴즈 한눈용 — KaTeX 없이 유니코드 수식을 그대로 보여 깨짐을 막음 */
export function PlainFormula({ text }: { text: string }) {
  return (
    <code className="block whitespace-pre-wrap break-words rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-[13px] leading-relaxed text-[var(--color-ink)]">
      {text}
    </code>
  )
}
