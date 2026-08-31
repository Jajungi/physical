import { useCallback, useEffect, useRef, useState } from 'react'
import { LabDataSheet } from './LabDataSheet'
import {
  SimCanvas,
  SimModeTabs,
  SimReadout,
  SimShell,
  SimSlider,
} from './SimShell'
import { SimWorkbench } from './SimWorkbench'
import { SimHint } from './SimHint'
import { drawCircularCoil, drawGaussMeterProbe, drawHelmholtzCoils, drawHysteresisApparatus, drawOpticalMount, drawOpticalRail, drawSolenoidCoils, drawTransformer, coreLabel, prepareCanvas } from './simCanvasHelpers'
import { SimApparatusCaption } from './SimApparatusCaption'

const MU0 = 4 * Math.PI * 1e-7

type FieldMode = 'circular' | 'helmholtz' | 'solenoid' | 'transformer'
type CoreType = 'air' | 'iron' | 'u' | 'square'

const CORE_FACTOR: Record<CoreType, number> = {
  air: 1,
  iron: 2.8,
  u: 2.2,
  square: 2.5,
}

function circularB(z: number, a: number, N: number, i: number) {
  return ((MU0 * N * i) / 2) * (a ** 2) / (z ** 2 + a ** 2) ** 1.5
}

function helmholtzB(N: number, i: number, a: number) {
  return Math.pow(4 / 5, 1.5) * MU0 * N * i / a
}

function solenoidB(n: number, i: number, z: number, L: number) {
  const half = L / 2
  const a1 = Math.atan2(half - z, 0.0135)
  const a2 = Math.atan2(half + z, 0.0135)
  return MU0 * n * i * (Math.cos(a1) + Math.cos(a2)) / 2
}

export function MagneticFieldSim() {
  const [mode, setMode] = useState<FieldMode>('circular')
  const [N, setN] = useState(100)
  const [i, setI] = useState(0.5)
  const [a] = useState(0.05)
  const [z, setZ] = useState(0)
  const [length, setLength] = useState(0.075)
  const [e1] = useState(5)
  const [N1] = useState(400)
  const [N2] = useState(3200)
  const [core, setCore] = useState<CoreType>('air')
  const [bLog, setBLog] = useState<{ z: number; b: number; bTheory: number }[]>([])
  const [xfLog, setXfLog] = useState<{ core: string; e2: number }[]>([])
  const [guidedStep, setGuidedStep] = useState(0)
  const graphRef = useRef<HTMLCanvasElement>(null)
  const setupRef = useRef<HTMLCanvasElement>(null)

  const nDensity = 800 / length
  const B =
    mode === 'circular'
      ? circularB(z, a, N, i)
      : mode === 'helmholtz'
        ? helmholtzB(N, i, a)
        : mode === 'solenoid'
          ? solenoidB(nDensity, i, z, length)
          : 0
  const e2 = (N2 / N1) * e1 * CORE_FACTOR[core]

  const drawSetup = useCallback(() => {
    const canvas = setupRef.current
    if (!canvas) return
    const W = 360
    const H = 160
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)
    const cx = W / 2
    const cy = H / 2

    if (mode === 'transformer') {
      drawTransformer(ctx, cx, cy, coreLabel(core), N1, N2)
      ctx.fillStyle = '#64748b'
      ctx.font = '10px system-ui, sans-serif'
      ctx.fillText(`AC ε₁=${e1}V → ε₂=${e2.toFixed(1)}V`, 10, H - 12)
      return
    }

    // 측면 단면도: 코일 + z축
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(cx, cy - 50)
    ctx.lineTo(cx, cy + 55)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#94a3b8'
    ctx.font = '8px system-ui, sans-serif'
    ctx.fillText('z축', cx + 4, cy - 52)
    if (mode === 'helmholtz') {
      drawHelmholtzCoils(ctx, cx, cy, 70, 6, 6, 26)
      ctx.fillStyle = '#64748b'
      ctx.font = '9px sans-serif'
      ctx.fillText('간격 = a', cx - 18, cy + 48)
    } else if (mode === 'solenoid') {
      drawSolenoidCoils(ctx, cx, cy, 14, 8, 5, 26, '#ef4444', true)
    } else {
      drawCircularCoil(ctx, cx, cy, 38)
    }

    // z 측정 위치 (원형·솔레노이드)
    if (mode !== 'helmholtz') {
      const zPx = cy + (z / 0.08) * 28
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(cx - 62, zPx)
      ctx.lineTo(cx + 62, zPx)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(cx, zPx, 5, 0, Math.PI * 2)
      ctx.fill()
      drawGaussMeterProbe(ctx, W - 88, zPx - 16, `z=${(z * 100).toFixed(0)}cm`, B * 10000)
    } else {
      drawGaussMeterProbe(ctx, W - 88, 12, '중심 z=0', B * 10000)
    }

    // B 필드선 (코일 중심부)
    for (let j = -2; j <= 2; j++) {
      ctx.beginPath()
      ctx.moveTo(cx - 55, cy + j * 10)
      ctx.lineTo(cx + 55, cy + j * 10)
      ctx.stroke()
    }
  }, [mode, B, core, e1, e2, N1, N2, z])

  const drawGraph = useCallback(() => {
    const canvas = graphRef.current
    if (!canvas || mode === 'transformer') return
    const W = 360
    const H = 130
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.moveTo(35, H - 20)
    ctx.lineTo(W - 10, H - 20)
    ctx.moveTo(35, 10)
    ctx.lineTo(35, H - 20)
    ctx.stroke()

    const zMax = mode === 'helmholtz' ? 0.001 : 0.08
    const bMax = mode === 'helmholtz' ? helmholtzB(N, i, a) * 1.2 : Math.max(B, 1e-6) * 1.5

    ctx.strokeStyle = '#e85d75'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j <= 100; j++) {
      const zi = -zMax + (j / 100) * 2 * zMax
      const bi =
        mode === 'circular'
          ? circularB(zi, a, N, i)
          : mode === 'helmholtz'
            ? helmholtzB(N, i, a) * Math.exp(-((zi / a) ** 2) * 8)
            : solenoidB(nDensity, i, zi, length)
      const x = 35 + ((zi + zMax) / (2 * zMax)) * (W - 50)
      const y = H - 20 - (bi / bMax) * (H - 35)
      if (j === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    const zx = 35 + ((z + zMax) / (2 * zMax)) * (W - 50)
    const zy = H - 20 - (B / bMax) * (H - 35)
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(zx, zy, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = '9px sans-serif'
    ctx.fillText(mode === 'helmholtz' ? 'z (중심 근처)' : 'z (m)', W / 2 - 20, H - 4)
  }, [mode, N, i, a, z, B, length, nDensity])

  useEffect(() => {
    drawSetup()
    drawGraph()
  }, [drawSetup, drawGraph])

  const recordB = () => {
    const bTheory =
      mode === 'circular'
        ? circularB(z, a, N, i)
        : mode === 'helmholtz'
          ? helmholtzB(N, i, a) * Math.exp(-((z / a) ** 2) * 8)
          : solenoidB(nDensity, i, z, length)
    setBLog((prev) => [...prev, { z: z * 100, b: B * 1000, bTheory: bTheory * 1000 }])
  }

  const recordTransformer = () => {
    setXfLog((prev) => [...prev, { core, e2 }])
  }

  const guidedSteps = [
    { id: 'p1', label: '원형코일: z 1cm 간격 B(z) 측정', isComplete: () => bLog.length >= 3 && mode !== 'circular' },
    { id: 'p2', label: '헬름홀츠: B(0) 측정', isComplete: () => mode === 'solenoid' || mode === 'transformer' },
    { id: 'p3', label: '솔레노이드: 내부 B(z) 측정', isComplete: () => mode === 'transformer' },
    { id: 'p4', label: '변압기: 4코어 ε₂ 비교', isComplete: () => xfLog.length >= 4 },
  ]

  const fieldLiveControls = (
    <div className="space-y-3">
      {mode !== 'transformer' ? (
        <>
          {mode !== 'helmholtz' && (
            <SimSlider label="측정 위치 z (1cm 단위)" value={z * 100} min={-6} max={6} step={1} unit=" cm" onChange={(v) => setZ(v / 100)} />
          )}
          <button type="button" onClick={recordB} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white touch-manipulation">
            B(z) 기록
          </button>
        </>
      ) : (
        <>
          {(['air', 'iron', 'u', 'square'] as CoreType[]).map((c) => (
            <button key={c} type="button" onClick={() => setCore(c)} className={`w-full rounded-lg border px-3 py-2 text-sm touch-manipulation ${core === c ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-slate-200'}`}>
              {c === 'air' ? '공심' : c === 'iron' ? '철심' : c === 'u' ? 'U자' : 'ㅁ자'} — ε₂={((N2 / N1) * e1 * CORE_FACTOR[c]).toFixed(1)}V
            </button>
          ))}
          <button type="button" onClick={recordTransformer} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white touch-manipulation">
            ε₂ 기록
          </button>
        </>
      )}
    </div>
  )

  const fieldSetupControls = (
    <div className="space-y-3">
      <SimHint>
        {mode !== 'transformer'
          ? '가우스미터로 z축 1cm 간격 B(z)를 측정합니다. 전류 0.5A/1.0A 프리셋 후 [B(z) 기록].'
          : 'AC 5V 60Hz — 4종 코어를 바꿔 ε₂를 기록하고 N₂/N₁·ε₁과 비교합니다.'}
      </SimHint>
      <SimModeTabs
        modes={[
          { id: 'circular' as const, label: '원형코일' },
          { id: 'helmholtz' as const, label: '헬름홀츠' },
          { id: 'solenoid' as const, label: '솔레노이드' },
          { id: 'transformer' as const, label: '변압기' },
        ]}
        value={mode}
        onChange={(m) => { setMode(m); setBLog([]) }}
      />
      {mode !== 'transformer' && (
        <>
          <div className="flex gap-2">
            {[0.5, 1.0].map((amp) => (
              <button key={amp} type="button" onClick={() => setI(amp)} className={`flex-1 rounded-lg py-2 text-xs touch-manipulation ${i === amp ? 'bg-[var(--color-accent)] text-white' : 'bg-white ring-1 ring-slate-200'}`}>
                {amp}A
              </button>
            ))}
          </div>
          <SimSlider label="권수 N" value={N} min={50} max={200} step={10} unit="" onChange={setN} />
          {mode === 'solenoid' && (
            <SimSlider label="솔레노이드 길이 L" value={length} min={0.05} max={0.12} step={0.005} unit=" m" onChange={setLength} />
          )}
        </>
      )}
    </div>
  )

  return (
    <SimShell
      title="솔레노이드 자기장 & 변압기 실험"
      description="4파트 순서: 원형코일→헬름홀츠→솔레노이드→변압기. z 1cm 간격 B(z) 측정."
      hint="전류 3A 이하. 코일 과열 시 즉시 OFF."
    >
      <SimWorkbench
        figureRef="Fig.4"
        steps={guidedSteps}
        currentStep={guidedStep}
        onStepChange={setGuidedStep}
        bench={
          <div className="space-y-2">
            <div className="grid gap-4 lg:grid-cols-2">
              <SimCanvas label="실험 장치">
                <canvas ref={setupRef} width={360} height={160} className="w-full touch-none" />
              </SimCanvas>
              {mode !== 'transformer' ? (
                <SimCanvas label="B(z) — 파랑:측정 · 빨강:이론">
                  <canvas ref={graphRef} width={360} height={130} className="w-full" />
                </SimCanvas>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                  AC 5V 60Hz · N₁={N1} N₂={N2}
                  <br />
                  ε₂ = {(e2).toFixed(1)} V ({coreLabel(core)})
                </div>
              )}
            </div>
            <SimApparatusCaption
              structure={
                mode === 'transformer'
                  ? 'AC 5V 60Hz — 1차·2차 권선과 4종 코어. ε₂를 측정해 N₂/N₁·ε₁과 비교.'
                  : mode === 'helmholtz'
                    ? '두 원형코일 간격 a — 중심 z=0에서 B 최대. 가우스미터로 측정.'
                    : mode === 'solenoid'
                      ? '솔레노이드 축(z)을 따라 1cm 간격으로 B(z) 측정. 탐침은 축 위에 배치.'
                      : '원형코일 중심축(z)을 따라 가우스미터로 B(z) 측정.'
              }
            >
              {mode !== 'transformer' && (
                <>
                  <span>z = {(z * 100).toFixed(0)} cm</span>
                  <span>B = {(B * 1000).toFixed(3)} mT</span>
                </>
              )}
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <div className="rounded-xl bg-[#0a1a0a] p-3 text-center font-mono text-[#33ff33]">
            <p className="text-[10px] text-slate-400">가우스미터 2000G</p>
            <p className="text-2xl">{(B * 10000).toFixed(0)} G</p>
            <p className="text-xs text-slate-400">{(B * 1000).toFixed(3)} mT</p>
          </div>
        }
        liveControls={fieldLiveControls}
        setupControls={fieldSetupControls}
        dataSheet={
          mode !== 'transformer' ? (
            <LabDataSheet
              title="B(z) 측정표 (1cm 간격)"
              columns={[
                { key: 'z', label: 'z', unit: 'cm' },
                { key: 'b', label: 'B측정', unit: 'mT' },
                { key: 'bTheory', label: 'B이론', unit: 'mT' },
              ]}
              rows={bLog}
              onDeleteRow={(i) => setBLog((p) => p.filter((_, j) => j !== i))}
              onClearAll={() => setBLog([])}
              calcMapping={
                mode === 'solenoid'
                  ? { 'solenoid-b': { n: 'b', i: 'bTheory' } }
                  : { 'helmholtz-b': { N: 'b', i: 'bTheory', a: 'z' } }
              }
              theoryValue={mode === 'helmholtz' ? helmholtzB(N, i, a) * 1000 : undefined}
              theoryLabel="B(0) 이론"
            />
          ) : (
            <LabDataSheet
              title="변압기 코어별 ε₂"
              columns={[
                { key: 'core', label: '코어' },
                { key: 'e2', label: 'ε₂', unit: 'V' },
              ]}
              rows={xfLog}
              onDeleteRow={(i) => setXfLog((p) => p.filter((_, j) => j !== i))}
              onClearAll={() => setXfLog([])}
              calcMapping={{ transformer: { e1: 'e2', N1: 'e2', N2: 'e2' } }}
            />
          )
        }
      />
      <div className="mt-4">
        <SimReadout
          items={
            mode === 'transformer'
              ? [
                  { label: 'N₂/N₁', value: (N2 / N1).toFixed(2) },
                  { label: '이론 ε₂', value: `${((N2 / N1) * e1).toFixed(1)} V` },
                  { label: '측정 ε₂', value: `${e2.toFixed(1)} V`, highlight: core !== 'air' },
                ]
              : [
                  { label: 'B (측정)', value: `${(B * 1000).toFixed(3)} mT` },
                  { label: 'z', value: `${(z * 100).toFixed(0)} cm` },
                  { label: '기록', value: `${bLog.length}점` },
                ]
          }
        />
      </div>
    </SimShell>
  )
}

// --- Hysteresis: 15-step current sweep ---

const CURRENT_STEPS = Array.from({ length: 15 }, (_, k) => (k / 14) * 3)

function hysteresisFromCurrent(I: number, withSample: boolean): { H: number; B: number } {
  const H = I * 30
  if (!withSample) return { H, B: H * 0.008 }
  const Hn = H / 90
  const B = 0.95 * Math.tanh(Hn * 2.2) + 0.35 * Math.tanh(Hn * 4) * (Hn > 0 ? 1 : -1) * 0.3
  return { H, B: Math.max(-1, Math.min(1, B)) }
}

function findBrHc(trail: { H: number; B: number }[]) {
  let Br = 0
  let Hc = 0
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1]
    const b = trail[i]
    if (a.H * b.H <= 0 && Math.abs(a.H - b.H) > 1) {
      const t = Math.abs(a.H) / (Math.abs(a.H) + Math.abs(b.H))
      Br = a.B + t * (b.B - a.B)
    }
    if (a.B * b.B <= 0 && Math.abs(a.B - b.B) > 0.01) {
      const t = Math.abs(a.B) / (Math.abs(a.B) + Math.abs(b.B))
      Hc = Math.abs(a.H + t * (b.H - a.H))
    }
  }
  return { Br: Br || 0.55, Hc: Hc || 42 }
}

export function HysteresisSim() {
  const [phase, setPhase] = useState<'linear' | 'loop'>('linear')
  const [stepIdx, setStepIdx] = useState(0)
  const [withSample, setWithSample] = useState(false)
  const [trail, setTrail] = useState<{ H: number; B: number; I: number }[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apparatusRef = useRef<HTMLCanvasElement>(null)

  const I = CURRENT_STEPS[stepIdx]
  const { H, B } = hysteresisFromCurrent(I, withSample)
  const { Br, Hc } = findBrHc(trail)

  const recordPoint = () => {
    setTrail((prev) => [...prev, { H, B, I }])
  }

  const sweepLoop = () => {
    setWithSample(true)
    setPhase('loop')
    const pts: { H: number; B: number; I: number }[] = []
    for (let s = 0; s <= 56; s++) {
      const t = s / 56
      const angle = t * 2 * Math.PI
      const Is = 3 * Math.sin(angle)
      const p = hysteresisFromCurrent(Math.abs(Is), true)
      pts.push({ H: p.H * Math.sign(Is || 1), B: p.B, I: Is })
    }
    setTrail(pts)
    setStepIdx(14)
  }

  useEffect(() => {
    const canvas = apparatusRef.current
    if (!canvas) return
    const W = 320
    const H = 100
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    drawHysteresisApparatus(ctx, W, H, withSample)
    drawGaussMeterProbe(ctx, W - 88, 12, 'B', B * 10000)
  }, [withSample, B])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = 320
    const Hc = 240
    const ctx = prepareCanvas(canvas, W, Hc)
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, Hc)

    const toX = (h: number) => W / 2 + (h / 100) * (W / 2 - 40)
    const toY = (b: number) => Hc / 2 - b * 80

    ctx.strokeStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.moveTo(40, Hc - 30)
    ctx.lineTo(W - 10, Hc - 30)
    ctx.moveTo(W / 2, 10)
    ctx.lineTo(W / 2, Hc - 30)
    ctx.stroke()
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.fillText('H (A/m)', W / 2 - 15, Hc - 8)

    if (phase === 'linear' && trail.length > 1) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      trail.forEach((p, i) => {
        const x = 40 + (p.I / 3) * (W - 80)
        const y = Hc - 30 - (p.B / 1) * (Hc - 50)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    if (trail.length > 1 && phase === 'loop') {
      ctx.strokeStyle = '#e85d75'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      trail.forEach((p, i) => {
        const x = toX(p.H)
        const y = toY(p.B)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(Br))
    ctx.lineTo(W / 2, toY(Br))
    ctx.moveTo(toX(Hc), toY(0))
    ctx.lineTo(toX(Hc), Hc / 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#64748b'
    ctx.font = '8px sans-serif'
    ctx.fillText(`Br=${Br.toFixed(2)}`, W / 2 + 4, toY(Br) - 4)
    ctx.fillText(`Hc=${Hc.toFixed(0)}`, toX(Hc) + 4, Hc / 2 - 4)

    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(phase === 'linear' ? 40 + (I / 3) * (W - 80) : toX(H), phase === 'linear' ? Hc - 30 - (B / 1) * (Hc - 50) : toY(B), 7, 0, Math.PI * 2)
    ctx.fill()
  }, [H, B, trail, Br, Hc, phase, I])

  const hysteresisLiveControls = (
    <div className="space-y-3">
      {phase === 'linear' && (
        <>
          <SimSlider label={`전류 I (${stepIdx + 1}/15)`} value={I} min={0} max={3} step={3 / 14} unit=" A" onChange={(v) => setStepIdx(Math.round((v / 3) * 14))} />
          <button type="button" onClick={recordPoint} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white touch-manipulation">
            (I, B) 기록
          </button>
        </>
      )}
      {phase === 'loop' && (
        <button type="button" onClick={sweepLoop} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white touch-manipulation">
          전류 스윕 (0→max→−max→0)
        </button>
      )}
    </div>
  )

  const hysteresisSetupControls = (
    <div className="space-y-3">
      <SimHint>
        {phase === 'linear'
          ? '철심 없이 I를 0~3A 15단으로 올리며 (I,B)를 기록 → I-B 직선 관계 확인'
          : '[전류 스윕]으로 0→max→−max→0 이력 폐곡선을 그립니다. Br·Hc 자동 판독.'}
      </SimHint>
      <SimModeTabs
        modes={[
          { id: 'linear' as const, label: 'Phase 1: 철심 없음' },
          { id: 'loop' as const, label: 'Phase 2: 이력 루프' },
        ]}
        value={phase}
        onChange={(p) => { setPhase(p); setTrail([]); setStepIdx(0); setWithSample(p === 'loop') }}
      />
    </div>
  )

  return (
    <SimShell
      title="자기이력곡선 (B-H)"
      description="15단 전류 스텝 I-B 선형 → 탈자 시료 삽입 후 이력 폐곡선. Br/Hc 자동 판독."
      hint="가우스미터 2000G. 측정 후 즉시 스위치 OFF."
    >
      <SimWorkbench
        figureRef="Fig.5"
        bench={
          <div className="space-y-2">
            <SimCanvas label={phase === 'linear' ? '솔레노이드 (철심 없음)' : '솔레노이드 + 탈자 시료'}>
              <canvas ref={apparatusRef} width={320} height={100} className="mx-auto w-full max-w-sm" />
            </SimCanvas>
            <SimCanvas label={phase === 'linear' ? 'I-B 선형 (철심 없음)' : 'B-H 이력 폐곡선'}>
              <canvas ref={canvasRef} width={320} height={240} className="mx-auto w-full max-w-sm" />
            </SimCanvas>
            <SimApparatusCaption
              structure={
                phase === 'linear'
                  ? '솔레노이드에 전류 I를 15단으로 올리며 가우스미터로 B 측정 → I-B 선형 관계 확인.'
                  : '탈자 시료 링을 솔레노이드에 삽입. 전류 0→max→−max→0 스윕으로 B-H 이력 폐곡선.'
              }
            >
              <span>I = {I.toFixed(2)} A</span>
              <span>B = {(B * 10000).toFixed(0)} G</span>
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="rounded bg-[#0a1a0a] p-2 text-[#33ff33]">I={I.toFixed(2)}A</div>
            <div className="rounded bg-[#0a1a0a] p-2 text-[#33ff33]">B={(B * 10000).toFixed(0)}G</div>
          </div>
        }
        liveControls={hysteresisLiveControls}
        setupControls={hysteresisSetupControls}
        dataSheet={
          <LabDataSheet
            title="B-H 측정 기록"
            columns={[
              { key: 'I', label: 'I', unit: 'A' },
              { key: 'H', label: 'H', unit: 'A/m' },
              { key: 'B', label: 'B', unit: 'T' },
            ]}
            rows={trail}
            onDeleteRow={(i) => setTrail((p) => p.filter((_, j) => j !== i))}
            onClearAll={() => setTrail([])}
            calcMapping={{ magnetization: { H: 'H', chi: 'B' } }}
          />
        }
      />
      <div className="mt-4">
        <SimReadout
          items={[
            { label: 'Br (H=0)', value: `${Br.toFixed(3)} T` },
            { label: 'Hc (B=0)', value: `${Hc.toFixed(0)} A/m` },
            { label: '기록', value: `${trail.length}점` },
          ]}
        />
      </div>
    </SimShell>
  )
}

/** 실험 키트: 천칭 팔의 질량 거치 홈 5곳 — 홈마다 다른 추를 걸어 반복 측정 */
const BALANCE_NOTCHES = [
  { label: '홈 1', massG: 0.12, hookBeamX: 128 },
  { label: '홈 2', massG: 0.15, hookBeamX: 148 },
  { label: '홈 3', massG: 0.18, hookBeamX: 168 },
  { label: '홈 4', massG: 0.21, hookBeamX: 188 },
  { label: '홈 5', massG: 0.24, hookBeamX: 208 },
] as const

/** 실제 키트: 왼쪽 칼날 회전추 — 솔레노이드는 팔 중앙 구간(도선)만 감쌈 — 오른쪽에 추 */
const BALANCE_LAYOUT = {
  pivotX: 88,
  pivotY: 108,
  solenoidOffsetX: 72,
  wireStartX: 38,
  wireEndX: 108,
  beamLeft: -18,
  beamRight: 225,
} as const

export function MagneticBalanceSim() {
  const [notch, setNotch] = useState(1)
  const [m, setM] = useState<number>(BALANCE_NOTCHES[1].massG)
  const [I, setI] = useState(1.5)
  const [l] = useState(0.05)
  const [resistorOn, setResistorOn] = useState(false)
  const [log, setLog] = useState<{ notch: number; m: number; I: number; l: number; B: number }[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const notchPreset = BALANCE_NOTCHES[notch]
  const N = 550
  const solenoidL = 0.12
  const n = N / solenoidL
  const powerOn = resistorOn
  const B_true = powerOn ? MU0 * n * I : 0
  const F_mag = B_true * I * l
  const F_weight = m * 1e-3 * 9.81
  const I_balance = Math.sqrt((m * 1e-3 * 9.81) / (MU0 * n * l))
  const balanced = powerOn && Math.abs(F_mag - F_weight) / F_weight < 0.04
  const B_calc = (m * 1e-3 * 9.81) / (I * l)

  const maxTilt = 0.3
  const forceImbalance = powerOn ? (F_weight - F_mag) / F_weight : -1
  const tilt = powerOn
    ? Math.max(-maxTilt, Math.min(maxTilt, forceImbalance * maxTilt))
    : -maxTilt * 0.45

  const selectNotch = (idx: number) => {
    setNotch(idx)
    setM(BALANCE_NOTCHES[idx].massG)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = 400
    const H = 220
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return

    const { pivotX, pivotY, solenoidOffsetX, wireStartX, wireEndX, beamLeft, beamRight } = BALANCE_LAYOUT
    const solX = pivotX + solenoidOffsetX
    const hx = notchPreset.hookBeamX

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    // 솔레노이드 — 회전추와 분리, 도선 구간만 관통
    drawSolenoidCoils(ctx, solX, pivotY, 6, 13, 9, 34, '#3b82f6', powerOn)

    // 칼날 회전추 (왼쪽)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(pivotX - 4, pivotY + 4, 8, 38)
    ctx.beginPath()
    ctx.moveTo(pivotX - 22, pivotY + 42)
    ctx.lineTo(pivotX + 22, pivotY + 42)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    ctx.translate(pivotX, pivotY)
    ctx.rotate(tilt)

    // 천칭 팔
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(beamLeft, 0)
    ctx.lineTo(beamRight, 0)
    ctx.stroke()

    // 솔레노이드 안 도선(가로) + U자 다리
    ctx.strokeStyle = powerOn ? '#ef4444' : '#cbd5e1'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(wireStartX, -14)
    ctx.lineTo(wireStartX, 0)
    ctx.lineTo(wireEndX, 0)
    ctx.lineTo(wireEndX, -14)
    ctx.stroke()
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(wireStartX, 0)
    ctx.lineTo(wireEndX, 0)
    ctx.stroke()

    // 추 + 실
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(hx, 0)
    ctx.lineTo(hx, 30)
    ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(hx - 11, 30, 22, 18)

    ctx.restore()

    // 회전추 점
    ctx.fillStyle = balanced ? '#22c55e' : '#475569'
    ctx.beginPath()
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2)
    ctx.fill()

    // 라벨 (최소 — 상세는 HTML)
    ctx.fillStyle = '#64748b'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText('↙ 회전추', pivotX - 52, pivotY - 14)
    ctx.fillText('솔레노이드', solX - 28, pivotY - 44)
    ctx.fillStyle = '#475569'
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillText(`${m}g`, pivotX + hx - 8, pivotY + 58)

    if (!powerOn) {
      ctx.fillStyle = 'rgba(248,250,252,0.82)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#dc2626'
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.fillText('저항박스 ON 후 실험 시작', W / 2 - 78, H / 2)
    }
  }, [m, tilt, balanced, powerOn, notchPreset])

  const recordBalance = () => {
    if (!balanced) return
    setLog((prev) => [...prev, { notch: notch + 1, m, I, l, B: B_calc * 1000 }])
  }

  const balanceLiveControls = (
    <div className="space-y-3">
      <label className={`flex items-center gap-2 rounded-lg border p-3 text-sm touch-manipulation ${resistorOn ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
        <input type="checkbox" checked={resistorOn} onChange={(e) => setResistorOn(e.target.checked)} />
        <span><strong>① 저항박스 ON</strong> (전원 직결 금지 — 이걸 먼저 켜야 천칭이 움직입니다)</span>
      </label>
      <p className="text-[11px] leading-relaxed text-slate-600">
        <strong>홈 1~5</strong> = 천칭 팔에 추를 거는 5개 위치. 홈마다 다른 추(0.12~0.24g)로 바꿔가며 같은 실험을 반복합니다.
      </p>
      <div className="grid grid-cols-5 gap-1">
        {BALANCE_NOTCHES.map((preset, idx) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => selectNotch(idx)}
            className={`min-w-0 rounded py-2 text-[10px] leading-tight touch-manipulation ${notch === idx ? 'bg-[var(--color-accent)] text-white' : 'bg-white ring-1 ring-slate-200'}`}
          >
            {preset.label}
            <span className="block text-[9px] opacity-80">{preset.massG}g</span>
          </button>
        ))}
      </div>
      <SimSlider label="추 질량 m" value={m} min={0.05} max={0.5} step={0.01} unit=" g" onChange={setM} />
      <SimSlider label="천칭 전류 I" value={I} min={0.5} max={3} step={0.05} unit=" A" onChange={setI} />
      {powerOn && (
        <p className="text-center text-[11px] text-indigo-600">
          수평이 되려면 I ≈ <strong>{I_balance.toFixed(2)} A</strong> 근처
        </p>
      )}
      <button type="button" onClick={recordBalance} disabled={!balanced} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white disabled:opacity-40 touch-manipulation">
        {balanced ? `✓ ${notchPreset.label} 평형 기록` : '수평이 된 뒤 기록'}
      </button>
    </div>
  )

  const balanceSetupControls = (
    <div className="space-y-3">
      <SimHint>
        솔레노이드(N=550) 안 도선에 자기력 F=BIl이 작용합니다. 추를 걸어 토크 평형 BIl=mg가 되도록 I를 조절하고, 5개 홈에서 반복 측정해 B를 역산합니다.
      </SimHint>
      <p className="text-xs text-slate-500">도선 유효 길이 l = {l} m (6가닥 합) · 솔레노이드 전류는 천칭 I와 동일 회로</p>
    </div>
  )

  return (
    <SimShell
      title="전류천칭 자기유도"
      description="저항박스 필수. 추 질량→I 조절로 수평 맞추기. 5홈 반복 측정."
      hint="저항박스 없이 전원 직결 금지!"
    >
      <SimWorkbench
        figureRef="Fig.6"
        bench={
          <div className="space-y-2">
            <SimCanvas label="전류천칭 + 솔레노이드 (Φ78mm, N=550) — 회전추(왼쪽) · 도선만 솔레노이드 통과">
              <canvas ref={canvasRef} width={400} height={220} className="mx-auto w-full max-w-[480px]" />
            </SimCanvas>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
              <p>
                <strong className="text-slate-800">구조:</strong> 왼쪽 칼날 회전추 → 가운데 솔레노이드가 <strong>도선(빨강)</strong>만 감쌈 → 오른쪽 홈에 추
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <span>F<sub>mag</sub> = {(F_mag * 1000).toFixed(2)} mN</span>
                <span>mg = {(F_weight * 1000).toFixed(2)} mN</span>
                {powerOn && !balanced && (
                  <span className="text-indigo-600">수평 목표 I ≈ {I_balance.toFixed(2)} A</span>
                )}
                {balanced && <span className="text-green-600">✓ 수평 (BIl = mg)</span>}
              </div>
            </div>
          </div>
        }
        instruments={
          <div className={`rounded-xl p-3 text-center text-sm font-medium ${balanced ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {balanced ? '✓ 수평 — Fd = mgs' : powerOn ? '기울어짐 — I 조절' : '전원 차단'}
          </div>
        }
        liveControls={balanceLiveControls}
        setupControls={balanceSetupControls}
        dataSheet={
          <LabDataSheet
            title="5홈 반복 측정"
            columns={[
              { key: 'notch', label: '홈', unit: '' },
              { key: 'm', label: '추 질량 m', unit: 'g' },
              { key: 'I', label: '전류 I', unit: 'A' },
              { key: 'B', label: 'B (역산)', unit: 'mT' },
            ]}
            rows={log}
            onDeleteRow={(i) => setLog((p) => p.filter((_, j) => j !== i))}
            onClearAll={() => setLog([])}
            calcMapping={{ 'b-from-balance': { m: 'm', I: 'I', l: 'l', d: 'notch' } }}
            theoryValue={MU0 * n * I * 1000}
            theoryLabel="μ₀ni"
          />
        }
      />
      <div className="mt-4">
        <SimReadout
          items={[
            { label: 'B (역산)', value: `${(B_calc * 1000).toFixed(3)} mT`, highlight: balanced },
            { label: 'B (이론 μ₀ni)', value: `${(MU0 * n * I * 1000).toFixed(3)} mT` },
            { label: '기록', value: `${log.length}/5홈` },
          ]}
        />
      </div>
    </SimShell>
  )
}

export function BrewsterSim() {
  const [theta, setTheta] = useState(56)
  const [polarizer, setPolarizer] = useState(90)
  const [scanPhase, setScanPhase] = useState<'manual' | 'coarse' | 'fine'>('manual')
  const [scanLog, setScanLog] = useState<{ theta: number; intensity: number }[]>([])
  const [thetaP, setThetaP] = useState<number | null>(null)
  const setupRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<HTMLCanvasElement>(null)

  const nGlass = 1.5
  const thetaB = (Math.atan(nGlass) * 180) / Math.PI
  const isBrewster = Math.abs(theta - thetaB) < 1
  const reflectedIntensity = isBrewster ? 0.02 : 0.3 + 0.4 * Math.cos(((theta - thetaB) * Math.PI) / 90) ** 2

  const runCoarseScan = () => {
    setScanPhase('coarse')
    const pts: { theta: number; intensity: number }[] = []
    for (let deg = 20; deg <= 160; deg += 5) {
      const atB = Math.abs(deg - thetaB) < 1
      const inten = atB ? 0.05 : 0.3 + 0.4 * Math.cos(((deg - thetaB) * Math.PI) / 90) ** 2
      pts.push({ theta: deg, intensity: inten })
    }
    setScanLog(pts)
    const min = pts.reduce((a, b) => (a.intensity < b.intensity ? a : b))
    setThetaP(min.theta)
    setTheta(min.theta)
  }

  const runFineScan = () => {
    const center = thetaP ?? thetaB
    setScanPhase('fine')
    const pts: { theta: number; intensity: number }[] = []
    for (let deg = center - 10; deg <= center + 10; deg += 2) {
      const atB = Math.abs(deg - thetaB) < 0.5
      const inten = atB ? 0.03 : 0.3 + 0.4 * Math.cos(((deg - thetaB) * Math.PI) / 90) ** 2
      pts.push({ theta: deg, intensity: inten })
    }
    setScanLog(pts)
    const min = pts.reduce((a, b) => (a.intensity < b.intensity ? a : b))
    setThetaP(min.theta)
    setTheta(min.theta)
  }

  useEffect(() => {
    const canvas = setupRef.current
    if (!canvas) return
    const W = 360
    const H = 180
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, W, H)

    const railY = H - 42
    drawOpticalRail(ctx, railY, 24, W - 24)

    // 레이저
    drawOpticalMount(ctx, 36, railY, 52, '레이저')
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(18, railY - 18, 22, 10)

    // 편광판
    drawOpticalMount(ctx, 100, railY, 48, `편광 ${polarizer}°`)

    // 프리즘 (삼각형, 벤치 위)
    const px = 175
    const py = railY - 8
    ctx.fillStyle = 'rgba(100,180,230,0.4)'
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(px - 38, py)
    ctx.lineTo(px + 38, py)
    ctx.lineTo(px, py - 50)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 조도센서 (반사광)
    drawOpticalMount(ctx, W - 48, railY, 48, '센서')

    const rad = (theta * Math.PI) / 180
    const laserX = 48
    const laserY = railY - 14
    const hitX = px
    const hitY = py - 50

    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(laserX, laserY)
    ctx.lineTo(hitX, hitY)
    ctx.stroke()

    const reflAlpha = reflectedIntensity
    ctx.strokeStyle = isBrewster ? `rgba(74,222,128,${0.4 + reflAlpha})` : `rgba(251,191,36,${0.5 + reflAlpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hitX, hitY)
    ctx.lineTo(hitX + Math.sin(rad) * 70, hitY - Math.cos(rad) * 70)
    ctx.stroke()

    const refractAngle = Math.asin(Math.sin(rad) / nGlass)
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(hitX, hitY)
    ctx.lineTo(hitX + Math.sin(refractAngle) * 50, hitY + Math.cos(refractAngle) * 50)
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText('⚠ 안전 고글', 10, 16)
  }, [theta, polarizer, isBrewster, reflectedIntensity])

  useEffect(() => {
    const canvas = graphRef.current
    if (!canvas) return
    const W = 360
    const H = 120
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.moveTo(35, H - 20)
    ctx.lineTo(W - 10, H - 20)
    ctx.moveTo(35, 10)
    ctx.lineTo(35, H - 20)
    ctx.stroke()

    ctx.strokeStyle = '#e85d75'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let deg = 20; deg <= 80; deg++) {
      const atBrewster = Math.abs(deg - thetaB) < 1
      const inten = atBrewster ? 0.05 : 0.3 + 0.4 * Math.cos(((deg - thetaB) * Math.PI) / 90) ** 2
      const x = 35 + ((deg - 20) / 60) * (W - 50)
      const y = H - 20 - inten * (H - 35)
      if (deg === 20) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    const cx = 35 + ((theta - 20) / 60) * (W - 50)
    const cy = H - 20 - reflectedIntensity * (H - 35)
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([3, 3])
    const bx = 35 + ((thetaB - 20) / 60) * (W - 50)
    ctx.beginPath()
    ctx.moveTo(bx, 10)
    ctx.lineTo(bx, H - 20)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#64748b'
    ctx.font = '9px sans-serif'
    ctx.fillText('반사광 세기 vs θ', W / 2 - 40, H - 4)
    ctx.fillText(`θp=${thetaB.toFixed(1)}°`, bx + 3, 18)
  }, [theta, thetaB, reflectedIntensity])

  return (
    <SimShell
      title="브루스터 각"
      description="편광판 90° 설정 → 5° 거친 스캔 → θp±10° 2° 정밀 스캔. n=tanθp."
      hint="조도센서 range 600. 안전 고글 필수."
    >
      <SimWorkbench
        figureRef="Fig.8"
        bench={
          <div className="space-y-2">
            <div className="grid gap-4 lg:grid-cols-2">
              <SimCanvas label="광학 벤치 (레이저→편광판→프리즘→센서)">
                <canvas ref={setupRef} width={360} height={180} className="w-full" />
              </SimCanvas>
              <SimCanvas label="조도센서 — 반사광 세기 vs θ">
                <canvas ref={graphRef} width={360} height={120} className="w-full" />
              </SimCanvas>
            </div>
            <SimApparatusCaption structure="광학 벤치 위 레이저 → 편광판(90°) → 유리 프리즘. 반사광을 조도센서로 측정. 브루스터 각에서 반사광 최소.">
              <span>θ = {theta}°</span>
              <span>θp 이론 = {thetaB.toFixed(1)}°</span>
              <span>반사 세기 = {(reflectedIntensity * 100).toFixed(0)}%</span>
            </SimApparatusCaption>
          </div>
        }
        instruments={
          <div className="rounded bg-[#0a1a0a] p-3 text-center font-mono text-[#33ff33]">
            <p className="text-[10px] text-slate-400">조도센서</p>
            <p className="text-xl">{(reflectedIntensity * 100).toFixed(0)}%</p>
            {thetaP !== null && <p className="text-xs text-amber-400">θp={thetaP.toFixed(1)}°</p>}
          </div>
        }
        liveControls={
          <div className="space-y-3">
            <SimSlider label="입사각 θ" value={theta} min={20} max={80} step={scanPhase === 'fine' ? 2 : 0.5} unit=" °" onChange={setTheta} />
            <button type="button" onClick={runCoarseScan} className="w-full rounded-lg border border-[var(--color-accent)] py-2.5 text-sm text-[var(--color-accent)] touch-manipulation">
              Phase 1: 5° 간격 스캔
            </button>
            <button type="button" onClick={runFineScan} className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm text-white touch-manipulation">
              Phase 2: 2° 정밀 스캔
            </button>
          </div>
        }
        setupControls={
          <div className="space-y-3">
            <SimHint>
              편광판 90° 설정 후 입사각을 스캔합니다. Phase 1(5° 간격)으로 대략적 θp를 찾고, Phase 2(2°)로 정밀 측정합니다.
            </SimHint>
            <SimSlider label="편광판 (기준 90°)" value={polarizer} min={0} max={180} step={1} unit=" °" onChange={setPolarizer} />
          </div>
        }
        dataSheet={
          <LabDataSheet
            title="반사광 세기 스캔"
            columns={[
              { key: 'theta', label: 'θ', unit: '°' },
              { key: 'intensity', label: '세기', unit: '%', decimals: 1 },
            ]}
            rows={scanLog.map((r) => ({ theta: r.theta, intensity: r.intensity * 100 }))}
            onDeleteRow={(i) => setScanLog((p) => p.filter((_, j) => j !== i))}
            onClearAll={() => setScanLog([])}
            calcMapping={{ brewster: { theta_p: 'theta' } }}
            theoryValue={thetaB}
            theoryLabel="θp 이론"
          />
        }
      />
      <div className="mt-4">
        <SimReadout
          items={[
            { label: 'n = tan θp', value: Math.tan(((thetaP ?? theta) * Math.PI) / 180).toFixed(3) },
            { label: '이론 θp (n=1.5)', value: `${thetaB.toFixed(1)}°` },
            { label: '브루스터', value: isBrewster ? '✓' : '—', highlight: isBrewster },
          ]}
        />
      </div>
    </SimShell>
  )
}

type SlitPart = 'p1' | 'p2' | 'p3'
type SlitMode = 'single' | 'double'

export function DoubleSlitSim() {
  const [part, setPart] = useState<SlitPart>('p1')
  const [mode, setMode] = useState<SlitMode>('double')
  const [d] = useState(0.5)
  const [a, setA] = useState(0.08)
  const [D, setDdist] = useState(10)
  const [y, setY] = useState(2)
  const [lambdaLog, setLambdaLog] = useState<{ y: number; D: number; lambda: number }[]>([])
  const setupRef = useRef<HTMLCanvasElement>(null)
  const patternRef = useRef<HTMLCanvasElement>(null)

  const lambda = ((d * 1e-3) * (y * 1e-3)) / (D * 1e-2)
  const lambdaNm = lambda * 1e9
  const lamRef = 636e-9

  const recordLambda = () => {
    setLambdaLog((prev) => [...prev, { y, D, lambda: lambdaNm }])
  }

  useEffect(() => {
    const canvas = setupRef.current
    if (!canvas) return
    const W = 360
    const H = 130
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = '#1a1a1f'
    ctx.fillRect(0, 0, W, H)

    const railY = H - 36
    drawOpticalRail(ctx, railY, 16, W - 20)

    // He-Ne 레이저
    drawOpticalMount(ctx, 32, railY, 44, 'He-Ne')
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(14, railY - 14, 20, 8)
    ctx.strokeStyle = '#ff6666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(42, railY - 10)
    ctx.lineTo(108, railY - 10)
    ctx.stroke()

    // 슬릿 판
    drawOpticalMount(ctx, 118, railY, 50, mode === 'double' ? '이중슬릿' : '단일슬릿')
    ctx.fillStyle = '#475569'
    ctx.fillRect(112, railY - 42, 12, 84)
    if (mode === 'double') {
      ctx.fillStyle = '#1a1a1f'
      ctx.fillRect(114, railY - 20, 8, 8)
      ctx.fillRect(114, railY + 12, 8, 8)
    } else {
      ctx.fillStyle = '#1a1a1f'
      ctx.fillRect(114, railY - 10, 8, 20)
    }

    // 거리 D 표시
    ctx.strokeStyle = '#64748b'
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(124, railY - 8)
    ctx.lineTo(W - 40, railY - 8)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#94a3b8'
    ctx.font = '9px system-ui, sans-serif'
    ctx.fillText(`D = ${D} cm`, (124 + W - 40) / 2 - 18, railY - 14)

    // 스크린 + 눈금자
    drawOpticalMount(ctx, W - 32, railY, 52, '스크린')
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(W - 38, railY - 48, 14, 96)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 0.5
    for (let mm = -4; mm <= 4; mm++) {
      const yy = railY + mm * 10
      ctx.beginPath()
      ctx.moveTo(W - 38, yy)
      ctx.lineTo(W - 32, yy)
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    ctx.font = '8px system-ui, sans-serif'
    ctx.fillText(`y=${y}mm`, W - 70, railY + 58)
  }, [mode, D, y])

  useEffect(() => {
    const canvas = patternRef.current
    if (!canvas) return
    const W = 360
    const H = 90
    const ctx = prepareCanvas(canvas, W, H)
    if (!ctx) return
    for (let x = 0; x < W; x++) {
      const angle = ((x - W / 2) / W) * 0.2
      let intensity: number
      if (mode === 'double') {
        const pathDiff = (d * 1e-3) * Math.sin(angle)
        const phase = (2 * Math.PI * pathDiff) / lamRef
        const betaEnv = (Math.PI * (a * 1e-3) * Math.sin(angle)) / lamRef
        const sincVal = betaEnv === 0 ? 1 : Math.sin(betaEnv) / betaEnv
        const envelope = sincVal * sincVal
        intensity = Math.pow(Math.cos(phase / 2), 2) * envelope
      } else {
        const beta = (Math.PI * (a * 1e-3) * Math.sin(angle)) / lamRef
        intensity = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2
      }
      const r = Math.round(255 * intensity)
      ctx.fillStyle = `rgb(${r},${Math.round(r * 0.15)},${Math.round(r * 0.15)})`
      ctx.fillRect(x, 0, 1, H)
    }
    const fringe = (y * 1e-3 / (D * 1e-2)) * W * 0.4
    ctx.strokeStyle = '#ffff00'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2 + fringe, 0)
    ctx.lineTo(W / 2 + fringe, H)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#ffff00'
    ctx.font = '9px sans-serif'
    ctx.fillText(`y=${y}mm`, W / 2 + fringe / 2 - 12, H - 4)
  }, [mode, d, a, D, y, lamRef])

  const slitLiveControls = (
    <div className="space-y-3">
      {part === 'p3' && (
        <>
          <SimSlider label="무늬 간격 y (눈금자)" value={y} min={0.5} max={5} step={0.1} unit=" mm" onChange={setY} />
          <SimSlider label="거리 D" value={D} min={5} max={30} step={0.5} unit=" cm" onChange={setDdist} />
          <button type="button" onClick={recordLambda} disabled={lambdaLog.length >= 5} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm text-white disabled:opacity-40 touch-manipulation">
            λ 측정 기록 ({lambdaLog.length}/5)
          </button>
        </>
      )}
      {part === 'p1' && <p className="text-xs text-slate-600">스크린 무늬를 비교하세요. D=10cm 고정.</p>}
      {part === 'p2' && <p className="text-xs text-slate-600">슬릿폭을 바꾸며 회절 무늬 변화를 관찰하세요.</p>}
    </div>
  )

  const slitSetupControls = (
    <div className="space-y-3">
      <SimHint>
        {part === 'p1' && 'D=10cm 고정. 단일 슬릿(넓은 띠) vs 이중 슬릿(조밀 무늬) 비교'}
        {part === 'p2' && '슬릿폭 0.04·0.08·0.16mm — 슬릿이 넓을수록 회절 무늬가 넓어집니다'}
        {part === 'p3' && '스크린 눈금자로 y를 측정 → λ=dy/D. 5회 반복 후 평균과 636nm 오차를 확인합니다'}
      </SimHint>
      <SimModeTabs
        modes={[
          { id: 'p1' as const, label: 'Part 1' },
          { id: 'p2' as const, label: 'Part 2' },
          { id: 'p3' as const, label: 'Part 3' },
        ]}
        value={part}
        onChange={setPart}
      />
      {part === 'p1' && (
        <SimModeTabs
          modes={[
            { id: 'single' as const, label: '단일 슬릿' },
            { id: 'double' as const, label: '이중 슬릿' },
          ]}
          value={mode}
          onChange={setMode}
        />
      )}
      {part === 'p2' && (
        <>
          {[0.04, 0.08, 0.16].map((w) => (
            <button key={w} type="button" onClick={() => { setA(w); setMode('single') }} className={`w-full rounded-lg py-2 text-xs touch-manipulation ${a === w ? 'bg-[var(--color-accent)] text-white' : 'bg-white ring-1 ring-slate-200'}`}>
              슬릿폭 a = {w} mm
            </button>
          ))}
        </>
      )}
    </div>
  )

  return (
    <SimShell
      title="영의 이중슬릿"
      description="Part1 단일/이중 비교, Part2 슬릿폭 3종, Part3 λ=dy/D 5회 평균."
      hint="레이저-격자 10cm. 스크린 눈금자로 y 측정."
    >
      <SimWorkbench
        figureRef="Fig.9"
        bench={
          <div className="space-y-2">
            <div className="grid gap-4">
              <SimCanvas label="광학 벤치 (He-Ne → 슬릿 → 스크린 D)">
                <canvas ref={setupRef} width={360} height={130} className="w-full" />
              </SimCanvas>
              <SimCanvas label="스크린 간섭 무늬 (노란 눈금 = y)">
                <canvas ref={patternRef} width={360} height={90} className="w-full touch-none" />
              </SimCanvas>
            </div>
            <SimApparatusCaption structure="He-Ne 레이저 → 슬릿(단일/이중) → 거리 D 떨어진 스크린. 눈금자로 밝은 띠 간격 y를 측정해 λ=dy/D 계산.">
              <span>{mode === 'double' ? '이중 슬릿' : '단일 슬릿'}</span>
              <span>D = {D} cm</span>
              {part === 'p3' && <span>λ = {lambdaNm.toFixed(0)} nm</span>}
            </SimApparatusCaption>
          </div>
        }
        instruments={
          part === 'p3' ? (
            <div className="rounded bg-[#0a1a0a] p-3 text-center font-mono text-[#33ff33]">
              <p className="text-[10px] text-slate-400">λ = dy/D</p>
              <p className="text-xl">{lambdaNm.toFixed(0)} nm</p>
            </div>
          ) : undefined
        }
        liveControls={slitLiveControls}
        setupControls={slitSetupControls}
        dataSheet={
          part === 'p3' ? (
            <LabDataSheet
              title="λ 5회 측정"
              columns={[
                { key: 'y', label: 'y', unit: 'mm' },
                { key: 'D', label: 'D', unit: 'cm' },
                { key: 'lambda', label: 'λ', unit: 'nm' },
              ]}
              rows={lambdaLog}
              onDeleteRow={(i) => setLambdaLog((p) => p.filter((_, j) => j !== i))}
              onClearAll={() => setLambdaLog([])}
              calcMapping={{ 'double-slit-lambda': { d: 'y', y: 'y', D: 'D' } }}
              theoryValue={636}
              theoryLabel="636nm"
            />
          ) : undefined
        }
      />
      <div className="mt-4">
        <SimReadout
          items={
            part === 'p3'
              ? [
                  { label: 'λ 평균', value: lambdaLog.length > 0 ? `${(lambdaLog.reduce((s, r) => s + r.lambda, 0) / lambdaLog.length).toFixed(0)} nm` : '—' },
                  { label: '636nm 오차', value: lambdaLog.length > 0 ? `${((Math.abs(lambdaLog.reduce((s, r) => s + r.lambda, 0) / lambdaLog.length - 636) / 636) * 100).toFixed(1)}%` : '—' },
                  { label: '측정', value: `${lambdaLog.length}/5회` },
                ]
              : part === 'p2'
                ? [
                    { label: '슬릿폭 a', value: `${a} mm` },
                    { label: '무늬', value: '슬릿 넓을수록 무늬 넓어짐' },
                  ]
                : [
                    { label: '모드', value: mode === 'double' ? '이중 슬릿' : '단일 슬릿' },
                    { label: '관찰', value: mode === 'double' ? '조밀한 간섭 무늬' : '넓은 중심 띠' },
                  ]
          }
        />
      </div>
    </SimShell>
  )
}
