import { useCallback, useEffect, useRef, useState } from 'react'
import { LabDataSheet } from './LabDataSheet'
import {
  DigitalDisplay,
  GalvanometerGauge,
  LabPanel,
  SimCanvas,
  SimModeTabs,
  SimReadout,
  SimSelect,
  SimShell,
  SimSlider,
} from './SimShell'
import { SimHint } from './SimHint'
import { SimWorkbench } from './SimWorkbench'
import { SimApparatusCaption } from './SimApparatusCaption'
import { prepareCanvas } from './simCanvasHelpers'
import {
  type ElectrodeType,
  ELECTRODE_LABELS,
  drawEFieldGrid,
  drawElectrodes,
  drawEquipotentialContour,
  drawLabGrid,
  drawProbe,
  fieldAt,
  CANVAS_H,
  CANVAS_W,
  TANK_COLS,
  TANK_PAD,
  TANK_ROWS,
  chainNearestPoints,
  normToMm,
  potential,
  attachPointToPaths,
  sampleEquipotentialPaths,
  snapToEquipotential,
} from './potentialField'

type MeasureMode = 'manual' | 'match' | 'fix'
interface Point { x: number; y: number }
interface RecordedPoint extends Point { v: number; line?: number }

const W = CANVAS_W
const H = CANVAS_H
const PAD = TANK_PAD
const COLS = TANK_COLS
const ROWS = TANK_ROWS

function toCanvas(px: number, py: number) {
  return { cx: PAD + px * (W - 2 * PAD), cy: PAD + py * (H - 2 * PAD) }
}

export function EquipotentialSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [measureMode, setMeasureMode] = useState<MeasureMode>('match')
  const [electrode, setElectrode] = useState<ElectrodeType>('parallel')
  const [voltage, setVoltage] = useState(5)
  const [fixed, setFixed] = useState<Point>({ x: 0.35, y: 0.5 })
  const [mobile, setMobile] = useState<Point>({ x: 0.55, y: 0.35 })
  const [dragging, setDragging] = useState<'fixed' | 'mobile' | null>(null)
  const [recorded, setRecorded] = useState<RecordedPoint[]>([])
  const [showField, setShowField] = useState(true)
  const [showGuide, setShowGuide] = useState(true)
  const [guidedStep, setGuidedStep] = useState(0)
  const [flash, setFlash] = useState(false)
  const [fixSpacingMm, setFixSpacingMm] = useState(12)
  const [lineCount, setLineCount] = useState(0)

  const vFixed = potential(electrode, fixed.x, fixed.y, voltage)
  const vMobile = potential(electrode, mobile.x, mobile.y, voltage)
  const deltaV = vMobile - vFixed
  const isBalanced = Math.abs(deltaV) < voltage * 0.012
  const galvanometerUA = isBalanced ? 0 : (deltaV / voltage) * 50
  const field = fieldAt(electrode, mobile.x, mobile.y, voltage)
  const mobileMm = normToMm(mobile.x, mobile.y)
  const fixedMm = normToMm(fixed.x, fixed.y)

  const guidedSteps = [
    { id: 's1', label: '수조 수평·전극 연결·전원 인가', isComplete: () => true },
    { id: 's2', label: '고정 검침봉 A 위치 선정', isComplete: () => guidedStep >= 1 },
    { id: 's3', label: 'B 이동 → 검류계=0 → 좌표 기록 (10점+)', isComplete: () => recorded.length >= 10 },
    { id: 's4', label: '등전위선 완성 후 A 변경·전극 5종 반복', isComplete: () => lineCount >= 1 && recorded.length >= 10 },
  ]

  const recordPoint = useCallback(() => {
    if (!isBalanced) return
    setRecorded((prev) => [...prev, { x: mobile.x, y: mobile.y, v: vFixed }])
    setFlash(true)
    setTimeout(() => setFlash(false), 400)
    if (guidedStep < 2) setGuidedStep(2)
  }, [isBalanced, mobile, vFixed, guidedStep])

  const finishLine = useCallback(() => {
    if (recorded.length < 3) return
    setLineCount((c) => c + 1)
    setRecorded([])
    setGuidedStep(3)
  }, [recorded.length])

  const runFixScan = useCallback(() => {
    const paths = attachPointToPaths(
      sampleEquipotentialPaths(electrode, vFixed, voltage, fixSpacingMm),
      fixed,
    )
    const pts = paths.flatMap((path, line) => path.map((p) => ({ ...p, v: vFixed, line })))
    setRecorded(pts)
    if (pts.length >= 2) {
      setLineCount((c) => c + 1)
      setGuidedStep(3)
    }
  }, [electrode, voltage, vFixed, fixed, fixSpacingMm])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && measureMode !== 'fix') {
        e.preventDefault()
        recordPoint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recordPoint, measureMode])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    drawLabGrid(ctx, PAD, W, H, COLS, ROWS)

    if (showField) drawEFieldGrid(ctx, electrode, voltage, PAD, W, H)

    if (showGuide) {
      drawEquipotentialContour(ctx, electrode, vFixed, voltage, PAD, W, H, 'rgba(34,197,94,0.55)', true)
    }

    drawElectrodes(ctx, electrode, PAD, W, H, voltage)

    if (recorded.length > 0) {
      const fromScan = recorded.some((p) => p.line !== undefined)
      const branches = fromScan
        ? Object.values(
            recorded.reduce<Record<number, RecordedPoint[]>>((acc, p) => {
              const id = p.line ?? 0
              ;(acc[id] ??= []).push(p)
              return acc
            }, {}),
          )
        : chainNearestPoints(recorded, 0.07)
      branches.forEach((branch) => {
        ctx.strokeStyle = '#e85d75'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        branch.forEach((p, i) => {
          const { cx, cy } = toCanvas(p.x, p.y)
          if (i === 0) ctx.moveTo(cx, cy)
          else ctx.lineTo(cx, cy)
        })
        ctx.stroke()
      })
      recorded.forEach((p, i) => {
        const { cx, cy } = toCanvas(p.x, p.y)
        ctx.fillStyle = '#e85d75'
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px sans-serif'
        ctx.fillText(`${i + 1}`, cx - 3, cy + 3)
      })
    }

    const mc = toCanvas(mobile.x, mobile.y)
    if (isBalanced && field.E > 0.8) {
      const angle = Math.atan2(field.Ey, field.Ex)
      const len = 32
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(mc.cx, mc.cy)
      ctx.lineTo(mc.cx + Math.cos(angle) * len, mc.cy + Math.sin(angle) * len)
      ctx.stroke()
      ctx.fillStyle = 'rgba(34,197,94,0.25)'
      ctx.beginPath()
      ctx.arc(mc.cx, mc.cy, 18, 0, Math.PI * 2)
      ctx.fill()
    }

    const fc = toCanvas(fixed.x, fixed.y)
    drawProbe(ctx, fc.cx, fc.cy, 'A', '#ef4444', true)
    drawProbe(ctx, mc.cx, mc.cy, 'B', '#3b82f6', false)

    if (flash) {
      ctx.fillStyle = 'rgba(74,222,128,0.25)'
      ctx.fillRect(PAD, PAD, W - 2 * PAD, H - 2 * PAD)
    }

    // 검침봉 → SSI 기기 연결선
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(fc.cx, fc.cy - 32)
    ctx.lineTo(fc.cx, PAD - 6)
    ctx.moveTo(mc.cx, mc.cy - 16)
    ctx.lineTo(mc.cx + 40, PAD - 6)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#e2e8f0'
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.fillRect(PAD, 4, W - 2 * PAD, 18)
    ctx.strokeRect(PAD, 4, W - 2 * PAD, 18)
    ctx.fillStyle = '#475569'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText('SSI Equipotential Line — 고정봉 A · 이동봉 B → 검류계', PAD + 8, 16)
  }, [electrode, voltage, fixed, mobile, recorded, showField, showGuide, vFixed, field, isBalanced, flash])

  useEffect(() => { draw() }, [draw])

  const getProbe = (cx: number, cy: number, displayW: number) => {
    const fc = toCanvas(fixed.x, fixed.y)
    const mc = toCanvas(mobile.x, mobile.y)
    // Keep a ~44px touch target after the canvas is scaled down to the screen width.
    const hitR = Math.max(26, (44 / Math.max(displayW, 1)) * W)
    if (Math.hypot(cx - fc.cx, cy - fc.cy) < hitR) return 'fixed' as const
    if (Math.hypot(cx - mc.cx, cy - mc.cy) < hitR) return 'mobile' as const
    return null
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const cx = ((e.clientX - rect.left) / rect.width) * W
    const cy = ((e.clientY - rect.top) / rect.height) * H
    const probe = getProbe(cx, cy, rect.width)
    if (probe) {
      setDragging(probe)
      if (probe === 'fixed' && guidedStep < 1) setGuidedStep(1)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const cx = ((e.clientX - rect.left) / rect.width) * W
    const cy = ((e.clientY - rect.top) / rect.height) * H
    const p = {
      x: Math.max(0.06, Math.min(0.94, (cx - PAD) / (W - 2 * PAD))),
      y: Math.max(0.06, Math.min(0.94, (cy - PAD) / (H - 2 * PAD))),
    }
    if (dragging === 'fixed') {
      setFixed(p)
      setRecorded([])
    } else {
      setMobile(p)
    }
  }

  const onPointerUp = () => {
    if (dragging === 'mobile' && measureMode === 'match') {
      const snapped = snapToEquipotential(electrode, vFixed, mobile, voltage)
      setMobile(snapped)
    }
    setDragging(null)
  }

  const sheetRows = recorded.map((p) => {
    const mm = normToMm(p.x, p.y)
    return { x: mm.xMm, y: mm.yMm, v: p.v }
  })

  const liveControls = (
    <div className="space-y-3">
      <SimHint>
        {measureMode === 'manual' && 'B 검침봉을 드래그해 검류계=0인 점을 직접 찾으세요.'}
        {measureMode === 'match' && 'B를 놓으면 같은 전위(녹색 점선)에 자동 맞춤됩니다.'}
        {measureMode === 'fix' && '고정봉 A를 지나는 등전위선만 찾습니다. A를 옮긴 뒤 다시 스캔하세요.'}
      </SimHint>
      {measureMode === 'fix' ? (
        <>
          <SimSlider label="기록 점 간격" value={fixSpacingMm} min={8} max={20} step={1} unit=" mm" onChange={setFixSpacingMm} />
          <button type="button" onClick={runFixScan} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white touch-manipulation">
            A를 지나는 등전위선 자동 스캔 ({vFixed.toFixed(2)} V)
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={recordPoint} disabled={!isBalanced} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white disabled:opacity-40 touch-manipulation">
            {isBalanced ? '✓ 좌표 기록 (Space)' : `검류계 조절 중… ${galvanometerUA.toFixed(1)}μA`}
          </button>
          {recorded.length >= 3 && (
            <button type="button" onClick={finishLine} className="w-full rounded-lg border border-[var(--color-accent)] py-2.5 text-sm text-[var(--color-accent)] touch-manipulation">
              등전위선 {lineCount + 1}개 완성 → A 변경
            </button>
          )}
        </>
      )}
    </div>
  )

  const setupControls = (
    <div className="space-y-3">
      <SimModeTabs
        modes={[
          { id: 'manual' as const, label: 'Manual' },
          { id: 'match' as const, label: 'Match' },
          { id: 'fix' as const, label: 'Fix' },
        ]}
        value={measureMode}
        onChange={setMeasureMode}
      />
      <SimSelect
        label="전극 5종"
        value={electrode}
        options={(Object.keys(ELECTRODE_LABELS) as ElectrodeType[]).map((k) => ({
          value: k,
          label: ELECTRODE_LABELS[k],
        }))}
        onChange={(v) => { setElectrode(v); setRecorded([]); setLineCount(0) }}
      />
      <SimSlider label="전원 전압" value={voltage} min={1} max={10} step={0.5} unit=" V" onChange={setVoltage} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showGuide} onChange={(e) => setShowGuide(e.target.checked)} className="accent-[var(--color-accent)]" />
        현재 등전위선 가이드 (녹색)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showField} onChange={(e) => setShowField(e.target.checked)} className="accent-[var(--color-accent)]" />
        전기장 화살표 표시
      </label>
    </div>
  )

  return (
    <SimShell
      title="등전위선 실험 — SSI Equipotential Line"
      description="고정 검침봉 A · 이동 검침봉 B. 검류계=0일 때 (x,y)를 기록해 등전위선을 그립니다."
      hint="A를 드래그해 기준점 변경. B를 드래그해 0점 탐색. Match 모드 권장."
    >
      <SimWorkbench
        figureRef="Fig.3"
        steps={guidedSteps}
        currentStep={guidedStep}
        onStepChange={setGuidedStep}
        bench={
          <div className="space-y-2">
            <SimCanvas label="SSI 수조 400×270mm — 전극·검침봉">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="block h-auto w-full max-w-full touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </SimCanvas>
            <SimApparatusCaption structure="아크릴 수조 안 전극 → 물(전해질) → 고정 검침봉 A(빨강)와 이동 검침봉 B(파랑)를 SSI 기기에 연결. B를 움직여 검류계=0이면 A와 같은 전위.">
              <span>기준 전위 V(A) = {vFixed.toFixed(2)} V</span>
              <span>전극: {ELECTRODE_LABELS[electrode]}</span>
              <span>ΔV = {deltaV.toFixed(3)} V</span>
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <LabPanel title="SSI Equipotential Line V1.0">
            <GalvanometerGauge value={galvanometerUA} maxValue={50} balanced={isBalanced} />
            <p className="mb-2 text-center text-[10px] text-slate-500">
              검류계 = 0 → 고정봉 A와 이동봉 B가 같은 전위
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <DigitalDisplay
                label="이동봉 B — x좌표"
                description="수조 가로 위치"
                value={String(mobileMm.xMm)}
                unit="mm"
              />
              <DigitalDisplay
                label="이동봉 B — y좌표"
                description="수조 세로 위치"
                value={String(mobileMm.yMm)}
                unit="mm"
              />
              <DigitalDisplay
                label="고정봉 A 전위"
                description="이번 등전위선 기준값"
                value={vFixed.toFixed(2)}
                unit="V"
                size="sm"
              />
              <DigitalDisplay
                label="A−B 전위차 ΔV"
                description="0이면 검류계 평형"
                value={deltaV.toFixed(3)}
                unit="V"
                size="sm"
              />
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 px-2 py-2 text-[10px] leading-relaxed text-slate-600">
              <p><strong className="text-red-600">A (고정)</strong>: ({fixedMm.xMm}, {fixedMm.yMm}) mm — 기준점</p>
              <p className="mt-0.5"><strong className="text-blue-600">B (이동)</strong>: ({mobileMm.xMm}, {mobileMm.yMm}) mm — 탐색점</p>
            </div>
          </LabPanel>
        }
        liveControls={liveControls}
        setupControls={setupControls}
        dataSheet={
          <LabDataSheet
            title={`등전위선 ${lineCount + 1} — 점 기록표`}
            columns={[
              { key: 'x', label: 'B x좌표', unit: 'mm' },
              { key: 'y', label: 'B y좌표', unit: 'mm' },
              { key: 'v', label: '등전위 전위', unit: 'V', decimals: 3 },
            ]}
            rows={sheetRows}
            onDeleteRow={(i) => setRecorded((r) => r.filter((_, j) => j !== i))}
          />
        }
      />
      <div className="mt-4">
        <SimReadout items={[
          { label: '측정 모드', value: measureMode.toUpperCase() },
          { label: '이번 등전위선', value: `${recorded.length}/10+점`, highlight: recorded.length >= 10 },
          { label: '완성한 등전위선', value: `${lineCount}개` },
          { label: '검류계 전류', value: isBalanced ? '0 μA (평형)' : `${galvanometerUA.toFixed(1)} μA`, highlight: isBalanced },
          { label: 'B 위치 전기장', value: `${field.E.toFixed(1)} V/m` },
        ]} />
      </div>
    </SimShell>
  )
}
