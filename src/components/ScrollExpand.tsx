import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ImageWithFallback } from './ImageWithFallback'

interface ScrollExpandProps {
  imageSrc: string
  title: string
  subtitle: string
  unitNumber?: number
}

export function ScrollExpand({ imageSrc, title, subtitle, unitNumber }: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.8], [0.85, 1])
  const borderRadius = useTransform(scrollYProgress, [0, 0.8], [32, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.15])
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <div ref={containerRef} className="relative h-[70vh] min-h-[480px]">
      <div className="sticky top-0 flex h-[70vh] min-h-[480px] items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, borderRadius }}
          className="relative h-full w-full max-w-6xl overflow-hidden shadow-2xl shadow-black/10"
        >
          <ImageWithFallback
            src={imageSrc}
            alt={title}
            unitNumber={unitNumber}
            fallbackLabel={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-end p-8 md:p-14">
            {unitNumber && (
              <span className="mb-3 text-sm font-medium tracking-widest text-white/70 uppercase">
                Unit {unitNumber}
              </span>
            )}
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">{title}</h1>
            <p className="mt-3 text-lg text-white/80 md:text-xl">{subtitle}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
