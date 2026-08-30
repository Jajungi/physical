import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageWithFallback } from './ImageWithFallback'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(i, images.length - 1))
    const slide = track.children[clamped] as HTMLElement | undefined
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    setIndex(clamped)
  }, [images.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onScroll = () => {
      const slides = Array.from(track.children) as HTMLElement[]
      const center = track.scrollLeft + track.clientWidth / 2
      let closest = 0
      let minDist = Infinity
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
        const dist = Math.abs(center - slideCenter)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })
      setIndex(closest)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [images.length])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') scrollTo(index - 1)
      if (e.key === 'ArrowRight') scrollTo(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, index, scrollTo])

  if (images.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIndex(i)
              setLightbox(true)
            }}
            className="w-[85%] shrink-0 snap-center cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-md sm:w-[70%] md:w-[60%]"
          >
            <ImageWithFallback
              src={src}
              alt={`${title} 실험서 ${i + 1}페이지`}
              fallbackLabel={`${title} p.${i + 1}`}
              className="aspect-[3/4] w-full bg-slate-100 object-contain"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            disabled={index === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-lg transition hover:border-[var(--color-accent)]/40 disabled:opacity-30"
            aria-label="이전 페이지"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            disabled={index === images.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-lg transition hover:border-[var(--color-accent)]/40 disabled:opacity-30"
            aria-label="다음 페이지"
          >
            →
          </button>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-ink)]">{index + 1}</span>
          {' / '}
          {images.length} 페이지
        </p>
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-[var(--color-accent)]' : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-muted)]'
            }`}
            aria-label={`${i + 1}페이지로 이동`}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
            aria-label="닫기"
          >
            ×
          </button>
          <button
            type="button"
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation()
              scrollTo(index - 1)
            }}
            disabled={index === 0}
            aria-label="이전"
          >
            ‹
          </button>
          <img
            src={images[index]}
            alt={`${title} 실험서 ${index + 1}페이지`}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation()
              scrollTo(index + 1)
            }}
            disabled={index === images.length - 1}
            aria-label="다음"
          >
            ›
          </button>
          <p className="absolute bottom-6 text-sm text-white/70">
            {index + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  )
}
