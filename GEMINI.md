# School Board — 안티그라비티 지침 및 개발 원칙

이 파일은 `school-board` 프로젝트 작업 시 에이전트가 항상 최우선으로 지켜야 하는 작업 규칙과 원칙을 정의합니다.

---

## 🎨 핵심 UI 디자인 절대 원칙 (Strict Design System)

1. **원색(Pure Primary) 및 화려한 AI 스타일 그라데이션 일절 금지**
   - 원색, 네온 컬러, 과도한 보라/핑크 그라데이션, 인위적 블러(glassmorphism)를 엄격히 금지합니다.
   - Tailwind의 `slate`, `neutral`, `zinc` 계열의 차분한 모노톤을 메인 베이스로 사용합니다.
   - 포인트 컬러가 필요한 경우 튀지 않는 차분한 딥 네이비/슬레이트(`slate-800` 또는 절제된 `indigo-900/slate-900`) 1가지만 미세하게 사용합니다.

2. **호흡이 긴 여백 (Generous Spacing)**
   - 컴포넌트와 카드 내외부에 충분한 패딩(`p-6` ~ `p-10`)과 마진, 섹션 간격(`py-16` ~ `py-24`, `space-y-8`)을 확보하여 답답하지 않고 모던하며 세련된 호흡을 유지합니다.

3. **미세한 테두리와 은은한 톤 차이로 경계 구분 (No Heavy Shadows)**
   - 무겁고 둔탁한 그림자(`shadow-lg`, `shadow-xl`) 대신, 얇고 섬세한 테두리(`border border-slate-100` 또는 `border border-slate-200/60`)와 미세한 배경 명도 차이(`bg-slate-50`과 `bg-white`)로 카드의 깊이감을 표현합니다.

4. **가독성과 세련미를 살린 타이포그래피**
   - 본문 텍스트는 쨍하고 자극적인 검정이 아닌 차분한 `text-slate-600` 계열을 사용하여 눈의 피로를 낮추고 가독성을 극대화합니다.
   - 제목 및 헤딩은 `text-slate-900`의 단정한 볼드 웨이트를 사용하고, 부가 설명은 `text-slate-400` ~ `text-slate-500`을 적용합니다.
   - 폰트는 오직 **Pretendard** 단일 패밀리, 아이콘은 **Lucide Icons**만 사용합니다.

---

## 1. 운영 및 개발 원칙
1. **문서 동기화 원칙 (Docs First)**: 모든 작업 전 `docs/` 검토 및 코드 반영 즉시 문서 갱신.
2. **한 번에 한 단계(Step) 원칙**: S0 -> S1 -> S2... 순차적 구현 및 QA 게이트 검증.
3. **로컬 스토리지 전면 배제**: 영속 데이터는 반드시 Supabase PostgreSQL 및 Storage에 저장.
4. **계층 분리**: UI -> Custom Hooks -> Service Layer -> Supabase Client.
5. **이미지 자동 압축**: 브라우저 캔버스/라이브러리에서 1600px/80% 압축(300KB 이하) 후 업로드.
