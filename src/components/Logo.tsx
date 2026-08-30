interface LogoProps {
  size?: number
  showText?: boolean
}

export function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#f4728a" />
            <stop offset="100%" stopColor="#e85d75" />
          </linearGradient>
          <linearGradient id="logo-field" x1="8" y1="8" x2="40" y2="40">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#logo-bg)" />
        {/* Nucleus */}
        <circle cx="24" cy="24" r="3.5" fill="white" fillOpacity="0.9" />
        {/* Field lines / orbits */}
        <ellipse cx="24" cy="24" rx="14" ry="6" stroke="url(#logo-field)" strokeWidth="1.5" fill="none" transform="rotate(-30 24 24)" />
        <ellipse cx="24" cy="24" rx="14" ry="6" stroke="url(#logo-field)" strokeWidth="1.5" fill="none" transform="rotate(30 24 24)" />
        <ellipse cx="24" cy="24" rx="10" ry="14" stroke="url(#logo-field)" strokeWidth="1.2" fill="none" opacity="0.8" />
        {/* Equipotential arcs */}
        <path
          d="M 10 24 Q 24 10 38 24"
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          strokeDasharray="3 2"
        />
        <path
          d="M 10 24 Q 24 38 38 24"
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          strokeDasharray="3 2"
        />
        {/* Electron dots */}
        <circle cx="36" cy="18" r="2" fill="white" />
        <circle cx="14" cy="30" r="1.5" fill="white" opacity="0.8" />
      </svg>
      {showText && (
        <div>
          <p className="text-sm font-semibold tracking-tight leading-none">일물실</p>
          <p className="mt-0.5 text-[10px] tracking-widest text-[var(--color-muted)] uppercase">
            Physics Lab
          </p>
        </div>
      )}
    </div>
  )
}
