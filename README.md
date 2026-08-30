# 일물실 — 전자기학 실험 위키

일반물리실험2 전자기학 실험의 개념, 실험 방법, 실험서 원문, 계산기를 한곳에 모은 학습 사이트입니다.

## 기능

- **10단원 위키**: 등전위선, RC회로, 휘트스톤 브리지, 솔레노이드·변압기, 자기이력, 자기유도, RLC, 브루스터각, 이중슬릿, 창의실험
- **실험서 원문 이미지**: PDF에서 추출한 PNG 페이지
- **단원별 계산기**: 실험 중 측정값을 입력해 공식 결과를 즉시 확인
- **Scroll-expand UI**: React Bits 스타일의 스크롤 확장 히어로

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

### 1. 저장소 생성 및 푸시

```bash
git init
git add .
git commit -m "Initial commit: 일물실 위키 사이트"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```

### 2. base 경로 설정

`vite.config.ts`의 `base` 값을 **저장소 이름**에 맞게 수정하세요:

```ts
base: process.env.GITHUB_PAGES === 'true' ? '/<저장소명>/' : '/',
```

### 3. GitHub Pages 활성화

1. 저장소 → **Settings** → **Pages**
2. **Source**: GitHub Actions
3. `main` 브랜치에 push하면 자동 배포됩니다.

**배포 URL:** https://jajungi.github.io/physical/

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Framer Motion (scroll-expand)
- KaTeX (수식 렌더링)
- React Router

## 콘텐츠 출처

- `[전자기학실험서]-png-Images/` 실험서 PNG
- `퀴즈대비/단원별_개념_및_실험방법.md`
