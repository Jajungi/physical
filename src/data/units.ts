import type { Unit } from '../types'

const MU0 = 4 * Math.PI * 1e-7

const img = (unit: number, page: number) => `${import.meta.env.BASE_URL}images/unit-${unit}/page-${page}.png`

export const units: Unit[] = [
  {
    id: 1,
    slug: 'equipotential-line',
    title: '등전위선',
    englishTitle: 'Equipotential Line',
    week: 4,
    summary: '수조에서 검류계 = 0인 점을 찾아 등전위선을 그리고, 전기장이 등전위선에 수직임을 확인한다.',
    heroImage: img(1, 6),
    concepts: [
      { term: '전기장', description: 'E = F/q — 단위 전하당 받는 힘' },
      { term: '전위', description: '단위 전하당 위치에너지' },
      { term: '등전위선', description: '같은 전위를 갖는 점들의 연결 (2D)' },
      { term: '관계', description: 'V = −∫E·dl, E = −(dV/dl)n' },
      { term: '방향', description: '전기장 ⟂ 등전위선, 고전위 → 저전위' },
      { term: '등전위선 따라 이동', description: '필요한 일 = 0' },
    ],
    formulas: [
      'E = F/q',
      'V = −∫ E·dl',
      'E = −(dV/dl) n',
      'E \\approx |\\Delta V / \\Delta l|',
    ],
    method: [
      '수조를 수평으로 맞추고 전도성 용액(물)을 채운다.',
      'PC + SSI Equipotential Line Experiments V1.0을 실행한다.',
      '이동 검침봉으로 검류계 = 0인 (x,y) 좌표를 기록한다.',
      '고정점 1개당 약 10점 → 등전위선 1개를 완성한다.',
      '전극 5종에 대해 각각 10개 이상의 등전위선을 측정한다.',
      '이론 등전위선과 비교하고 E를 계산한다.',
    ],
    materials: [
      '등전위선 실험장치 (수조판 400×270×25 mm, 전극 5종)',
      'RS232-USB 케이블, 멀티미터, 노트북',
    ],
    quizChecks: [
      '등전위선 ⟂ 전기장',
      '검류계 0 = 같은 전위',
      '등전위선 따라 일 = 0',
      '탄소종이 vs 물 방법의 장단점',
      '가장자리 전극이 띄엄띄엄인 이유 (경계 효과)',
    ],
    references: [
      { label: '전기장과 전위 — Khan Academy', url: 'https://ko.khanacademy.org/science/physics/electric-charge-electric-force-and-voltage' },
      { label: '등전위면 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%93%B1%EC%A0%84%EC%9C%84' },
    ],
    advanced: [
      '2차원 수조 실험은 3차원 전기장·자기장·중력장 분포를 직관적으로 이해하는 모델이다.',
      '등전위선이 촘촘할수록 전기장이 강하다 — E ≈ |ΔV/Δl|로 정량화할 수 있다.',
      '경계 조건: 도체 표면은 등전위면이며, 전기장은 표면에 수직이다.',
    ],
    images: [6, 7, 8, 9, 10, 11, 12, 13].map((p) => img(1, p)),
    calculators: [
      {
        id: 'electric-field',
        title: '전기장 세기',
        description: '힘과 시험전하로 전기장 E를 계산합니다.',
        formula: 'E = F / q',
        inputs: [
          { id: 'F', label: '힘 F', unit: 'N', defaultValue: 1e-6, step: 1e-7 },
          { id: 'q', label: '시험전하 q', unit: 'C', defaultValue: 1e-9, step: 1e-10 },
        ],
        compute: (v) => ({
          E: { label: '전기장 E', value: v.F / v.q, unit: 'N/C' },
        }),
      },
      {
        id: 'field-from-potential',
        title: '전위차로부터 전기장',
        description: '인접 등전위선 사이 전위차와 거리로 E를 근사합니다.',
        formula: 'E ≈ |ΔV / Δl|',
        inputs: [
          { id: 'dV', label: '전위차 ΔV', unit: 'V', defaultValue: 1, step: 0.1 },
          { id: 'dl', label: '수직 거리 Δl', unit: 'm', defaultValue: 0.01, step: 0.001 },
        ],
        compute: (v) => ({
          E: { label: '전기장 E', value: Math.abs(v.dV / v.dl), unit: 'V/m' },
        }),
      },
    ],
  },
  {
    id: 2,
    slug: 'ohms-law-rc',
    title: '옴의 법칙과 직류 RC 회로',
    englishTitle: "Ohm's Law & DC RC Circuit",
    week: 2,
    summary: '직렬·병렬에서 V=IR을 검증하고, RC 회로 충·방전으로 τ=RC를 구한다.',
    heroImage: img(2, 14),
    concepts: [
      { term: '옴의 법칙', description: 'V = IR' },
      { term: '전력', description: 'P = IV = I²R' },
      { term: '직렬 저항', description: 'Req = R₁ + R₂ + …' },
      { term: '병렬 저항', description: '1/Req = 1/R₁ + 1/R₂ + …' },
      { term: '시간상수 τ', description: 'τ = RC' },
      { term: '충전 63%', description: 't = τ (1−e⁻¹ ≈ 0.63)' },
      { term: '방전 37%', description: 't = τ (e⁻¹ ≈ 0.37)' },
    ],
    formulas: [
      'V = IR',
      'Req(직렬) = R₁ + R₂',
      '1/Req(병렬) = 1/R₂ + 1/R₃',
      '충전: V(t) = ε(1 − e^(−t/RC))',
      '방전: V(t) = V₀ e^(−t/RC)',
      'τ = RC',
    ],
    method: [
      'Part A: Vs 0~5V, 5/12V 간격으로 V-I 측정 → 기울기 = 저항',
      '직렬 / 병렬 / 복합 회로 각각 측정 후 이론 Req와 비교',
      'Part B: R 200~300Ω, C 470~1000μF, 완전 방전 상태에서 시작',
      'Logger Pro / 오실로스코프로 V-t 기록',
      '충전 63%, 방전 37% 시점에서 τ 추출',
      'R, C를 바꿔 반복 → 측정 τ vs RC 비교',
    ],
    materials: ['직류전원 0~5V', '저항 50~300Ω', '콘덴서 100~1000μF', '전류계', 'LabQuest2 / 오실로스코프', '멀티미터'],
    quizChecks: [
      '직렬/병렬/복합 저항 공식',
      'τ = RC, 63%·37% 의미',
      'V-I 그래프 기울기 = R',
      '저항 색코드 읽기',
    ],
    references: [
      { label: 'RC 회로 — HyperPhysics', url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/electric/dccap.html' },
    ],
    advanced: [
      '샘플링 속도: τ가 0.005~0.3s이면 샘플링 ≥ 100/τ',
      'Logger Pro 추세선: A·e^(−Ct) + B에서 C ≈ 1/τ',
    ],
    images: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].map((p) => img(2, p)),
    calculators: [
      {
        id: 'ohms-law',
        title: '옴의 법칙',
        description: '전압·전류·저항 중 두 값으로 나머지를 계산합니다.',
        formula: 'V = IR',
        inputs: [
          { id: 'V', label: '전압 V', unit: 'V', defaultValue: 5, step: 0.1 },
          { id: 'I', label: '전류 I', unit: 'A', defaultValue: 0.01, step: 0.001 },
        ],
        compute: (v) => ({
          R: { label: '저항 R', value: v.V / v.I, unit: 'Ω' },
          P: { label: '전력 P', value: v.V * v.I, unit: 'W' },
        }),
      },
      {
        id: 'series-parallel',
        title: '직렬·병렬 합성 저항',
        description: '두 저항의 직렬·병렬 합성값을 계산합니다.',
        formula: 'Req(직렬) = R₁+R₂,  1/Req(병렬) = 1/R₁+1/R₂',
        inputs: [
          { id: 'R1', label: 'R₁', unit: 'Ω', defaultValue: 100, step: 10 },
          { id: 'R2', label: 'R₂', unit: 'Ω', defaultValue: 200, step: 10 },
        ],
        compute: (v) => ({
          series: { label: '직렬 Req', value: v.R1 + v.R2, unit: 'Ω' },
          parallel: { label: '병렬 Req', value: (v.R1 * v.R2) / (v.R1 + v.R2), unit: 'Ω' },
        }),
      },
      {
        id: 'rc-tau',
        title: 'RC 시간상수',
        description: 'R과 C로 시간상수 τ와 63%/37% 시점을 계산합니다.',
        formula: 'τ = RC',
        inputs: [
          { id: 'R', label: '저항 R', unit: 'Ω', defaultValue: 220, step: 10 },
          { id: 'C', label: '콘덴서 C', unit: 'μF', defaultValue: 470, step: 10 },
        ],
        compute: (v) => {
          const tau = v.R * (v.C * 1e-6)
          return {
            tau: { label: '시간상수 τ', value: tau, unit: 's' },
            charge63: { label: '충전 63% 시점', value: tau, unit: 's' },
            discharge37: { label: '방전 37% 시점', value: tau, unit: 's' },
          }
        },
      },
      {
        id: 'rc-voltage',
        title: 'RC 충·방전 전압',
        description: '시간 t에서의 충전/방전 전압을 계산합니다.',
        formula: 'V충전 = ε(1−e^(−t/RC)),  V방전 = V₀e^(−t/RC)',
        inputs: [
          { id: 'V0', label: '초기/공급 전압', unit: 'V', defaultValue: 5, step: 0.1 },
          { id: 'R', label: '저항 R', unit: 'Ω', defaultValue: 220, step: 10 },
          { id: 'C', label: '콘덴서 C', unit: 'μF', defaultValue: 470, step: 10 },
          { id: 't', label: '시간 t', unit: 's', defaultValue: 0.1, step: 0.01 },
        ],
        compute: (v) => {
          const tau = v.R * (v.C * 1e-6)
          const ratio = Math.exp(-v.t / tau)
          return {
            charge: { label: '충전 전압', value: v.V0 * (1 - ratio), unit: 'V' },
            discharge: { label: '방전 전압', value: v.V0 * ratio, unit: 'V' },
          }
        },
      },
    ],
  },
  {
    id: 3,
    slug: 'wheatstone-bridge',
    title: '휘트스톤 브리지',
    englishTitle: 'Wheatstone Bridge',
    week: 5,
    summary: '4저항 브리지에서 검류계 = 0 (평형)일 때 미지 저항 Rx를 구한다.',
    heroImage: img(3, 28),
    concepts: [
      { term: '평형 조건', description: 'VB = VD → 검류계 전류 0' },
      { term: '미지 저항', description: 'Rx = (R₂/R₁) Rk' },
      { term: '습동선', description: 'R₂/R₁ = l₂/l₁ = V_R2/V_R1' },
      { term: '비저항', description: 'ρ = RA/L' },
    ],
    formulas: ['Rx = (R₂/R₁) Rk = (l₂/l₁) Rk', 'ρ = R · A/L', 'Cu (20°C): 1.68×10⁻⁸ Ω·m', 'Fe (20°C): 1.00×10⁻⁷ Ω·m'],
    method: [
      '전원 2V, Rx 선택, 검류계 On',
      'Rk 조절 (알람 안 울리게, 중앙 근처 선호)',
      '습동접촉 조절 → 검류계 = 0',
      'V_R1, V_R2 기록 → Rx 계산',
      '멀티미터와 비교 → 상대오차',
      '(추가) 금속선 1m+ → 비저항으로 재질 판별',
    ],
    materials: ['전원 2V', 'Rk: 100Ω~20kΩ', '검류계 1μA', '습동선 10cm', '미지저항 12단'],
    quizChecks: [
      'Rx = (l₂/l₁) Rk',
      '평형 = 검류계 0',
      '가변저항 중앙에서 민감도 최대',
      '휘트스톤 vs 멀티미터 차이',
    ],
    references: [
      { label: '휘트스톤 브리지 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%ED%9C%98%ED%8A%B8%EC%8A%A4%ED%84%B4_%EB%B8%8C%EB%A6%AC%EC%A7%80' },
    ],
    advanced: [
      '변형저항(스트레인 게이지) 등 응용: 미세 저항 변화를 정밀 측정',
      '평형점 근처에서 민감도가 최대 — 가변저항을 중앙에 두는 이유',
    ],
    images: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37].map((p) => img(3, p)),
    calculators: [
      {
        id: 'wheatstone-rx',
        title: '미지 저항 Rx',
        description: '평형 조건에서 미지 저항을 계산합니다.',
        formula: 'Rx = (l₂/l₁) · Rk',
        inputs: [
          { id: 'l1', label: 'l₁', unit: 'cm', defaultValue: 5, step: 0.1 },
          { id: 'l2', label: 'l₂', unit: 'cm', defaultValue: 5, step: 0.1 },
          { id: 'Rk', label: 'Rk', unit: 'Ω', defaultValue: 1000, step: 10 },
        ],
        compute: (v) => ({
          Rx: { label: '미지 저항 Rx', value: (v.l2 / v.l1) * v.Rk, unit: 'Ω' },
        }),
      },
      {
        id: 'resistivity',
        title: '비저항',
        description: '저항, 단면적, 길이로 비저항 ρ를 계산합니다.',
        formula: 'ρ = R · A / L',
        inputs: [
          { id: 'R', label: '저항 R', unit: 'Ω', defaultValue: 0.1, step: 0.01 },
          { id: 'A', label: '단면적 A', unit: 'mm²', defaultValue: 1, step: 0.1 },
          { id: 'L', label: '길이 L', unit: 'm', defaultValue: 1, step: 0.1 },
        ],
        compute: (v) => ({
          rho: { label: '비저항 ρ', value: v.R * (v.A * 1e-6) / v.L, unit: 'Ω·m' },
        }),
      },
    ],
  },
  {
    id: 4,
    slug: 'solenoid-transformer',
    title: '솔레노이드 자기장과 변압기',
    englishTitle: 'Solenoid Magnetic Field & Transformer',
    week: 6,
    summary: '코일·솔레노이드 B 분포 측정 + 변압기 코어 종류별 기전력 비교.',
    heroImage: img(4, 38),
    concepts: [
      { term: '솔레노이드 (이상)', description: 'B = μ₀ n i (내부 균일)' },
      { term: '헬름홀츠', description: '두 코일 간격 = 반지름 a' },
      { term: '변압기', description: 'ε₂/ε₁ = N₂/N₁' },
      { term: '자속', description: '철심이 많을수록 누설↓, 효율↑' },
    ],
    formulas: [
      '원형코일 축상: B(z) = (μ₀Ni₀/2) · a²/(z²+a²)^(3/2)',
      '헬름홀츠 중심: B(0) = (4/5)^(3/2) · μ₀Ni₀/a',
      '솔레노이드(유한): B(z) = μ₀ni₀ · (cosα₁+cosα₂)/2',
      '변압기: ε₂ = (N₂/N₁) ε₁',
    ],
    method: [
      '원형코일: 0.5A, 1.0A, 1cm 간격 측정',
      '헬름홀츠: 간격=a, 직렬 연결, 0.5A/1.0A',
      '솔레노이드: ~0.2A, 1cm 간격',
      '변압기: AC 5V 60Hz, N₁=400, N₂=3200',
      '4종 코어 비교: 공심, 철심, U자, ㅁ자',
    ],
    materials: ['원형코일, 헬름홀츠 코일, 솔레노이드', '가우스미터', '변압기 4종', 'AC 전원 5V 60Hz'],
    safety: ['전류 3A 이하', '코일 과열 시 즉시 OFF'],
    quizChecks: ['B = μ₀ni', '헬름홀츠: 간격 = 반지름', 'ε₂/ε₁ = N₂/N₁', '철심 유무에 따른 V₂ 차이'],
    references: [
      { label: '헬름홀츠 코일 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%ED%97%AC%EB%A0%88%ED%99%80%EC%B8%A0_%EC%BD%94%EC%9D%BC' },
    ],
    advanced: ['균일 자기장: 헬름홀츠 코일, 긴 솔레노이드 내부', '철심은 자속을 집중시켜 변압기 효율을 높인다'],
    images: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53].map((p) => img(4, p)),
    calculators: [
      {
        id: 'solenoid-b',
        title: '솔레노이드 자기장',
        description: '권수 밀도 n과 전류 i로 B를 계산합니다.',
        formula: 'B = μ₀ · n · i',
        inputs: [
          { id: 'n', label: '권수 밀도 n', unit: 'turns/m', defaultValue: 1000, step: 100 },
          { id: 'i', label: '전류 i', unit: 'A', defaultValue: 0.2, step: 0.01 },
        ],
        compute: (v) => ({
          B: { label: '자기장 B', value: MU0 * v.n * v.i, unit: 'T' },
          B_mT: { label: '자기장 B', value: MU0 * v.n * v.i * 1000, unit: 'mT' },
        }),
      },
      {
        id: 'helmholtz-b',
        title: '헬름홀츠 코일 중심 자기장',
        description: '헬름홀츠 코일 중심에서의 B를 계산합니다.',
        formula: 'B(0) = (4/5)^(3/2) · μ₀Ni / a',
        inputs: [
          { id: 'N', label: '권수 N', unit: 'turns', defaultValue: 100, step: 1 },
          { id: 'i', label: '전류 i', unit: 'A', defaultValue: 0.5, step: 0.1 },
          { id: 'a', label: '반지름 a', unit: 'm', defaultValue: 0.05, step: 0.01 },
        ],
        compute: (v) => {
          const factor = Math.pow(4 / 5, 1.5)
          const B = factor * MU0 * v.N * v.i / v.a
          return { B: { label: '자기장 B(0)', value: B, unit: 'T' } }
        },
      },
      {
        id: 'transformer',
        title: '변압기 기전력',
        description: '권수비로 2차 기전력을 계산합니다.',
        formula: 'ε₂ = (N₂/N₁) · ε₁',
        inputs: [
          { id: 'e1', label: '1차 기전력 ε₁', unit: 'V', defaultValue: 5, step: 0.1 },
          { id: 'N1', label: 'N₁', unit: 'turns', defaultValue: 400, step: 1 },
          { id: 'N2', label: 'N₂', unit: 'turns', defaultValue: 3200, step: 1 },
        ],
        compute: (v) => ({
          e2: { label: '2차 기전력 ε₂', value: (v.N2 / v.N1) * v.e1, unit: 'V' },
          ratio: { label: '권수비 N₂/N₁', value: v.N2 / v.N1, unit: '' },
        }),
      },
    ],
  },
  {
    id: 5,
    slug: 'hysteresis',
    title: '자기이력곡선',
    englishTitle: 'Magnetic Hysteresis',
    week: 9,
    summary: '솔레노이드 전류를 변화시키며 B-H(또는 I-B) 이력 루프를 그린다.',
    heroImage: img(5, 54),
    concepts: [
      { term: '자화', description: 'M = χm H' },
      { term: 'B와 H', description: 'B = μH, B = μ₀H + BM' },
      { term: '잔류자기 Br', description: 'H=0일 때 남는 B' },
      { term: '보자력 Hc', description: 'B=0이 되게 하는 역방향 H' },
      { term: '이력손실', description: '폐곡선 내부 면적 = 에너지 손실' },
      { term: '탈자', description: '가열(큐리온도↑) 또는 역자장 점감' },
    ],
    formulas: ['M = \\chi_m H', 'B = \\mu_0 n i + B_M'],
    method: [
      '가우스미터 2000G, 영점 조절',
      '철심 없이 전류 0→15→0 (양·음 극성) → I-B',
      '탈자 시킨 시료 삽입 → 동일 → 이력 폐곡선',
      '시료 2종 반복',
      '측정 후 즉시 스위치 OFF (과열)',
    ],
    materials: ['솔레노이드 Φ27mm, L75mm, N=800', '전류 0~3A (15단)', '가우스미터 0.1~2000G'],
    quizChecks: ['Br, Hc 정의', '이력손실 = 폐곡선 면적', '탈자 방법', '강자성체 vs 상/반자성체'],
    references: [
      { label: '자기이력 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%9E%90%EA%B8%B0%EC%9D%B4%EB%A0%A5' },
    ],
    advanced: [
      '상자성체: χm > 0, 반자성체: χm < 0, 강자성체: 비선형·이력',
      '변압기·모터 코어의 이력손실은 발열로 이어진다',
    ],
    images: [54, 55, 56, 57, 58, 59, 60, 61].map((p) => img(5, p)),
    calculators: [
      {
        id: 'magnetization',
        title: '자화와 B',
        description: '자화율과 H로 B를 계산합니다.',
        formula: 'B = \\mu_0(H + M),  M = \\chi_m \\cdot H',
        inputs: [
          { id: 'H', label: '자기장 H', unit: 'A/m', defaultValue: 1000, step: 100 },
          { id: 'chi', label: 'χm', unit: '', defaultValue: 1000, step: 100 },
        ],
        compute: (v) => {
          const M = v.chi * v.H
          const B = MU0 * (v.H + M)
          return {
            M: { label: '자화 M', value: M, unit: 'A/m' },
            B: { label: '자속밀도 B', value: B, unit: 'T' },
          }
        },
      },
      {
        id: 'solenoid-b-current',
        title: '솔레노이드 B (전류)',
        description: 'N=800, L=75mm 솔레노이드에서 B를 계산합니다.',
        formula: 'B = μ₀ · n · i',
        inputs: [
          { id: 'i', label: '전류 i', unit: 'A', defaultValue: 1, step: 0.1 },
        ],
        compute: (v) => {
          const n = 800 / 0.075
          const B = MU0 * n * v.i
          return { B: { label: '자기장 B', value: B, unit: 'T' }, B_G: { label: 'B (가우스)', value: B * 10000, unit: 'G' } }
        },
      },
    ],
  },
  {
    id: 6,
    slug: 'magnetic-induction',
    title: '자기유도 (전류천칭)',
    englishTitle: 'Magnetic Induction (Current Balance)',
    week: 10,
    summary: '자기장 속 전류 도선의 자기력 F=BIl로 솔레노이드 B를 역산한다.',
    heroImage: img(6, 62),
    concepts: [
      { term: '자기력 (전하)', description: 'F = qvB sinφ' },
      { term: '자기력 (전류)', description: 'F = BIl (B⊥l)' },
      { term: '솔레노이드', description: 'B = μ₀ n i' },
      { term: '토크 평형', description: 'Fd = mgs' },
    ],
    formulas: ['F = BIl', 'B = μ₀ n i', 'Fd = mgs  →  B = mgs / (I·d·l)'],
    method: [
      '천칭 수평 맞춤',
      '전류천칭은 저항박스와 직렬 (전원 직결 금지!)',
      '솔레노이드 전류 ~2A 고정',
      '추 걸고 천칭 전류 조절 → 수평 → Fd = mgs',
      '유효 도선 길이 l = 6가닥 합 (상3+하3)',
      '5개 홈 반복, 질량·전류 변경',
    ],
    materials: ['솔레노이드 Φ78mm, L120mm, N=550', '전류천칭', '저항박스', '추 0.12g, 0.15g, 0.21g 등'],
    safety: ['고전류 → 과열', '실험 안 할 때 전원 OFF', '저항박스 필수'],
    quizChecks: ['B = mgs/(Idl)', 'F = BIl', '저항박스 필수 이유', '와트 밸런스·킬로그램 재정의'],
    references: [
      { label: '앙페르의 법칙 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%95%99%ED%8E%98%EB%A5%B4%EC%9D%98_%EB%B2%95%EC%B9%99' },
    ],
    advanced: ['와트 밸런스: 전기력과 중력의 정밀 비교로 질량 단위 재정의에 활용'],
    images: [62, 63, 64, 65, 66, 67].map((p) => img(6, p)),
    calculators: [
      {
        id: 'magnetic-force',
        title: '자기력 F = BIl',
        description: '자기장, 전류, 도선 길이로 자기력을 계산합니다.',
        formula: 'F = B · I · l',
        inputs: [
          { id: 'B', label: '자기장 B', unit: 'T', defaultValue: 0.01, step: 0.001 },
          { id: 'I', label: '전류 I', unit: 'A', defaultValue: 2, step: 0.1 },
          { id: 'l', label: '도선 길이 l', unit: 'm', defaultValue: 0.05, step: 0.01 },
        ],
        compute: (v) => ({
          F: { label: '자기력 F', value: v.B * v.I * v.l, unit: 'N' },
          F_mN: { label: '자기력 F', value: v.B * v.I * v.l * 1000, unit: 'mN' },
        }),
      },
      {
        id: 'b-from-balance',
        title: '전류천칭으로 B 역산',
        description: '토크 평형 Fd = mgs에서 B를 구합니다.',
        formula: 'B = mgs / (I · d · l)',
        inputs: [
          { id: 'm', label: '질량 m', unit: 'g', defaultValue: 0.15, step: 0.01 },
          { id: 'd', label: '팔 길이 d', unit: 'm', defaultValue: 0.1, step: 0.01 },
          { id: 'I', label: '전류 I', unit: 'A', defaultValue: 2, step: 0.1 },
          { id: 'l', label: '도선 길이 l', unit: 'm', defaultValue: 0.05, step: 0.01 },
        ],
        compute: (v) => {
          const m_kg = v.m * 1e-3
          const F = m_kg * 9.81
          const B = (F * v.d) / (v.I * v.l)
          return {
            F: { label: '자기력 F', value: F, unit: 'N' },
            B: { label: '자기장 B', value: B, unit: 'T' },
            B_mT: { label: 'B', value: B * 1000, unit: 'mT' },
          }
        },
      },
    ],
  },
  {
    id: 7,
    slug: 'ac-rlc',
    title: '교류 RLC 회로',
    englishTitle: 'AC RLC Circuit',
    week: 11,
    summary: '오실로스코프로 RLC 위상·임피던스 측정, 공진 주파수를 찾는다.',
    heroImage: img(7, 68),
    concepts: [
      { term: '교류', description: 'ε = εM sin ωt, ω = 2πf' },
      { term: '감항', description: 'XL = ωL = 2πfL' },
      { term: '용항', description: 'XC = 1/(ωC) = 1/(2πfC)' },
      { term: '임피던스', description: 'Z = √(R² + (XL−XC)²)' },
      { term: '위상', description: 'φ = tan⁻¹((XL−XC)/R)' },
      { term: '공진', description: 'XL = XC → f = 1/(2π√(LC))' },
    ],
    formulas: [
      'XL = 2πfL',
      'XC = 1/(2πfC)',
      'Z = √(R² + (XL − XC)²)',
      'f_res = 1/(2π√(LC))',
      'rms × √2 = peak',
    ],
    method: [
      '멀티미터로 실제 R, L, C 측정',
      '초기: R=200Ω, L·C Short, Vs=4V, 200Hz → 위상 확인',
      '4가지 (L,C) 조합 × 주파수 스윕',
      '각 f에서 Vs, VR, VL, VC, iM, φ 기록',
      'XY 모드 리사주로 공진 확인',
    ],
    materials: ['RLC 회로 키트', '오실로스코프', '함수발생기', '멀티미터'],
    quizChecks: ['f = 1/(2π√(LC))', 'XL, XC, Z 공식', '공진 조건 XL = XC', 'rms ↔ peak 변환'],
    references: [
      { label: 'RLC 공진 — HyperPhysics', url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/electric/serres.html' },
    ],
    advanced: [
      'L: 전압이 전류보다 +90° 앞섬',
      'C: 전압이 전류보다 −90° 뒤짐',
      '공진 시 VR 최대, Vs와 VR 동위상 (리사주 직선)',
    ],
    images: [68, 69, 70, 71, 72, 73, 74, 75].map((p) => img(7, p)),
    calculators: [
      {
        id: 'reactance',
        title: '감항·용항',
        description: '주파수, L, C로 XL과 XC를 계산합니다.',
        formula: 'XL = 2πfL,  XC = 1/(2πfC)',
        inputs: [
          { id: 'f', label: '주파수 f', unit: 'Hz', defaultValue: 1000, step: 10 },
          { id: 'L', label: '인덕턴스 L', unit: 'mH', defaultValue: 10, step: 1 },
          { id: 'C', label: '콘덴서 C', unit: 'μF', defaultValue: 1, step: 0.1 },
        ],
        compute: (v) => {
          const XL = 2 * Math.PI * v.f * (v.L * 1e-3)
          const XC = 1 / (2 * Math.PI * v.f * (v.C * 1e-6))
          return {
            XL: { label: '감항 XL', value: XL, unit: 'Ω' },
            XC: { label: '용항 XC', value: XC, unit: 'Ω' },
          }
        },
      },
      {
        id: 'impedance',
        title: '임피던스 Z',
        description: 'R, XL, XC로 임피던스와 위상을 계산합니다.',
        formula: 'Z = √(R² + (XL−XC)²),  φ = atan((XL−XC)/R)',
        inputs: [
          { id: 'R', label: '저항 R', unit: 'Ω', defaultValue: 200, step: 10 },
          { id: 'XL', label: '감항 XL', unit: 'Ω', defaultValue: 100, step: 10 },
          { id: 'XC', label: '용항 XC', unit: 'Ω', defaultValue: 100, step: 10 },
        ],
        compute: (v) => {
          const diff = v.XL - v.XC
          const Z = Math.sqrt(v.R ** 2 + diff ** 2)
          const phi = (Math.atan2(diff, v.R) * 180) / Math.PI
          return {
            Z: { label: '임피던스 Z', value: Z, unit: 'Ω' },
            phi: { label: '위상 φ', value: phi, unit: '°' },
          }
        },
      },
      {
        id: 'resonance',
        title: '공진 주파수',
        description: 'L과 C로 공진 주파수를 계산합니다.',
        formula: 'f = 1 / (2π√(LC))',
        inputs: [
          { id: 'L', label: '인덕턴스 L', unit: 'mH', defaultValue: 10, step: 1 },
          { id: 'C', label: '콘덴서 C', unit: 'μF', defaultValue: 1, step: 0.1 },
        ],
        compute: (v) => {
          const L = v.L * 1e-3
          const C = v.C * 1e-6
          const f = 1 / (2 * Math.PI * Math.sqrt(L * C))
          return { f: { label: '공진 주파수 f', value: f, unit: 'Hz' } }
        },
      },
      {
        id: 'rms-peak',
        title: 'rms ↔ peak 변환',
        description: '실효값과 최대값을 변환합니다.',
        formula: 'V_peak = V_rms × √2',
        inputs: [
          { id: 'Vrms', label: '실효값 V_rms', unit: 'V', defaultValue: 4, step: 0.1 },
        ],
        compute: (v) => ({
          peak: { label: '최대값 V_peak', value: v.Vrms * Math.SQRT2, unit: 'V' },
        }),
      },
    ],
  },
  {
    id: 8,
    slug: 'brewster-angle',
    title: '브루스터 각',
    englishTitle: "Brewster's Angle",
    week: 12,
    summary: '반사광 ⊥ 굴절광이 되는 입사각에서 n = tan θp로 굴절률을 구한다.',
    heroImage: img(8, 76),
    concepts: [
      { term: '스넬 법칙', description: 'n₁ sin θ₁ = n₂ sin θ₂' },
      { term: '브루스터 각', description: '반사광 ⊥ 굴절광' },
      { term: '조건', description: 'θp + θ₂ = 90°' },
      { term: '굴절률', description: 'n₂/n₁ = tan θp' },
      { term: '편광', description: '반사광은 입사면 내 편광 성분만' },
    ],
    formulas: ['n₁ sin θ₁ = n₂ sin θ₂', 'n₂/n₁ = tan θp', '(공기 n₁=1) → n = tan θp'],
    method: [
      'LabQuest2 + Logger Pro, 조도·회전 센서',
      '편광판 90°, 조도센서 range 600',
      '5° 간격 20°~160° 측정',
      '예상 θp ±10° 범위, 2° 간격 정밀 측정',
      'n₂ = tan θp, 2θp로 프리즘 배치 검증',
    ],
    materials: ['레이저', '프리즘', '편광판', '회전 센서', '조도 센서', 'LabQuest2'],
    safety: ['레이저 정면 응시 금지', '안전 고글 착용'],
    quizChecks: ['n = tan θp', 'θp + θ₂ = 90°', '편광 선글라스 원리', '편광축 방향·확인법'],
    references: [
      { label: '브루스터 각 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%B8%8C%EB%A3%A8%EC%8A%A4%ED%84%B0_%EA%B0%81' },
    ],
    advanced: ['편광 선글라스: 수평 반사광(도로·물면)의 편광 성분을 차단'],
    images: [76, 77, 78, 79, 80, 81, 82, 83].map((p) => img(8, p)),
    calculators: [
      {
        id: 'snell',
        title: '스넬 법칙',
        description: '입사각과 굴절률로 굴절각을 계산합니다.',
        formula: 'n₁ sin θ₁ = n₂ sin θ₂',
        inputs: [
          { id: 'n1', label: 'n₁', unit: '', defaultValue: 1, step: 0.01 },
          { id: 'n2', label: 'n₂', unit: '', defaultValue: 1.5, step: 0.01 },
          { id: 'theta1', label: '입사각 θ₁', unit: '°', defaultValue: 30, step: 1 },
        ],
        compute: (v) => {
          const rad = (v.theta1 * Math.PI) / 180
          const sin2 = (v.n1 / v.n2) * Math.sin(rad)
          const theta2 = sin2 <= 1 ? (Math.asin(sin2) * 180) / Math.PI : NaN
          return { theta2: { label: '굴절각 θ₂', value: theta2, unit: '°' } }
        },
      },
      {
        id: 'brewster',
        title: '브루스터 각',
        description: '브루스터 각과 굴절률을 계산합니다.',
        formula: 'n = tan θp,  θp + θ₂ = 90°',
        inputs: [
          { id: 'theta_p', label: '브루스터 각 θp', unit: '°', defaultValue: 56, step: 0.5 },
        ],
        compute: (v) => {
          const rad = (v.theta_p * Math.PI) / 180
          const n = Math.tan(rad)
          return {
            n: { label: '굴절률 n', value: n, unit: '' },
            theta2: { label: '굴절각 θ₂', value: 90 - v.theta_p, unit: '°' },
          }
        },
      },
    ],
  },
  {
    id: 9,
    slug: 'double-slit',
    title: '영의 이중슬릿',
    englishTitle: "Young's Double Slit",
    week: 12,
    summary: '단일·이중 슬릿 간섭 무늬로 빛의 파동성을 확인, λ = dy/D로 파장을 계산한다.',
    heroImage: img(9, 84),
    concepts: [
      { term: '회절', description: '좁은 틈 → 파면 변형, 빛 확산' },
      { term: '단일 슬릿', description: 'a sin θ = λ (1차 암점)' },
      { term: '이중 슬릿', description: 'λ = dy/D (소각 근사)' },
      { term: '중첩', description: '경로차에 따라 보강·상쇄' },
      { term: '레이저', description: '적색 636 nm (비교 기준)' },
    ],
    formulas: ['단일 슬릿: a sin θ = λ', '이중 슬릿: λ = dy/D', 'λ = 2ay/D (각도 근사에 따라)'],
    method: [
      'Part 1: 레이저-격자 거리 10cm, 단일/이중 슬릿 비교',
      'Part 2: 슬릿 폭 0.04, 0.08, 0.16mm 단일 슬릿',
      'Part 3: 이중 0.04mm/0.50mm, D 측정',
      '밝은-어두운 간격 y, 5회 반복 평균',
      'λ = dy/D → 636nm와 오차(%)',
    ],
    materials: ['적색 레이저 (636 nm)', '단일/이중 슬릿', '스크린', '자'],
    safety: ['레이저 정면 응시 금지', '안전 고글'],
    quizChecks: ['λ = dy/D', '단일 vs 이중 무늬 차이', '슬릿 폭↑ → 무늬 넓어짐', '636 nm'],
    references: [
      { label: '영의 이중슬릿 — 위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%98%81%EC%9D%98_%EC%9D%B4%EC%A4%91%EC%8A%AC%EB%A6%BF_%EC%8B%A4%ED%97%98' },
    ],
    advanced: ['CD/DVD 회절 → 트랙 간격 추정', '단일: 넓은 밝은 띠 + 어두운 띠, 이중: 조밀한 간섭 무늬'],
    images: [84, 85, 86, 87, 88, 89, 90, 91, 92, 93].map((p) => img(9, p)),
    calculators: [
      {
        id: 'double-slit-lambda',
        title: '이중슬릿 파장',
        description: '무늬 간격으로 파장 λ를 계산합니다.',
        formula: 'λ = d · y / D',
        inputs: [
          { id: 'd', label: '슬릿 간격 d', unit: 'mm', defaultValue: 0.5, step: 0.01 },
          { id: 'y', label: '무늬 간격 y', unit: 'mm', defaultValue: 2, step: 0.1 },
          { id: 'D', label: '거리 D', unit: 'cm', defaultValue: 10, step: 0.5 },
        ],
        compute: (v) => {
          const lambda = (v.d * 1e-3) * (v.y * 1e-3) / (v.D * 1e-2)
          const error = ((lambda - 636e-9) / 636e-9) * 100
          return {
            lambda: { label: '파장 λ', value: lambda * 1e9, unit: 'nm' },
            error: { label: '636nm 대비 오차', value: error, unit: '%' },
          }
        },
      },
      {
        id: 'single-slit',
        title: '단일슬릿 회절',
        description: '슬릿 폭과 각도로 파장을 계산합니다.',
        formula: 'a sin θ = λ',
        inputs: [
          { id: 'a', label: '슬릿 폭 a', unit: 'mm', defaultValue: 0.08, step: 0.01 },
          { id: 'theta', label: '각도 θ', unit: '°', defaultValue: 0.5, step: 0.1 },
        ],
        compute: (v) => {
          const rad = (v.theta * Math.PI) / 180
          const lambda = (v.a * 1e-3) * Math.sin(rad)
          return { lambda: { label: '파장 λ', value: lambda * 1e9, unit: 'nm' } }
        },
      },
    ],
  },
  {
    id: 10,
    slug: 'creative-experiment',
    title: '창의실험',
    englishTitle: 'Creative Experiment',
    week: 13,
    summary: '전자기학·광학 자유 주제 — 이론 → 가설 → 실험 → 검증.',
    heroImage: img(10, 94),
    concepts: [
      { term: '가설', description: '검증 가능한 예측을 명시' },
      { term: '실험 설계', description: '회로도·광학 배치·측정 변수 정의' },
      { term: '데이터 분석', description: '이론값과 비교, 오차 분석' },
      { term: '검증', description: '가설 채택/기각 및 결론' },
    ],
    formulas: ['앞 단원 공식을 자유롭게 조합하여 활용'],
    method: [
      '주제 선정 + 이론적 고찰',
      '가설 명시',
      '실험 설계 (회로도·광학 배치)',
      '데이터 수집',
      '가설 검증 + 결론',
    ],
    materials: ['앞 단원 장비 (오실로스코프, 코일, 레이저, RLC 키트 등)'],
    quizChecks: ['가설-실험-검증 구조', '앞 단원 장비 활용'],
    references: [
      { label: '무선 전송 예시: 헬름홀츠 코일 송·수신', url: undefined },
      { label: 'RLC 필터: 저역/고역 통과', url: undefined },
    ],
    advanced: [
      '무선 전송: 헬름홀츠 코일 송·수신, 모스 부호',
      'RLC 필터: 저역/고역 통과, 주파수 특성 vs 이론',
      '광학: 프리즘·편광판·회절격자, 다양한 광원',
    ],
    images: [94, 95, 96, 97, 98, 99, 100, 101, 102].map((p) => img(10, p)),
    calculators: [],
  },
]

export function getUnitBySlug(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug)
}

export function getUnitById(id: number): Unit | undefined {
  return units.find((u) => u.id === id)
}
