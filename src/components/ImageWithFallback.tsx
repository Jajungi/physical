import { useState } from 'react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string
  unitNumber?: number
}

/** 실험서 PNG가 없을 때 그라데이션 플레이스홀더 표시 */
export function ImageWithFallback({
  fallbackLabel,
  unitNumber,
  alt,
  className = '',
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-100 text-slate-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        {unitNumber != null && (
          <span className="text-4xl font-bold text-indigo-300/80">{unitNumber}</span>
        )}
        <span className="mt-2 px-4 text-center text-xs leading-snug">
          {fallbackLabel ?? '실험서 이미지'}
        </span>
      </div>
    )
  }

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
