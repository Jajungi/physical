const HEADER_OFFSET = 152

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: 'smooth' })
}

export function handleSectionClick(e: { preventDefault: () => void }, id: string) {
  e.preventDefault()
  scrollToSection(id)
  history.replaceState(null, '', `#${id}`)
}
