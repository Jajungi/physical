import { useEffect, useRef, useState } from 'react'
import { LabDataSheet } from './LabDataSheet'
import {
  GalvanometerGauge,
  LabPanel,
  OscilloscopeScreen,
  SimCanvas,
  SimModeTabs,
  SimReadout,
  SimShell,
  SimSlider,
} from './SimShell'
import { SimWorkbench } from './SimWorkbench'
import { SimHint } from './SimHint'
import { SimApparatusCaption } from './SimApparatusCaption'
import { prepareCanvas } from './simCanvasHelpers'

function drawResistor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string) {
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + (w / 6) * (i + 0.5), y + (i % 2 === 0 ? -8 : 8))
    ctx.lineTo(x + (w / 6) * (i + 1), y)
  }
  ctx.stroke()
  ctx.fillStyle = '#1e293b'
  ctx.font = '11px sans-serif'
  ctx.fillText(label, x + w / 2 - 10, y - 14)
}

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 15, y - 12)
  ctx.lineTo(x - 15, y + 12)
  ctx.moveTo(x + 15, y - 6)
  ctx.lineTo(x + 15, y + 6)
  ctx.stroke()
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('+', x + 10, y - 10)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText('−', x - 20, y - 10)
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.fillText(label, x - 10, y + 28)
}

function drawCapacitor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 12)
  ctx.lineTo(x - 8, y + 12)
  ctx.moveTo(x + 8, y - 12)
  ctx.lineTo(x + 8, y + 12)
  ctx.stroke()
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText('C', x - 4, y + 24)
}

const VS_PRESETS = [0, 5 / 12 * 5, 10 / 12 * 5, 15 / 12 * 5, 20 / 12 * 5, 5].map((v) => Math.round(v * 100) / 100)

type CircuitType = 'single' | 'series' | 'parallel' | 'complex'

export function OhmRCSim() {
  const [mode, setMode] = useState<'ohm' | 'charge' | 'discharge'>('ohm')
  const [circuitType, setCircuitType] = useState<CircuitType>('single')
  const [V, setV] = useState(5)
  const [R, setR] = useState(220)
  const [R2, setR2] = useState(100)
  const [C, setC] = useState(470)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [viPoints, setViPoints] = useState<{ v: number; i: number }[]>([])
  const [rcLog, setRcLog] = useState<{ r: number; c: number; tauMeas: number; tauTheory: number }[]>([])
  const [guidedStep, setGuidedStep] = useState(0)
  const circuitRef = useRef<HTMLCanvasElement>(null)
  const scopeRef = useRef<HTMLCanvasElement>(null)
  const viRef = useRef<HTMLCanvasElement>(null)

  const Req =
    circuitType === 'single'
      ? R
      : circuitType === 'series'
        ? R + R2
        : circuitType === 'parallel'
          ? (R * R2) / (R + R2)
          : R + (R * R2) / (R + R2)
  const I = V / Req
  const tau = Req * (C * 1e-6)
  const vCharge = V * (1 - Math.exp(-t / tau))
  const vDischarge = V * Math.exp(-t / tau)
  const vNow = mode === 'charge' ? vCharge : mode === 'discharge' ? vDischarge : V

  // Circuit diagram
  useEffect(() => {
    const canvas = circuitRef.current
    if (!canvas) return
    const W = 360
    const H = 200
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    const left = 55
    const top = 42
    const right = 305
    const bottom = 158
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2

    if (mode === 'ohm') {
      // 직사각형 회로 — 상단 저항, 하단 전원
      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.lineTo(left, bottom)
      ctx.closePath()
      ctx.stroke()

      if (circuitType === 'single') {
        drawResistor(ctx, 145, top - 1, 70, `R=${R}Ω`)
      } else if (circuitType === 'series') {
        drawResistor(ctx, 95, top - 1, 60, `R₁=${R}Ω`)
        drawResistor(ctx, 205, top - 1, 60, `R₂=${R2}Ω`)
      } else if (circuitType === 'parallel') {
        drawResistor(ctx, 120, top + 28, 50, `R₁=${R}Ω`)
        ctx.beginPath()
        ctx.moveTo(120, top)
        ctx.lineTo(120, top + 28)
        ctx.moveTo(170, top + 28)
        ctx.lineTo(170, top)
        ctx.stroke()
        drawResistor(ctx, 220, top + 28, 50, `R₂=${R2}Ω`)
        ctx.beginPath()
        ctx.moveTo(220, top)
        ctx.lineTo(220, top + 28)
        ctx.moveTo(270, top + 28)
        ctx.lineTo(270, top)
        ctx.stroke()
      } else {
        drawResistor(ctx, 100, top - 1, 50, `R₁=${R}Ω`)
        drawResistor(ctx, 210, top - 1, 50, `R₂=${R2}Ω`)
        drawResistor(ctx, 155, top + 35, 50, `R₃`)
        ctx.beginPath()
        ctx.moveTo(155, top)
        ctx.lineTo(155, top + 35)
        ctx.moveTo(205, top + 35)
        ctx.lineTo(205, bottom)
        ctx.stroke()
      }

      drawBattery(ctx, (left + right) / 2, bottom, `ε=${V}V`)

      // 전류 방향 (시계)
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText('→', right - 18, (top + bottom) / 2 + 5)

      // 전압계·전류계 (실험대 배치)
      ctx.fillStyle = '#0a1a0a'
      ctx.fillRect(8, 8, 72, 30)
      ctx.fillRect(W - 80, 8, 72, 30)
      ctx.fillStyle = '#33ff33'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`${V.toFixed(1)}V`, 18, 28)
      ctx.fillText(`${(I * 1000).toFixed(1)}mA`, W - 68, 28)
      ctx.fillStyle = '#64748b'
      ctx.font = '8px sans-serif'
      ctx.fillText('V (병렬)', 12, 6)
      ctx.fillText('A (직렬)', W - 72, 6)
    } else {
      // RC 직렬: 좌 전원 — 상단 R — 우측 C
      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.lineTo(left, bottom)
      ctx.closePath()
      ctx.stroke()
      drawResistor(ctx, 130, top - 1, 100, `R=${Req.toFixed(0)}Ω`)
      drawCapacitor(ctx, right, (top + bottom) / 2)
      drawBattery(ctx, left, (top + bottom) / 2, `ε=${V}V`)

      ctx.fillStyle = '#64748b'
      ctx.font = '9px sans-serif'
      ctx.fillText('직렬 RC', left + 8, top - 8)
      ctx.fillText(`C=${C}μF`, right + 14, bottom - 8)
    }
  }, [V, R, R2, Req, I, mode, circuitType, C])

  // Oscilloscope
  useEffect(() => {
    const canvas = scopeRef.current
    if (!canvas || mode === 'ohm') return
    const W = 360
    const H = 140
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(0, 0, W, H)

    // grid
    ctx.strokeStyle = '#1a3a1a'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo(i * (W / 10), 0)
      ctx.lineTo(i * (W / 10), H)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * (H / 10))
      ctx.lineTo(W, i * (H / 10))
      ctx.stroke()
    }

    const maxT = tau * 3
    ctx.strokeStyle = '#33ff33'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const ti = (i / 200) * maxT
      const vi = mode === 'charge' ? V * (1 - Math.exp(-ti / tau)) : V * Math.exp(-ti / tau)
      const x = (i / 200) * W
      const y = H - 10 - (vi / V) * (H - 20)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // 63/37 line
    const markV = mode === 'charge' ? V * 0.632 : V * 0.368
    const markY = H - 10 - (markV / V) * (H - 20)
    ctx.strokeStyle = '#ffaa00'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, markY)
    ctx.lineTo(W, markY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#ffaa00'
    ctx.font = '9px monospace'
    ctx.fillText(mode === 'charge' ? '63.2%' : '36.8%', W - 40, markY - 4)

    // cursor
    const tx = (t / maxT) * W
    const ty = H - 10 - (vNow / V) * (H - 20)
    ctx.fillStyle = '#ffff00'
    ctx.beginPath()
    ctx.arc(Math.min(tx, W), ty, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#33ff33'
    ctx.font = '10px monospace'
    ctx.fillText(`V(t)=${vNow.toFixed(2)}V`, 8, 14)
    ctx.fillText(`t=${(t * 1000).toFixed(0)}ms`, 8, 28)
  }, [mode, V, R, C, t, tau, vNow])

  // V-I graph
  useEffect(() => {
    const canvas = viRef.current
    if (!canvas || mode !== 'ohm') return
    const W = 300
    const H = 200
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, H - 30)
    ctx.lineTo(W - 10, H - 30)
    ctx.moveTo(40, 10)
    ctx.lineTo(40, H - 30)
    ctx.stroke()
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.fillText('V (V)', W / 2, H - 5)
    ctx.save()
    ctx.translate(12, H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('I (mA)', 0, 0)
    ctx.restore()

    const iMax = (5 / Req) * 1000
    ctx.strokeStyle = '#e85d75'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, H - 30)
    ctx.lineTo(40 + (W - 60), H - 30 - (iMax / iMax) * (H - 50))
    ctx.stroke()
    viPoints.forEach((p) => {
      const x = 40 + (p.v / 5) * (W - 60)
      const y = H - 30 - ((p.i * 1000) / iMax) * (H - 50)
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [mode, viPoints, Req])

  useEffect(() => {
    if (!playing || mode === 'ohm') return
    const id = setInterval(() => setT((prev) => Math.min(prev + tau / 40, tau * 3)), 40)
    return () => clearInterval(id)
  }, [playing, mode, tau])

  const recordTau = () => {
    setRcLog((prev) => [
      ...prev,
      { r: Req, c: C, tauMeas: t, tauTheory: tau },
    ])
  }

  const guidedSteps = [
    { id: 'a1', label: 'Part A: Vs 변화하며 V-I 측정', isComplete: () => viPoints.length >= 3 },
    { id: 'a2', label: '직렬/병렬/복합 Req 비교', isComplete: () => viPoints.length >= 5 },
    { id: 'b1', label: 'Part B: RC 충·방전 곡선', isComplete: () => mode !== 'ohm' },
    { id: 'b2', label: 'τ = RC 검증 (63%/37%)', isComplete: () => rcLog.length >= 1 },
  ]

  const ohmLiveControls = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {VS_PRESETS.map((vs) => (
          <button key={vs} type="button" onClick={() => setV(vs)} className={`rounded px-2 py-1.5 text-xs touch-manipulation ${V === vs ? 'bg-[var(--color-accent)] text-white' : 'bg-white ring-1 ring-slate-200'}`}>
            {vs}V
          </button>
        ))}
      </div>
      <SimSlider label="전원 Vs" value={V} min={0} max={12} step={0.1} unit=" V" onChange={setV} />
      <SimSlider label="저항 R₁" value={R} min={50} max={500} step={10} unit=" Ω" onChange={setR} />
      {circuitType !== 'single' && (
        <SimSlider label="저항 R₂" value={R2} min={50} max={500} step={10} unit=" Ω" onChange={setR2} />
      )}
      {mode !== 'ohm' && (
        <>
          <SimSlider label="콘덴서 C" value={C} min={100} max={1000} step={50} unit=" μF" onChange={setC} />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setT(0); setPlaying((p) => !p) }} className="flex-1 rounded-lg bg-green-700 py-2.5 text-sm text-white touch-manipulation">
              {playing ? 'STOP' : 'RUN'}
            </button>
            <button type="button" onClick={recordTau} className="rounded-lg border border-[var(--color-accent)] px-3 py-2.5 text-sm text-[var(--color-accent)] touch-manipulation">
              τ 기록
            </button>
          </div>
        </>
      )}
      {mode === 'ohm' && (
        <button type="button" onClick={() => setViPoints((p) => [...p, { v: V, i: I }])} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white touch-manipulation">
          (V, I) 점 기록
        </button>
      )}
    </div>
  )

  const ohmSetupControls = (
    <div className="space-y-3">
      <SimHint>
        {mode === 'ohm'
          ? 'Part A: Vs를 5/12V 간격으로 바꾸며 (V,I)를 기록 → V-I 그래프 기울기 = Req'
          : 'Part B: RUN으로 V-t 곡선 재생. 63%/37% 시점에서 τ 기록 → τ=RC 검증'}
      </SimHint>
      {mode === 'ohm' && (
        <SimModeTabs
          modes={[
            { id: 'single' as const, label: '단일' },
            { id: 'series' as const, label: '직렬' },
            { id: 'parallel' as const, label: '병렬' },
            { id: 'complex' as const, label: '복합' },
          ]}
          value={circuitType}
          onChange={setCircuitType}
        />
      )}
    </div>
  )

  return (
    <SimShell
      title="옴의 법칙 & 직류 RC 회로"
      description="Part A: V-I·직렬/병렬/복합. Part B: Logger Pro RC 충·방전, τ=RC."
      hint="Vs 5/12V 간격. τ 시점 = 63%(충전)·37%(방전)."
    >
      <SimModeTabs
        modes={[
          { id: 'ohm' as const, label: 'Part A' },
          { id: 'charge' as const, label: 'Part B 충전' },
          { id: 'discharge' as const, label: 'Part B 방전' },
        ]}
        value={mode}
        onChange={(m) => { setMode(m); setT(0); setPlaying(false) }}
      />
      <SimWorkbench
        figureRef="Fig.1"
        steps={guidedSteps}
        currentStep={guidedStep}
        onStepChange={setGuidedStep}
        bench={
          <div className="space-y-2">
            <div className="grid gap-4 lg:grid-cols-2">
              <SimCanvas label="회로도">
                <canvas ref={circuitRef} width={360} height={200} className="w-full" />
              </SimCanvas>
              {mode === 'ohm' ? (
                <SimCanvas label="V-I 그래프">
                  <canvas ref={viRef} width={300} height={200} className="w-full" />
                </SimCanvas>
              ) : (
                <OscilloscopeScreen label="LabQuest2 V-t">
                  <canvas ref={scopeRef} width={360} height={140} className="w-full" />
                </OscilloscopeScreen>
              )}
            </div>
            <SimApparatusCaption
              structure={
                mode === 'ohm'
                  ? '전원 ε — 직렬·병렬 저항 — 전압계(병렬)·전류계(직렬). Part A에서 Vs를 바꿔 (V,I) 기록.'
                  : '직렬 RC: 충전·방전 시 콘덴서 양단 전압 V(t)를 LabQuest2로 기록. τ=RC.'
              }
            >
              <span>Req = {Req.toFixed(0)} Ω</span>
              <span>I = {(I * 1000).toFixed(2)} mA</span>
              {mode !== 'ohm' && <span>τ = {tau.toFixed(4)} s</span>}
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="rounded bg-[#0a1a0a] p-2 font-mono text-[#33ff33]">V = {V.toFixed(2)}</div>
            <div className="rounded bg-[#0a1a0a] p-2 font-mono text-[#33ff33]">I = {(I * 1000).toFixed(2)} mA</div>
          </div>
        }
        liveControls={ohmLiveControls}
        setupControls={ohmSetupControls}
        dataSheet={
          <LabDataSheet
            title={mode === 'ohm' ? 'V-I 측정표' : 'τ 측정표'}
            columns={
              mode === 'ohm'
                ? [
                    { key: 'v', label: 'V', unit: 'V' },
                    { key: 'i', label: 'I', unit: 'A', decimals: 4 },
                  ]
                : [
                    { key: 'r', label: 'R', unit: 'Ω' },
                    { key: 'c', label: 'C', unit: 'μF' },
                    { key: 'tauMeas', label: 'τ측정', unit: 's', decimals: 4 },
                    { key: 'tauTheory', label: 'τ=RC', unit: 's', decimals: 4 },
                  ]
            }
            rows={mode === 'ohm' ? viPoints.map((p) => ({ v: p.v, i: p.i })) : rcLog}
            onDeleteRow={(i) => {
              if (mode === 'ohm') setViPoints((p) => p.filter((_, j) => j !== i))
              else setRcLog((p) => p.filter((_, j) => j !== i))
            }}
            onClearAll={() => {
              if (mode === 'ohm') setViPoints([])
              else setRcLog([])
            }}
            calcMapping={
              mode === 'ohm'
                ? { 'ohms-law': { V: 'v', I: 'i' } }
                : { 'rc-tau': { R: 'r', C: 'c' } }
            }
          />
        }
      />
      <div className="mt-4">
        <SimReadout
          items={
            mode === 'ohm'
              ? [
                  { label: 'Req', value: `${Req.toFixed(1)} Ω` },
                  { label: 'I = V/Req', value: `${(I * 1000).toFixed(2)} mA` },
                  { label: '기록', value: `${viPoints.length}점` },
                ]
              : [
                  { label: 'τ = RC', value: `${(tau * 1000).toFixed(1)} ms` },
                  { label: 'V(t)', value: `${vNow.toFixed(3)} V` },
                  { label: 'τ 시점', value: mode === 'charge' ? '63.2%' : '36.8%', highlight: Math.abs(t - tau) < tau * 0.08 },
                ]
          }
        />
      </div>
    </SimShell>
  )
}

export function WheatstoneSim() {
  const [part, setPart] = useState<'rx' | 'rho'>('rx')
  const [l1, setL1] = useState(5)
  const [Rk, setRk] = useState(1000)
  const [RxActual, setRxActual] = useState(1000)
  const [galvOn, setGalvOn] = useState(true)
  const [wireL, setWireL] = useState(1)
  const [wireA, setWireA] = useState(1e-6)
  const [wireR, setWireR] = useState(0.02)
  const [balanceLog, setBalanceLog] = useState<{ l1: number; l2: number; rx: number; Rk: number }[]>([])
  const [guidedStep, setGuidedStep] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const lTotal = 10
  const l2Actual = lTotal - l1
  const RxMeasured = (l2Actual / l1) * Rk
  const balanceL1 = 10 / (1 + RxActual / Rk)
  const sensitivity = 1 - Math.abs(l1 - lTotal / 2) / (lTotal / 2)
  const balanced = Math.abs(RxMeasured - RxActual) / RxActual < 0.02
  const galvanometerUA = !galvOn ? 0 : balanced ? 0 : ((RxMeasured - RxActual) / RxActual) * 20 * (1.5 - sensitivity)
  const rho = wireR * wireA / wireL
  const isCu = Math.abs(rho - 1.68e-8) < 5e-9
  const isFe = Math.abs(rho - 1.0e-7) < 2e-8

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = 400
    const H = 280
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    const cx = W / 2
    const cy = H / 2 - 20
    const s = 75
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2

    drawBattery(ctx, cx, 28, 'Vs=2V')
    ctx.beginPath()
    ctx.moveTo(cx, 46)
    ctx.lineTo(cx, cy - s)
    ctx.stroke()

    const pts = [
      { x: cx, y: cy - s, label: 'Rk', val: `${Rk}Ω` },
      { x: cx + s, y: cy, label: 'Rx', val: '?' },
      { x: cx, y: cy + s, label: 'Rv₁', val: `l₁=${l1.toFixed(1)}cm` },
      { x: cx - s, y: cy, label: 'Rv₂', val: `l₂=${l2Actual.toFixed(1)}cm` },
    ]
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    pts.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.closePath()
    ctx.stroke()

    pts.forEach((p) => {
      drawResistor(ctx, p.x - 22, p.y - 4, 44, p.label)
      ctx.fillStyle = '#64748b'
      ctx.font = '9px sans-serif'
      ctx.fillText(p.val, p.x - 24, p.y + 22)
    })

    // 검류계 (다이아몬드 중심)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(cx - 26, cy - 16, 52, 32)
    ctx.fillStyle = galvOn ? (balanced ? '#33ff33' : '#ff3333') : '#666'
    ctx.font = 'bold 11px monospace'
    ctx.fillText(balanced ? '0.00' : galvanometerUA.toFixed(2), cx - 20, cy + 5)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '8px sans-serif'
    ctx.fillText('μA', cx + 16, cy + 5)
    ctx.fillText('G', cx - 4, cy - 22)

    // 습동선 10cm — Rv₁(하단)↔Rv₂(좌측) 연결
    const wireY = H - 48
    const wireL = 60
    const wireR = W - 60
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(wireL, wireY)
    ctx.lineTo(wireR, wireY)
    ctx.stroke()

    const sliderX = wireL + (l1 / lTotal) * (wireR - wireL)
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(pts[2].x, pts[2].y + 4)
    ctx.lineTo(wireL, wireY)
    ctx.moveTo(pts[3].x, pts[3].y)
    ctx.lineTo(wireR, wireY)
    ctx.moveTo(cx, cy + 16)
    ctx.lineTo(sliderX, wireY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#e85d75'
    ctx.fillRect(sliderX - 7, wireY - 14, 14, 28)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px sans-serif'
    ctx.fillText('⇔', sliderX - 5, wireY + 4)

    ctx.fillStyle = '#64748b'
    ctx.font = '9px sans-serif'
    ctx.fillText('0', wireL - 8, wireY + 18)
    ctx.fillText('10cm', wireR - 14, wireY + 18)

    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(50, H - 88, 84, 28)
    ctx.fillRect(W - 134, H - 88, 84, 28)
    ctx.fillStyle = '#33ff33'
    ctx.font = '10px monospace'
    ctx.fillText(`V₁=${((l1 / lTotal) * 2).toFixed(1)}V`, 58, H - 70)
    ctx.fillText(`V₂=${((l2Actual / lTotal) * 2).toFixed(1)}V`, W - 126, H - 70)
  }, [l1, l2Actual, Rk, balanced, galvanometerUA, galvOn])

  const recordBalance = () => {
    if (!balanced) return
    setBalanceLog((prev) => [...prev, { l1, l2: l2Actual, rx: RxMeasured, Rk }])
    if (guidedStep < 2) setGuidedStep(2)
  }

  const findBalance = () => {
    setL1(Math.round(balanceL1 * 10) / 10)
    if (guidedStep < 1) setGuidedStep(1)
  }

  const wheatSteps = [
    { id: 'w1', label: '전원 2V · Rk·Rx 설정', isComplete: () => true },
    { id: 'w2', label: '습동접촉 조절 → 검류계=0', isComplete: () => balanced },
    { id: 'w3', label: '평형 기록 → Rx=(l₂/l₁)Rk', isComplete: () => balanceLog.length >= 1 },
  ]

  const wheatLiveControls = (
    <div className="space-y-3">
      {part === 'rx' ? (
        <>
          <SimSlider label="습동접촉 l₁" value={l1} min={1} max={9} step={0.1} unit=" cm" onChange={setL1} />
          <button type="button" onClick={findBalance} className="w-full rounded-lg border border-[var(--color-accent)] py-2.5 text-sm text-[var(--color-accent)] touch-manipulation">
            평형점 자동 찾기 (l₁≈{balanceL1.toFixed(1)}cm)
          </button>
          <button type="button" onClick={recordBalance} disabled={!balanced} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white disabled:opacity-40 touch-manipulation">
            평형 기록
          </button>
        </>
      ) : (
        <>
          <SimSlider label="와이어 길이 L" value={wireL} min={0.5} max={2} step={0.1} unit=" m" onChange={setWireL} />
          <SimSlider label="단면적 A" value={wireA * 1e6} min={0.1} max={5} step={0.1} unit=" mm²" onChange={(v) => setWireA(v * 1e-6)} />
          <SimSlider label="저항 R" value={wireR * 1000} min={1} max={100} step={1} unit=" mΩ" onChange={(v) => setWireR(v / 1000)} />
        </>
      )}
    </div>
  )

  const wheatSetupControls = (
    <div className="space-y-3">
      <SimHint>
        {part === 'rx'
          ? '습동접촉을 움직여 검류계=0이 되면 평형. Rk는 중앙(5cm) 근처에서 민감도가 최대입니다.'
          : '와이어 R, L, A를 바꿔 ρ=RA/L 계산 → Cu·Fe 이론값과 비교'}
      </SimHint>
      <SimModeTabs
        modes={[
          { id: 'rx' as const, label: 'Part A — Rx' },
          { id: 'rho' as const, label: 'Part B — 비저항' },
        ]}
        value={part}
        onChange={setPart}
      />
      {part === 'rx' && (
        <>
          <SimSlider label="비교저항 Rk" value={Rk} min={100} max={5000} step={100} unit=" Ω" onChange={setRk} />
          <SimSlider label="실제 Rx (시료)" value={RxActual} min={100} max={5000} step={100} unit=" Ω" onChange={setRxActual} />
        </>
      )}
    </div>
  )

  return (
    <SimShell
      title="휘트스톤 브리지"
      description="Part A: Rx=(l₂/l₁)Rk. Part B: ρ=RA/L로 재질 판별."
      hint="Rk 중앙 근처에서 민감도 최대."
    >
      <SimWorkbench
        figureRef="Fig.2"
        steps={wheatSteps}
        currentStep={guidedStep}
        onStepChange={setGuidedStep}
        bench={
          <div className="space-y-2">
            <SimCanvas label="휘트스톤 브리지 + 습동선 10cm">
              <canvas ref={canvasRef} width={400} height={280} className="w-full touch-none" />
            </SimCanvas>
            <SimApparatusCaption structure="전원 2V — 다이아몬드 브리지(Rk, Rx, Rv₁, Rv₂) — 하단 습동선 10cm. 검류계 G=0일 때 Rx=(l₂/l₁)Rk.">
              <span>l₁={l1.toFixed(1)} cm</span>
              <span>l₂={l2Actual.toFixed(1)} cm</span>
              <span>Rx 측정 = {RxMeasured.toFixed(0)} Ω</span>
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <LabPanel title="검류계 G">
            <GalvanometerGauge value={galvanometerUA} maxValue={20} balanced={balanced && galvOn} />
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={galvOn} onChange={(e) => setGalvOn(e.target.checked)} />
              G ON
            </label>
            <p className="mt-2 text-xs text-slate-400">민감도: {(sensitivity * 100).toFixed(0)}%</p>
          </LabPanel>
        }
        liveControls={wheatLiveControls}
        setupControls={wheatSetupControls}
        dataSheet={
          part === 'rx' ? (
            <LabDataSheet
              title="평형 측정 기록"
              columns={[
                { key: 'l1', label: 'l₁', unit: 'cm' },
                { key: 'l2', label: 'l₂', unit: 'cm' },
                { key: 'rx', label: 'Rx', unit: 'Ω' },
              ]}
              rows={balanceLog}
              onDeleteRow={(i) => setBalanceLog((p) => p.filter((_, j) => j !== i))}
              onClearAll={() => setBalanceLog([])}
              calcMapping={{ 'wheatstone-rx': { l1: 'l1', l2: 'l2', Rk: 'Rk' } }}
            />
          ) : (
            <LabDataSheet
              title="비저항 측정"
              columns={[
                { key: 'R', label: 'R', unit: 'Ω', decimals: 4 },
                { key: 'A', label: 'A', unit: 'mm²' },
                { key: 'L', label: 'L', unit: 'm' },
              ]}
              rows={[{ R: wireR, A: wireA * 1e6, L: wireL }]}
              calcMapping={{ resistivity: { R: 'R', A: 'A', L: 'L' } }}
              theoryValue={1.68e-8}
              theoryLabel="Cu"
            />
          )
        }
      />
      <div className="mt-4">
        <SimReadout
          items={
            part === 'rx'
              ? [
                  { label: 'Rx 측정', value: `${RxMeasured.toFixed(1)} Ω`, highlight: balanced },
                  { label: '실제 Rx', value: `${RxActual} Ω` },
                  { label: '오차', value: `${((Math.abs(RxMeasured - RxActual) / RxActual) * 100).toFixed(2)}%` },
                ]
              : [
                  { label: 'ρ', value: `${rho.toExponential(2)} Ω·m` },
                  { label: '재질', value: isCu ? 'Cu ✓' : isFe ? 'Fe ✓' : '기타', highlight: isCu || isFe },
                ]
          }
        />
      </div>
    </SimShell>
  )
}

const LC_PRESETS = [
  { label: '조합 1', L: 10, C: 1 },
  { label: '조합 2', L: 20, C: 2.2 },
  { label: '조합 3', L: 15, C: 4.7 },
  { label: '조합 4', L: 30, C: 1 },
] as const

type RlcLogRow = { f: number; vr: number; xl: number; xc: number; phi: number; z: number; L: number; C: number }

export function RLCSim() {
  const [preset, setPreset] = useState(0)
  const [f, setF] = useState(200)
  const [view, setView] = useState<'curve' | 'wave' | 'lissajous'>('curve')
  const [logByPreset, setLogByPreset] = useState<Record<number, RlcLogRow[]>>({})
  const [guidedStep, setGuidedStep] = useState(0)
  const curveRef = useRef<HTMLCanvasElement>(null)
  const waveRef = useRef<HTMLCanvasElement>(null)
  const lissRef = useRef<HTMLCanvasElement>(null)
  const circuitRef = useRef<HTMLCanvasElement>(null)

  const { L, C } = LC_PRESETS[preset]
  const log = logByPreset[preset] ?? []

  const [R] = useState(200)

  const XL = 2 * Math.PI * f * (L * 1e-3)
  const XC = 1 / (2 * Math.PI * f * (C * 1e-6))
  const Z = Math.sqrt(R ** 2 + (XL - XC) ** 2)
  const fRes = 1 / (2 * Math.PI * Math.sqrt(L * 1e-3 * C * 1e-6))
  const resonant = Math.abs(f - fRes) < fRes * 0.05
  const phi = Math.atan2(XL - XC, R)
  const VR = resonant ? 4 : (4 * R) / Z
  const Vs = 4

  useEffect(() => {
    const canvas = circuitRef.current
    if (!canvas) return
    const W = 360
    const H = 120
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)
    const left = 40
    const top = 35
    const right = 320
    const bottom = 95
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(left, top)
    ctx.lineTo(right, top)
    ctx.lineTo(right, bottom)
    ctx.lineTo(left, bottom)
    ctx.closePath()
    ctx.stroke()
    drawResistor(ctx, 70, top - 1, 55, `R=${R}Ω`)
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.fillText(`L=${L}mH`, 145, top - 8)
    ctx.strokeStyle = '#3b82f6'
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 12
      ctx.arc(x, top, 6, Math.PI, 0)
    }
    ctx.stroke()
    drawCapacitor(ctx, right, (top + bottom) / 2)
    ctx.fillStyle = '#64748b'
    ctx.fillText(`C=${C}μF`, right + 12, bottom - 4)
    drawBattery(ctx, left, (top + bottom) / 2, 'Vs=4V')
    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(200, bottom + 8, 90, 22)
    ctx.fillStyle = '#33ff33'
    ctx.font = '9px monospace'
    ctx.fillText('VR (CH1)', 210, bottom + 22)
    ctx.strokeStyle = '#f59e0b'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(125, top)
    ctx.lineTo(125, bottom + 8)
    ctx.lineTo(200, bottom + 19)
    ctx.stroke()
    ctx.setLineDash([])
  }, [L, C, R])

  useEffect(() => {
    const canvas = curveRef.current
    if (!canvas) return
    const W = 360
    const H = 160
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#1a3a1a'
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo((i * W) / 10, 0)
      ctx.lineTo((i * W) / 10, H)
      ctx.stroke()
    }
    ctx.strokeStyle = '#33ff33'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const fi = 50 + (i / 200) * 3000
      const xLi = 2 * Math.PI * fi * (L * 1e-3)
      const xCi = 1 / (2 * Math.PI * fi * (C * 1e-6))
      const zi = Math.sqrt(R ** 2 + (xLi - xCi) ** 2)
      const vr = (4 * R) / zi
      const x = (i / 200) * W
      const y = H - 10 - (vr / 4) * (H - 20)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    const fx = ((f - 50) / 3000) * W
    ctx.fillStyle = '#ffff00'
    ctx.beginPath()
    ctx.arc(fx, H - 10 - (VR / 4) * (H - 20), 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#33ff33'
    ctx.font = '9px monospace'
    ctx.fillText(`f=${f}Hz  VR=${VR.toFixed(2)}V`, 8, 14)
    const frx = ((fRes - 50) / 3000) * W
    ctx.strokeStyle = '#ffaa00'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(frx, 0)
    ctx.lineTo(frx, H)
    ctx.stroke()
    ctx.setLineDash([])
  }, [f, L, C, R, VR, fRes, view, preset])

  useEffect(() => {
    if (view !== 'wave') return
    const canvas = waveRef.current
    if (!canvas) return
    const W = 360
    const H = 140
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(0, 0, W, H)
    const omega = 2 * Math.PI * f
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i <= W; i++) {
      const t = (i / W) * 0.02
      const vs = Vs * Math.sin(omega * t)
      const y = H / 2 - vs * 12
      if (i === 0) ctx.moveTo(i, y)
      else ctx.lineTo(i, y)
    }
    ctx.stroke()
    ctx.strokeStyle = '#33ff33'
    ctx.beginPath()
    for (let i = 0; i <= W; i++) {
      const t = (i / W) * 0.02
      const vr = VR * Math.sin(omega * t - phi)
      const y = H / 2 - vr * 12
      if (i === 0) ctx.moveTo(i, y)
      else ctx.lineTo(i, y)
    }
    ctx.stroke()
    ctx.fillStyle = '#94a3b8'
    ctx.font = '9px monospace'
    ctx.fillText('파랑: Vs  초록: VR', 8, 14)
    ctx.fillText(`φ=${((phi * 180) / Math.PI).toFixed(0)}°`, 8, 28)
  }, [f, VR, Vs, phi, view, preset])

  useEffect(() => {
    if (view !== 'lissajous') return
    const canvas = lissRef.current
    if (!canvas) return
    const W = 160
    const H = 160
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#0a1a0a'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#1a3a1a'
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()
    ctx.strokeStyle = resonant ? '#4ade80' : '#ffff00'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * 2 * Math.PI
      const vs = Math.sin(t)
      const vr = Math.sin(t - phi)
      const x = W / 2 + vs * 60
      const y = H / 2 - vr * 60
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.fillStyle = '#94a3b8'
    ctx.font = '8px monospace'
    ctx.fillText(resonant ? '직선=공진' : '타원', 8, 12)
  }, [phi, resonant, view, preset])

  const recordPoint = () => {
    setLogByPreset((prev) => ({
      ...prev,
      [preset]: [
        ...(prev[preset] ?? []),
        { f, vr: VR, xl: XL, xc: XC, phi: (phi * 180) / Math.PI, z: Z, L, C },
      ],
    }))
    if (guidedStep < 1) setGuidedStep(1)
  }

  const deleteLogRow = (index: number) => {
    setLogByPreset((prev) => ({
      ...prev,
      [preset]: (prev[preset] ?? []).filter((_, j) => j !== index),
    }))
  }

  const clearLog = () => {
    setLogByPreset((prev) => ({ ...prev, [preset]: [] }))
  }

  const selectPreset = (v: string) => {
    const i = parseInt(v, 10)
    setPreset(i)
    setF(200)
  }

  const rlcSteps = [
    { id: 'r1', label: '(L,C) 조합 선택 · 200Hz 시작', isComplete: () => true },
    { id: 'r2', label: '주파수 스윕 → VR 최대점 기록', isComplete: () => log.length >= 3 },
    { id: 'r3', label: 'XY 리사주 직선 = 공진 확인', isComplete: () => resonant },
  ]

  const rlcLiveControls = (
    <div className="space-y-3">
      <SimModeTabs
        modes={[
          { id: 'curve' as const, label: 'VR-f' },
          { id: 'wave' as const, label: '파형' },
          { id: 'lissajous' as const, label: 'XY' },
        ]}
        value={view}
        onChange={setView}
      />
      <SimSlider label="주파수 f" value={f} min={50} max={3000} step={10} unit=" Hz" onChange={setF} />
      <button type="button" onClick={() => setF(Math.round(fRes))} className="w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] py-2 text-sm text-[var(--color-accent)] touch-manipulation">
        공진점 f={fRes.toFixed(0)}Hz로 이동
      </button>
      <button type="button" onClick={recordPoint} className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm text-white touch-manipulation">
        측정 기록
      </button>
    </div>
  )

  const rlcSetupControls = (
    <div className="space-y-3">
      <SimHint>
        실험 안내의 <strong>4가지 (L,C) 조합</strong>을 따릅니다. L·C 수치는 키트 예시값이며, 실험 시 멀티미터로 실측한 값을 사용하세요.
      </SimHint>
      <SimModeTabs
        modes={LC_PRESETS.map((p, i) => ({
          id: String(i),
          label: `${p.label} (L=${p.L}mH, C=${p.C}μF)`,
        }))}
        value={String(preset)}
        onChange={selectPreset}
      />
    </div>
  )

  return (
    <SimShell
      title="교류 RLC 회로"
      description="4가지 (L,C) 조합, VR-f 스윕, XY 리사주로 공진 확인."
      hint="공진 시 VR 최대, Vs·VR 동위상(직선)."
    >
      <SimWorkbench
        figureRef="Fig.7"
        steps={rlcSteps}
        currentStep={guidedStep}
        onStepChange={setGuidedStep}
        bench={
          <div className="space-y-2">
            <SimCanvas label="직렬 RLC — R 양단 VR 측정">
              <canvas ref={circuitRef} width={360} height={120} className="w-full" />
            </SimCanvas>
            <OscilloscopeScreen label={view === 'curve' ? 'VR-f' : view === 'wave' ? 'Vs·VR' : 'XY 리사주'}>
              <div className={view === 'curve' ? '' : 'hidden'}>
                <canvas ref={curveRef} width={360} height={160} className="w-full" />
              </div>
              <div className={view === 'wave' ? '' : 'hidden'}>
                <canvas ref={waveRef} width={360} height={140} className="w-full" />
              </div>
              <div className={view === 'lissajous' ? '' : 'hidden'}>
                <canvas ref={lissRef} width={160} height={160} className="mx-auto block h-auto w-full max-w-[200px]" />
              </div>
            </OscilloscopeScreen>
            <SimApparatusCaption structure="교류 전원 Vs — 직렬 R-L-C. 오실로스코프 CH1을 R 양단(VR)에 연결. f를 스윕해 VR 최대(공진)를 찾고 XY 모드로 위상 확인.">
              <span>L={L} mH · C={C} μF</span>
              <span>f₀={fRes.toFixed(0)} Hz</span>
              <span>VR={VR.toFixed(2)} V</span>
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="rounded bg-[#0a1a0a] p-2 text-[#33ff33]">VR={VR.toFixed(2)}V</div>
            <div className="rounded bg-[#0a1a0a] p-2 text-[#33ff33]">φ={((phi * 180) / Math.PI).toFixed(0)}°</div>
          </div>
        }
        liveControls={rlcLiveControls}
        setupControls={rlcSetupControls}
        dataSheet={
          <LabDataSheet
            title={`${LC_PRESETS[preset].label} 주파수 스윕 기록`}
            columns={[
              { key: 'f', label: '주파수 f', unit: 'Hz' },
              { key: 'vr', label: '저항 전압 VR', unit: 'V' },
              { key: 'phi', label: '위상 φ', unit: '°' },
            ]}
            rows={log}
            onDeleteRow={deleteLogRow}
            onClearAll={clearLog}
            calcMapping={{ resonance: { L: 'L', C: 'C' } }}
            theoryValue={fRes}
            theoryLabel="공진 f"
          />
        }
      />
      <div className="mt-4">
        <SimReadout items={[
          { label: 'XL', value: `${XL.toFixed(1)} Ω` },
          { label: 'XC', value: `${XC.toFixed(1)} Ω` },
          { label: 'Z', value: `${Z.toFixed(1)} Ω` },
          { label: '공진 f', value: `${fRes.toFixed(0)} Hz` },
          { label: '공진', value: resonant ? '✓' : '—', highlight: resonant },
        ]} />
      </div>
    </SimShell>
  )
}
