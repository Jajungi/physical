/** Scale canvas for Retina/HiDPI — call once per frame before drawing. */
export function prepareCanvas(
  canvas: HTMLCanvasElement,
  logicalW: number,
  logicalH: number,
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5)
  const pw = Math.round(logicalW * dpr)
  const ph = Math.round(logicalH * dpr)
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw
    canvas.height = ph
    canvas.style.width = `${logicalW}px`
    canvas.style.height = `${logicalH}px`
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return ctx
}

/** Draw solenoid coil cross-sections along a horizontal axis (y = cy). */
export function drawSolenoidCoils(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  spacing: number,
  rx = 8,
  ry = 28,
  color = '#3b82f6',
  active = true,
) {
  const startX = cx - ((count - 1) * spacing) / 2
  ctx.strokeStyle = active ? color : '#94a3b8'
  ctx.lineWidth = active ? 2.5 : 1.5
  for (let k = 0; k < count; k++) {
    const x = startX + k * spacing
    ctx.beginPath()
    ctx.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  if (active) {
    ctx.fillStyle = 'rgba(59,130,246,0.08)'
    ctx.fillRect(startX - rx - 4, cy - ry, (count - 1) * spacing + 2 * rx + 8, 2 * ry)
  }
}

/** Helmholtz pair: two coil stacks separated by gap. */
export function drawHelmholtzCoils(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  gap: number,
  turnsPerCoil = 6,
  rx = 6,
  ry = 26,
) {
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  for (const ox of [-gap / 2, gap / 2]) {
    for (let k = 0; k < turnsPerCoil; k++) {
      const x = cx + ox + (k - turnsPerCoil / 2) * 5
      ctx.beginPath()
      ctx.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

/** Single circular coil (face view). */
export function drawCircularCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius = 36,
) {
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(cx, cy, radius * 0.35, radius, 0, 0, Math.PI * 2)
  ctx.stroke()
}

/** 가우스미터 + z축 탐침 (4단원) */
export function drawGaussMeterProbe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zLabel: string,
  bG: number,
) {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(x, y, 72, 32)
  ctx.fillStyle = '#33ff33'
  ctx.font = 'bold 11px ui-monospace, monospace'
  ctx.fillText(`${bG.toFixed(0)} G`, x + 8, y + 20)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '8px system-ui, sans-serif'
  ctx.fillText('가우스미터', x + 8, y + 10)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 18, y + 16)
  ctx.lineTo(x - 2, y + 16)
  ctx.stroke()
  ctx.fillStyle = '#3b82f6'
  ctx.beginPath()
  ctx.arc(x - 22, y + 16, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.font = '8px system-ui, sans-serif'
  ctx.fillText(zLabel, x - 28, y + 30)
}

/** 변압기: 코어 + 1차·2차 권선 (4단원) */
export function drawTransformer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  core: string,
  n1: number,
  n2: number,
) {
  ctx.strokeStyle = '#b45309'
  ctx.lineWidth = 3
  ctx.strokeRect(cx - 48, cy - 36, 96, 72)
  drawSolenoidCoils(ctx, cx - 22, cy, 4, 8, 5, 22, '#ef4444', true)
  drawSolenoidCoils(ctx, cx + 22, cy, 4, 8, 5, 22, '#3b82f6', true)
  ctx.fillStyle = '#64748b'
  ctx.font = '10px system-ui, sans-serif'
  ctx.fillText(`코어: ${core}`, cx - 38, cy - 44)
  ctx.fillText(`N₁=${n1}`, cx - 42, cy + 52)
  ctx.fillText(`N₂=${n2}`, cx + 8, cy + 52)
}

/** 광학 벤치 레일 */
export function drawOpticalRail(
  ctx: CanvasRenderingContext2D,
  y: number,
  x0: number,
  x1: number,
) {
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x0, y)
  ctx.lineTo(x1, y)
  ctx.stroke()
  for (let x = x0; x <= x1; x += 24) {
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x - 1, y - 4, 2, 8)
  }
}

/** 편광판 / 슬릿 홀더 */
export function drawOpticalMount(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  label: string,
) {
  ctx.fillStyle = '#334155'
  ctx.fillRect(x - 3, y - h, 6, h)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(x - 10, y - h + 8, 20, h - 16)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '8px system-ui, sans-serif'
  ctx.fillText(label, x - 14, y + 12)
}

const CORE_LABELS: Record<string, string> = {
  air: '공심',
  iron: '철심',
  u: 'U자',
  square: 'ㅁ자',
}

export function coreLabel(core: string) {
  return CORE_LABELS[core] ?? core
}

/** 5단원: 솔레노이드 + (선택) 탈자 시료 링 */
export function drawHysteresisApparatus(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  withSample: boolean,
) {
  const cx = W / 2
  const cy = H / 2 + 8
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, H)

  drawSolenoidCoils(ctx, cx, cy, 10, 11, 7, 32, '#ef4444', true)

  if (withSample) {
    ctx.strokeStyle = '#78716c'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(cx, cy, 22, 14, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#a8a29e'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText('탈자 시료', cx - 22, cy + 28)
  } else {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText('철심 없음 (공기)', cx - 32, cy + 32)
  }

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 80, cy)
  ctx.lineTo(cx - 58, cy)
  ctx.moveTo(cx + 58, cy)
  ctx.lineTo(cx + 80, cy)
  ctx.stroke()
  ctx.fillStyle = '#64748b'
  ctx.font = '9px system-ui, sans-serif'
  ctx.fillText('전류 I', cx - 88, cy - 6)
}
