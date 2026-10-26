import type { VisualId } from '../data/quizDeep'

/** 단원별 개념 다이어그램 (SVG) */
export function ConceptVisual({ id }: { id: VisualId }) {
  const common = 'w-full max-w-lg mx-auto'
  switch (id) {
    case 'equipotential':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="등전위선과 전기장">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <text x="180" y="22" textAnchor="middle" fill="#64748b" fontSize="12">
            등전위선(점선) ⟂ 전기장(화살표)
          </text>
          {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
            <line key={x} x1={x} y1="40" x2={x} y2="170" stroke="#94a3b8" strokeDasharray="4 3" />
          ))}
          {[55, 95, 135].map((y) => (
            <g key={y}>
              <line x1="30" y1={y} x2="330" y2={y} stroke="#0d9488" strokeWidth="2.5" markerEnd="url(#arrow)" />
            </g>
          ))}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
            </marker>
          </defs>
          <text x="40" y="188" fill="#0d9488" fontSize="11">
            고전위 →
          </text>
          <text x="280" y="188" fill="#64748b" fontSize="11">
            → 저전위
          </text>
        </svg>
      )
    case 'rc-tau':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="RC 충방전">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <text x="180" y="20" textAnchor="middle" fill="#64748b" fontSize="12">
            충전 63% · 방전 37% (t = τ)
          </text>
          {/* axes */}
          <line x1="40" y1="160" x2="340" y2="160" stroke="#94a3b8" />
          <line x1="40" y1="160" x2="40" y2="30" stroke="#94a3b8" />
          {/* charge curve */}
          <path
            d="M40,160 Q80,40 160,50 T340,42"
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
          />
          <line x1="100" y1="160" x2="100" y2="72" stroke="#f59e0b" strokeDasharray="3 2" />
          <circle cx="100" cy="72" r="4" fill="#f59e0b" />
          <text x="108" y="70" fill="#b45309" fontSize="11">
            τ → ~63%
          </text>
          <text x="300" y="38" fill="#0d9488" fontSize="11">
            ε
          </text>
        </svg>
      )
    case 'wheatstone':
      return (
        <svg viewBox="0 0 360 220" className={common} aria-label="휘트스톤 브리지">
          <rect width="360" height="220" fill="#f8fafc" rx="12" />
          <text x="180" y="22" textAnchor="middle" fill="#64748b" fontSize="12">
            평형: VB = VD → Ig = 0 → Rx = (R₂/R₁)Rk
          </text>
          {/* diamond */}
          <polygon points="180,50 280,110 180,170 80,110" fill="none" stroke="#0d9488" strokeWidth="2" />
          <text x="120" y="85" fill="#334155" fontSize="12">
            R₁
          </text>
          <text x="230" y="85" fill="#334155" fontSize="12">
            R₂
          </text>
          <text x="115" y="150" fill="#334155" fontSize="12">
            Rk
          </text>
          <text x="235" y="150" fill="#334155" fontSize="12">
            Rx
          </text>
          <line x1="180" y1="50" x2="180" y2="30" stroke="#94a3b8" />
          <line x1="180" y1="170" x2="180" y2="190" stroke="#94a3b8" />
          <text x="188" y="40" fill="#64748b" fontSize="10">
            +
          </text>
          <text x="188" y="200" fill="#64748b" fontSize="10">
            −
          </text>
          <line x1="80" y1="110" x2="280" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="180" y="108" textAnchor="middle" fill="#b45309" fontSize="10">
            G
          </text>
        </svg>
      )
    case 'helmholtz-solenoid':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="헬름홀츠·솔레노이드">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <text x="180" y="20" textAnchor="middle" fill="#64748b" fontSize="11">
            헬름홀츠: 간격 = a · 유한 솔레: (cosα₁+cosα₂)/2
          </text>
          <ellipse cx="100" cy="100" rx="28" ry="55" fill="none" stroke="#0d9488" strokeWidth="3" />
          <ellipse cx="180" cy="100" rx="28" ry="55" fill="none" stroke="#0d9488" strokeWidth="3" />
          <line x1="100" y1="100" x2="180" y2="100" stroke="#f59e0b" strokeDasharray="4 2" />
          <text x="140" y="92" textAnchor="middle" fill="#b45309" fontSize="11">
            a
          </text>
          <rect x="240" y="55" width="90" height="90" rx="8" fill="none" stroke="#6366f1" strokeWidth="2" />
          <text x="285" y="105" textAnchor="middle" fill="#6366f1" fontSize="11">
            솔레
          </text>
          <text x="285" y="175" textAnchor="middle" fill="#64748b" fontSize="10">
            B≈μ₀ni
          </text>
        </svg>
      )
    case 'hysteresis':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="이력곡선">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <line x1="40" y1="100" x2="320" y2="100" stroke="#94a3b8" />
          <line x1="180" y1="30" x2="180" y2="170" stroke="#94a3b8" />
          <path
            d="M70,130 C110,40 250,40 290,70 C250,160 110,160 70,130"
            fill="rgba(13,148,136,0.12)"
            stroke="#0d9488"
            strokeWidth="2.5"
          />
          <circle cx="180" cy="55" r="3" fill="#ef4444" />
          <text x="188" y="52" fill="#ef4444" fontSize="11">
            Br
          </text>
          <circle cx="120" cy="100" r="3" fill="#f59e0b" />
          <text x="90" y="95" fill="#b45309" fontSize="11">
            Hc
          </text>
          <text x="180" y="190" textAnchor="middle" fill="#64748b" fontSize="11">
            면적 ≈ 이력손실
          </text>
        </svg>
      )
    case 'current-balance':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="전류천칭">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <text x="180" y="22" textAnchor="middle" fill="#64748b" fontSize="12">
            Fd = mgs → B = mgs / (I d l)
          </text>
          <line x1="40" y1="100" x2="320" y2="100" stroke="#334155" strokeWidth="3" />
          <circle cx="180" cy="100" r="6" fill="#0d9488" />
          <text x="180" y="88" textAnchor="middle" fill="#0d9488" fontSize="10">
            축
          </text>
          <line x1="280" y1="100" x2="280" y2="150" stroke="#6366f1" strokeWidth="2" />
          <rect x="265" y="150" width="30" height="20" fill="#6366f1" opacity="0.3" />
          <text x="280" y="185" textAnchor="middle" fill="#6366f1" fontSize="11">
            mg · s
          </text>
          <line x1="80" y1="100" x2="80" y2="60" stroke="#f59e0b" strokeWidth="2" />
          <text x="80" y="50" textAnchor="middle" fill="#b45309" fontSize="11">
            F=BIl
          </text>
          <text x="80" y="185" textAnchor="middle" fill="#64748b" fontSize="10">
            d
          </text>
        </svg>
      )
    case 'rlc-phasor':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="RLC 페이저">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <line x1="40" y1="160" x2="200" y2="160" stroke="#94a3b8" />
          <line x1="40" y1="160" x2="40" y2="30" stroke="#94a3b8" />
          <line x1="40" y1="160" x2="160" y2="160" stroke="#0d9488" strokeWidth="3" markerEnd="url(#a2)" />
          <text x="100" y="175" fill="#0d9488" fontSize="11">
            VR (I와 동위상)
          </text>
          <line x1="160" y1="160" x2="160" y2="70" stroke="#6366f1" strokeWidth="3" />
          <text x="168" y="100" fill="#6366f1" fontSize="11">
            VL (+90°)
          </text>
          <line x1="160" y1="160" x2="160" y2="200" stroke="#f59e0b" strokeWidth="2" opacity="0" />
          <line x1="160" y1="160" x2="160" y2="200" stroke="transparent" />
          {/* VC down */}
          <line x1="160" y1="160" x2="160" y2="200" stroke="#f59e0b" strokeWidth="0" />
          <path d="M160,160 L160,195" stroke="#f59e0b" strokeWidth="3" />
          <text x="168" y="190" fill="#b45309" fontSize="11">
            VC (−90°)
          </text>
          <line x1="40" y1="160" x2="160" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          <text x="70" y="115" fill="#ef4444" fontSize="11">
            Vs
          </text>
          <defs>
            <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
            </marker>
          </defs>
        </svg>
      )
    case 'brewster':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="브루스터각">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <line x1="40" y1="120" x2="320" y2="120" stroke="#94a3b8" strokeWidth="2" />
          <line x1="180" y1="40" x2="180" y2="180" stroke="#cbd5e1" strokeDasharray="3 2" />
          <text x="188" y="50" fill="#64748b" fontSize="10">
            법선
          </text>
          <line x1="80" y1="50" x2="180" y2="120" stroke="#0d9488" strokeWidth="2.5" />
          <line x1="180" y1="120" x2="300" y2="50" stroke="#6366f1" strokeWidth="2.5" />
          <line x1="180" y1="120" x2="260" y2="180" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="90" y="45" fill="#0d9488" fontSize="11">
            입사 θp
          </text>
          <text x="280" y="45" fill="#6366f1" fontSize="11">
            반사
          </text>
          <text x="250" y="175" fill="#b45309" fontSize="11">
            굴절 θ₂
          </text>
          <text x="180" y="195" textAnchor="middle" fill="#64748b" fontSize="11">
            θp + θ₂ = 90° → n = tan θp
          </text>
        </svg>
      )
    case 'double-slit':
      return (
        <svg viewBox="0 0 360 200" className={common} aria-label="이중슬릿">
          <rect width="360" height="200" fill="#f8fafc" rx="12" />
          <rect x="80" y="40" width="8" height="120" fill="#334155" />
          <rect x="80" y="70" width="8" height="12" fill="#f8fafc" />
          <rect x="80" y="110" width="8" height="12" fill="#f8fafc" />
          <text x="60" y="100" fill="#64748b" fontSize="10">
            슬릿
          </text>
          <line x1="88" y1="76" x2="300" y2="50" stroke="#0d9488" strokeWidth="1.5" opacity="0.7" />
          <line x1="88" y1="116" x2="300" y2="50" stroke="#0d9488" strokeWidth="1.5" opacity="0.7" />
          <line x1="300" y1="40" x2="300" y2="160" stroke="#94a3b8" />
          {[50, 70, 90, 110, 130, 150].map((y, i) => (
            <rect
              key={y}
              x="300"
              y={y - 6}
              width="12"
              height="12"
              fill={i % 2 === 0 ? '#0d9488' : '#e2e8f0'}
            />
          ))}
          <text x="180" y="185" textAnchor="middle" fill="#64748b" fontSize="11">
            실험서: λ ≈ 2ay/D (기호 확인)
          </text>
        </svg>
      )
    case 'scientific-method':
      return (
        <svg viewBox="0 0 360 160" className={common} aria-label="과학적 방법">
          <rect width="360" height="160" fill="#f8fafc" rx="12" />
          {['이론', '가설', '실험', '검증'].map((label, i) => (
            <g key={label}>
              <rect x={30 + i * 85} y="55" width="70" height="40" rx="8" fill="#0d9488" opacity={0.15 + i * 0.1} stroke="#0d9488" />
              <text x={65 + i * 85} y="80" textAnchor="middle" fill="#0f766e" fontSize="13" fontWeight="600">
                {label}
              </text>
              {i < 3 && (
                <text x={108 + i * 85} y="80" fill="#94a3b8" fontSize="16">
                  →
                </text>
              )}
            </g>
          ))}
        </svg>
      )
    default:
      return null
  }
}
