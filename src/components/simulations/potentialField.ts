export type ElectrodeType = 'parallel' | 'two-point' | 'point-line' | 'ring' | 'dipole'

export const ELECTRODE_LABELS: Record<ElectrodeType, string> = {
  parallel: '① 평행판 (균일 전기장)',
  'two-point': '② 두 점전극',
  'point-line': '③ 점-선 전극',
  ring: '④ 고리 전극',
  dipole: '⑤ 전기 쌍극자',
}

export const TANK_W_MM = 400
export const TANK_H_MM = 270
export const TANK_COLS = 40
export const TANK_ROWS = 27
/** Pixels per 10 mm grid cell — keeps cells square (1.3 px/mm). */
export const TANK_CELL_PX = 13
export const TANK_PAD = 40
export const CANVAS_W = TANK_COLS * TANK_CELL_PX + 2 * TANK_PAD
export const CANVAS_H = TANK_ROWS * TANK_CELL_PX + 2 * TANK_PAD
/** Circular ring electrode radius, as a fraction of tank width (40 mm). */
export const RING_R = 40 / TANK_W_MM
const TANK_W_M = TANK_W_MM / 1000
const TANK_H_M = TANK_H_MM / 1000

/** Distance in tank-width units (1 = 400 mm). y is scaled so circles stay circular. */
export function distNorm(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot((x2 - x1) * TANK_W_MM, (y2 - y1) * TANK_H_MM) / TANK_W_MM
}

export function mmToNorm(xMm: number, yMm: number) {
  return { x: xMm / TANK_W_MM, y: yMm / TANK_H_MM }
}

export function normToMm(x: number, y: number) {
  return { xMm: Math.round(x * TANK_W_MM), yMm: Math.round(y * TANK_H_MM) }
}

function clamp(v: number, V0: number) {
  return Math.max(0, Math.min(V0, v))
}

/** 2D conductive-tank potential (Laplace-like approximations per electrode geometry).
 *  (x,y) are 0–1 across the 400×270 mm tank; distances use real mm so circles stay circular. */
export function potential(type: ElectrodeType, x: number, y: number, V0: number): number {
  switch (type) {
    case 'parallel':
      return clamp(V0 * x, V0)
    case 'two-point': {
      const r1 = distNorm(x, y, 0.28, 0.5) + 0.025
      const r2 = distNorm(x, y, 0.72, 0.5) + 0.025
      const ln = Math.log(r2 / r1)
      return clamp(V0 * (0.5 + ln / 4.5), V0)
    }
    case 'point-line': {
      const rPoint = distNorm(x, y, 0.22, 0.5) + 0.03
      const distLine = Math.abs(x - 0.78)
      const fromPoint = 0.12 / rPoint
      const fromLine = 1 - distLine * 2.2
      return clamp(V0 * (0.35 * fromLine + 0.65 * fromPoint / (fromPoint + 2)), V0)
    }
    case 'ring': {
      const r = Math.abs(distNorm(x, y, 0.5, 0.5) - RING_R)
      return clamp(V0 * (1 - r * 2.8), V0)
    }
    case 'dipole': {
      const r1 = distNorm(x, y, 0.35, 0.5) + 0.03
      const r2 = distNorm(x, y, 0.65, 0.5) + 0.03
      const raw = 1 / r1 - 1 / r2
      return clamp(V0 * (0.5 + raw * 0.06), V0)
    }
  }
}

export function fieldAt(
  type: ElectrodeType,
  x: number,
  y: number,
  V0: number,
): { Ex: number; Ey: number; E: number } {
  const h = 0.004
  const hy = h * (TANK_W_MM / TANK_H_MM)
  const V = potential(type, x, y, V0)
  const Vx = potential(type, x + h, y, V0)
  const Vy = potential(type, x, y + hy, V0)
  const Ex = -(Vx - V) / h / TANK_W_M
  const Ey = -(Vy - V) / h / TANK_W_M
  return { Ex, Ey, E: Math.hypot(Ex, Ey) }
}

function clampNorm(v: number) {
  return Math.max(0.06, Math.min(0.94, v))
}

/** Walk onto the V = targetV contour (gradient step, then a short local refine). */
export function snapToEquipotential(
  type: ElectrodeType,
  targetV: number,
  from: { x: number; y: number },
  V0: number,
): { x: number; y: number } {
  let x = from.x
  let y = from.y
  for (let i = 0; i < 48; i++) {
    const V = potential(type, x, y, V0)
    const err = targetV - V
    if (Math.abs(err) < V0 * 0.002) break
    const { Ex, Ey, E } = fieldAt(type, x, y, V0)
    if (E < 0.4) break
    const scale = -err / (E * E)
    const dlx = Ex * scale
    const dly = Ey * scale
    const dl = Math.hypot(dlx, dly)
    const k = dl > 0.02 ? 0.02 / dl : 1
    x = clampNorm(x + (dlx * k) / TANK_W_M)
    y = clampNorm(y + (dly * k) / TANK_H_M)
  }

  let best = { x, y }
  let bestDv = Math.abs(potential(type, x, y, V0) - targetV)
  const step = 0.004
  for (let dx = -0.03; dx <= 0.03; dx += step) {
    for (let dy = -0.03; dy <= 0.03; dy += step) {
      const px = clampNorm(x + dx)
      const py = clampNorm(y + dy)
      const dv = Math.abs(potential(type, px, py, V0) - targetV)
      if (dv < bestDv) {
        bestDv = dv
        best = { x: px, y: py }
      }
    }
  }
  return best
}

function resamplePath(path: { x: number; y: number }[], step: number) {
  if (path.length === 0) return []
  const out = [path[0]]
  let acc = 0
  for (let i = 1; i < path.length; i++) {
    acc += distNorm(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y)
    if (acc >= step) {
      out.push(path[i])
      acc = 0
    }
  }
  const last = path[path.length - 1]
  const prev = out[out.length - 1]
  if (distNorm(prev.x, prev.y, last.x, last.y) > step * 0.35) out.push(last)
  return out
}

/** Ordered polylines on V = targetV (marching squares). spacingMm = 점 간격. */
export function sampleEquipotentialPaths(
  type: ElectrodeType,
  targetV: number,
  V0: number,
  spacingMm = 12,
): { x: number; y: number }[][] {
  const step = spacingMm / TANK_W_MM
  return extractContourPaths(type, targetV, V0, 100)
    .map((path) => resamplePath(path, step))
    .filter((path) => path.length >= 2)
}

/** Put the fixed probe on the nearest sampled path so the line goes through A. */
export function attachPointToPaths(
  paths: { x: number; y: number }[][],
  pt: { x: number; y: number },
): { x: number; y: number }[][] {
  if (paths.length === 0) return [[{ ...pt }]]
  let bestPath = 0
  let bestI = 0
  let bestD = Infinity
  paths.forEach((path, pi) => {
    path.forEach((p, i) => {
      const d = distNorm(p.x, p.y, pt.x, pt.y)
      if (d < bestD) {
        bestD = d
        bestPath = pi
        bestI = i
      }
    })
  })
  return paths.map((path, pi) => {
    if (pi !== bestPath) return path
    const next = [...path]
    next[bestI] = { x: pt.x, y: pt.y }
    return next
  })
}

/** Flattened samples on the exact contour — no voltage-tolerance band. */
export function traceEquipotential(
  type: ElectrodeType,
  targetV: number,
  V0: number,
  _res = 100,
  spacingMm = 12,
): { x: number; y: number }[] {
  return sampleEquipotentialPaths(type, targetV, V0, spacingMm).flat()
}

/** Marching-squares contour extraction — stable closed/open equipotential paths. */
export function extractContourPaths(
  type: ElectrodeType,
  targetV: number,
  V0: number,
  res = 72,
): { x: number; y: number }[][] {
  const x0 = 0.06
  const y0 = 0.06
  const x1 = 0.94
  const y1 = 0.94
  const dx = (x1 - x0) / res
  const dy = (y1 - y0) / res

  const grid: number[][] = []
  for (let j = 0; j <= res; j++) {
    grid[j] = []
    for (let i = 0; i <= res; i++) {
      grid[j][i] = potential(type, x0 + i * dx, y0 + j * dy, V0)
    }
  }

  const lerp = (
    ax: number, ay: number, av: number,
    bx: number, by: number, bv: number,
  ): { x: number; y: number } => {
    const t = Math.abs(bv - av) < 1e-12 ? 0.5 : (targetV - av) / (bv - av)
    return { x: ax + t * (bx - ax), y: ay + t * (by - ay) }
  }

  const edgePt = (edge: number, i: number, j: number): { x: number; y: number } => {
    const v = (ci: number, cj: number) => grid[cj][ci]
    const xbl = x0 + i * dx
    const ybl = y0 + j * dy
    const xbr = x0 + (i + 1) * dx
    const ybr = y0 + j * dy
    const xtr = x0 + (i + 1) * dx
    const ytr = y0 + (j + 1) * dy
    const xtl = x0 + i * dx
    const ytl = y0 + (j + 1) * dy
    switch (edge) {
      case 0: return lerp(xbl, ybl, v(i, j), xbr, ybr, v(i + 1, j))
      case 1: return lerp(xbr, ybr, v(i + 1, j), xtr, ytr, v(i + 1, j + 1))
      case 2: return lerp(xtr, ytr, v(i + 1, j + 1), xtl, ytl, v(i, j + 1))
      default: return lerp(xtl, ytl, v(i, j + 1), xbl, ybl, v(i, j))
    }
  }

  // bl=1, br=2, tr=4, tl=8
  const edgeTable: [number, number][][] = [
    [], [[0, 3]], [[0, 1]], [[1, 3]], [[1, 2]], [[0, 3], [1, 2]], [[0, 2]], [[2, 3]],
    [[2, 3]], [[0, 2]], [[0, 1], [2, 3]], [[1, 2]], [[1, 3]], [[0, 1]], [[0, 3]], [],
  ]

  const segments: [{ x: number; y: number }, { x: number; y: number }][] = []
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const idx =
        (grid[j][i] >= targetV ? 1 : 0) |
        (grid[j][i + 1] >= targetV ? 2 : 0) |
        (grid[j + 1][i + 1] >= targetV ? 4 : 0) |
        (grid[j + 1][i] >= targetV ? 8 : 0)
      for (const [e0, e1] of edgeTable[idx]) {
        segments.push([edgePt(e0, i, j), edgePt(e1, i, j)])
      }
    }
  }

  return stitchContourSegments(segments)
}

function ptKey(p: { x: number; y: number }) {
  return `${Math.round(p.x * 12000)},${Math.round(p.y * 12000)}`
}

function stitchContourSegments(
  segments: [{ x: number; y: number }, { x: number; y: number }][],
): { x: number; y: number }[][] {
  const adj = new Map<string, { x: number; y: number }[]>()
  for (const [a, b] of segments) {
    const ka = ptKey(a)
    const kb = ptKey(b)
    if (!adj.has(ka)) adj.set(ka, [])
    if (!adj.has(kb)) adj.set(kb, [])
    adj.get(ka)!.push(b)
    adj.get(kb)!.push(a)
  }

  const usedSeg = new Set<string>()
  const paths: { x: number; y: number }[][] = []

  const segKey = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `${ptKey(a)}|${ptKey(b)}`

  for (const [a, b] of segments) {
    const sk = segKey(a, b)
    if (usedSeg.has(sk)) continue

    const path: { x: number; y: number }[] = [a, b]
    usedSeg.add(sk)

    let tail = b
    for (;;) {
      const neighbors = adj.get(ptKey(tail)) ?? []
      const next = neighbors.find((n) => {
        const k = segKey(tail, n)
        return !usedSeg.has(k) && !usedSeg.has(segKey(n, tail))
      })
      if (!next) break
      usedSeg.add(segKey(tail, next))
      path.push(next)
      tail = next
      if (ptKey(tail) === ptKey(path[0])) break
    }

    let head = a
    for (;;) {
      const neighbors = adj.get(ptKey(head)) ?? []
      const prev = neighbors.find((n) => {
        const k = segKey(head, n)
        return !usedSeg.has(k) && !usedSeg.has(segKey(n, head))
      })
      if (!prev) break
      usedSeg.add(segKey(prev, head))
      path.unshift(prev)
      head = prev
      if (ptKey(head) === ptKey(path[path.length - 1])) break
    }

    if (path.length >= 2) paths.push(path)
  }

  return paths
}

/** Chain scattered samples into drawable polylines (Fix scan / recorded points). */
export function chainNearestPoints(
  pts: { x: number; y: number }[],
  maxStep = 0.055,
): { x: number; y: number }[][] {
  const remaining = [...pts]
  const paths: { x: number; y: number }[][] = []

  while (remaining.length > 0) {
    remaining.sort((a, b) => a.y - b.y || a.x - b.x)
    const path: { x: number; y: number }[] = [remaining.shift()!]

    for (;;) {
      const last = path[path.length - 1]
      let best = -1
      let bestD = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const d = distNorm(remaining[i].x, remaining[i].y, last.x, last.y)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      if (best < 0 || bestD > maxStep) break
      path.push(remaining.splice(best, 1)[0])
    }

    if (path.length >= 2) paths.push(path)
    else if (path.length === 1 && remaining.length === 0) paths.push(path)
  }

  return paths
}

/** @deprecated use extractContourPaths or chainNearestPoints */
export function groupContourBranches(pts: { x: number; y: number }[]): { x: number; y: number }[][] {
  return chainNearestPoints(pts, 0.12)
}

export function sortByAngle<T extends { x: number; y: number }>(points: T[]): T[] {
  if (points.length < 3) return points
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length
  return [...points].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  )
}

export function drawLabGrid(
  ctx: CanvasRenderingContext2D,
  pad: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
) {
  const gw = (w - 2 * pad) / cols
  const gh = (h - 2 * pad) / rows
  ctx.fillStyle = '#c8dff0'
  ctx.fillRect(pad, pad, w - 2 * pad, h - 2 * pad)

  ctx.fillStyle = 'rgba(80,150,200,0.12)'
  for (let i = 0; i < 24; i++) {
    ctx.fillRect(pad + ((i * 41) % (w - 2 * pad)), pad + ((i * 29) % (h - 2 * pad)), 36, 2)
  }

  ctx.strokeStyle = 'rgba(100,130,160,0.45)'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= cols; i++) {
    const x = pad + i * gw
    ctx.beginPath()
    ctx.moveTo(x, pad)
    ctx.lineTo(x, h - pad)
    ctx.stroke()
    if (i % 5 === 0 && i > 0) {
      ctx.fillStyle = '#64748b'
      ctx.font = '8px sans-serif'
      ctx.fillText(`${(i * 10).toString()}`, x - 6, h - pad + 12)
    }
  }
  for (let j = 0; j <= rows; j++) {
    const y = pad + j * gh
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(w - pad, y)
    ctx.stroke()
    if (j % 5 === 0 && j > 0) {
      ctx.fillStyle = '#64748b'
      ctx.font = '8px sans-serif'
      ctx.fillText(`${(j * 10).toString()}`, pad - 18, y + 3)
    }
  }

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 4
  ctx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad)
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('SSI 수조 400×270 mm', pad + 6, pad - 8)
}

export function drawElectrodes(
  ctx: CanvasRenderingContext2D,
  type: ElectrodeType,
  pad: number,
  w: number,
  h: number,
  voltage: number,
) {
  const toC = (nx: number, ny: number) => ({
    cx: pad + nx * (w - 2 * pad),
    cy: pad + ny * (h - 2 * pad),
  })

  const pxPerMm = (w - 2 * pad) / TANK_W_MM
  const drawDisc = (nx: number, ny: number, label: string, color: string, sign: string) => {
    const { cx, cy } = toC(nx, ny)
    ctx.fillStyle = '#e2e8f0'
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(cx, cy, 12 * pxPerMm, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(sign, cx - 4, cy + 4)
    ctx.fillStyle = '#334155'
    ctx.font = '9px sans-serif'
    ctx.fillText(label, cx - 14, cy - 22)
  }

  switch (type) {
    case 'parallel': {
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(pad - 2, pad, 10, h - 2 * pad)
      ctx.fillRect(w - pad - 8, pad, 10, h - 2 * pad)
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('0 V', pad + 2, pad - 8)
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`+${voltage}V`, w - pad - 28, pad - 8)
      break
    }
    case 'two-point':
      drawDisc(0.28, 0.5, '전극 A', '#ef4444', '+')
      drawDisc(0.72, 0.5, '전극 B', '#3b82f6', '−')
      break
    case 'point-line': {
      drawDisc(0.22, 0.5, '점전극', '#ef4444', '+')
      ctx.fillStyle = '#1e293b'
      const lc = toC(0.78, 0.5)
      ctx.fillRect(lc.cx - 5, pad + 8, 10, h - 2 * pad - 16)
      ctx.fillStyle = '#3b82f6'
      ctx.font = '9px sans-serif'
      ctx.fillText('선전극 0V', lc.cx - 18, pad - 2)
      break
    }
    case 'ring': {
      const { cx, cy } = toC(0.5, 0.5)
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(cx, cy, RING_R * (w - 2 * pad), 0, Math.PI * 2)
      ctx.stroke()
      drawDisc(0.5, 0.5, '고리', '#ef4444', '+')
      break
    }
    case 'dipole':
      drawDisc(0.35, 0.5, '+극', '#ef4444', '+')
      drawDisc(0.65, 0.5, '−극', '#3b82f6', '−')
      break
  }
}

export function drawProbe(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  color: string,
  isFixed: boolean,
) {
  if (isFixed) {
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy - 22)
    ctx.lineTo(cx, cy - 10)
    ctx.stroke()
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(cx - 14, cy - 32, 28, 10)
    ctx.fillStyle = '#334155'
    ctx.font = '8px sans-serif'
    ctx.fillText('고정 A', cx - 12, cy - 24)
  } else {
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx + 18, cy - 12)
    ctx.quadraticCurveTo(cx + 28, cy, cx + 12, cy + 6)
    ctx.stroke()
    ctx.fillStyle = '#334155'
    ctx.font = '8px sans-serif'
    ctx.fillText('이동 B', cx + 20, cy - 16)
  }

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText(label, cx - 4, cy + 4)
}

export function drawEquipotentialContour(
  ctx: CanvasRenderingContext2D,
  type: ElectrodeType,
  targetV: number,
  V0: number,
  pad: number,
  w: number,
  h: number,
  color: string,
  dashed = false,
) {
  const paths = extractContourPaths(type, targetV, V0, 80)
  ctx.strokeStyle = color
  ctx.lineWidth = dashed ? 1.5 : 2
  if (dashed) ctx.setLineDash([6, 4])
  for (const path of paths) {
    if (path.length < 2) continue
    ctx.beginPath()
    path.forEach((p, i) => {
      const cx = pad + p.x * (w - 2 * pad)
      const cy = pad + p.y * (h - 2 * pad)
      if (i === 0) ctx.moveTo(cx, cy)
      else ctx.lineTo(cx, cy)
    })
    ctx.stroke()
  }
  ctx.setLineDash([])
}

export function drawEFieldGrid(
  ctx: CanvasRenderingContext2D,
  type: ElectrodeType,
  V0: number,
  pad: number,
  w: number,
  h: number,
) {
  const cols = 12
  const rows = 8
  for (let i = 1; i < cols; i++) {
    for (let j = 1; j < rows; j++) {
      const px = i / cols
      const py = j / rows
      const { Ex, Ey, E } = fieldAt(type, px, py, V0)
      if (E < 0.8) continue
      const cx = pad + px * (w - 2 * pad)
      const cy = pad + py * (h - 2 * pad)
      const angle = Math.atan2(Ey, Ex)
      const len = Math.min(14, E * 1.1)
      ctx.strokeStyle = 'rgba(245,158,11,0.55)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len)
      ctx.stroke()
    }
  }
}
