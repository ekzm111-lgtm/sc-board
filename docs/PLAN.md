# 개발 실행 계획서 (Development Plan)

본 문서는 학교용 패들릿 애플리케이션의 단계별(S0 ~ S11) 구현 순서와 산출물, 검증 게이트(QA Checklist)를 정의합니다.

---

## 1. 단계별 실행 로드맵

| 단계 | 목표 | 주요 작업 및 산출물 | 검증 기준 (QA Gate) |
|---|---|---|---|
| **S0** | 프로젝트 기반 구성 | - Next.js 14+ (App Router, TS, Tailwind) 초기화<br>- 환경변수 템플릿(`.env.example`) 및 Supabase 클라이언트 세팅<br>- Pretendard 폰트 및 디자인 시스템 기본 토큰 설정<br>- 기본 레이아웃 및 디렉토리 구조 확립 | - `npm run build` 에러 없음<br>- ESLint/TypeScript 통과<br>- Pretendard 및 Tailwind 토큰 적용 확인 |
| **S1** | 데이터베이스 & Auth 기초 | - Supabase SQL 마이그레이션 파일 작성 및 적용<br>- 구글 OAuth 및 회원 상태(교사 승인/학생 매칭) 로직 구현<br>- 미승인 교사 / 초대받지 않은 학생 차단 화면 | - Supabase 마이그레이션 적용 성공<br>- 로그인 세션 유지 및 역할별 라우트 가드 동작 |
| **S2** | 교사 관리자 & 학급 관리 | - 교사 대시보드 (학급 목록, 보드 목록)<br>- 학급 생성 및 학생 초대 명단(CSV/입력) 등록 기능<br>- 관리자 교사 승인 페이지 | - 학급 CRUD 정상 동작<br>- 학생 초대 명단 DB 저장 및 이메일 매칭 테스트 |
| **S3** | 보드(Padlet) 코어 및 레이아웃 | - 보드 생성 모달 (레이아웃 선택: Shelf, Wall, Canvas)<br>- 보드 헤더 (잠금 버튼, 승인제 토글, 설정)<br>- Shelf(컬럼형) 및 Wall(그리드) 뷰 뼈대 | - 보드 생성 및 메타데이터 DB 저장<br>- 권한(교사/학생)에 따른 설정 버튼 노출 제어 |
| **S4** | 포스트잇 작성 및 편집 | - 포스트 모달 및 인라인 작성 폼<br>- 마크다운 서식 지원, 배경 컬러 팔레트<br>- 브라우저 이미지 압축(1600px/80%) 후 업로드 | - 포스트 생성/수정/삭제 RLS 권한 검증<br>- 10MB 이미지 업로드 시 300KB 이하로 자동 압축 저장 확인 |
| **S5** | 첨부파일 통합 (Attachments) | - 웹 링크 입력 시 OpenGraph 미리보기 생성<br>- 유튜브 링크 자동 임베드 렌더링<br>- 일반 파일 다운로드 링크 카드 | - 유효한/무효한 URL 파싱 테스트<br>- 첨부 타입별(이미지, 링크, 유튜브, 파일) 렌더링 검증 |
| **S6** | 드래그 앤 드롭 정렬 (@dnd-kit) | - Shelf 컬럼 내 포스트 순서 변경<br>- 컬럼 간 포스트 이동<br>- 실수형 `position` 중간값 연산 반영 | - 모바일 터치 및 데스크톱 마우스 드래그 동작<br>- 순서 변경 시 DB 즉시 반영 및 새로고침 유지 |
| **S7** | 실시간 상호작용 (Realtime) | - Supabase Realtime 채널 구독<br>- 다른 사용자의 새 글/수정/삭제 실시간 반영<br>- 댓글(Comments) 및 반응(Reactions) 실시간 업데이트 | - 두 개 브라우저 창에서 동시 조작 시 1초 내 동기화 확인 |
| **S8** | 교사 수업 통제 기능 | - 보드 즉시 잠금(Lock) 시 학생 쓰기 입력 차단<br>- 학생 글 승인/반려 모달 및 대기 목록<br>- 포스트 상단 고정(Pin) | - 잠금 상태에서 학생 쓰기 API 차단 확인<br>- 미승인 글이 다른 학생에게 노출되지 않는지 확인 |
| **S9** | 안전 및 신고 시스템 | - 학생의 포스트 신고 모달 (사유 선택)<br>- 교사용 신고 관리 패널 (즉시 숨김, 삭제, 반려)<br>- 감사 로그 기록 | - 신고 제출 시 교사 화면에 경고 뱃지 표시<br>- 불건전 콘텐츠 즉시 가림 처리 확인 |
| **S10** | 보드 내보내기 및 최종 최적화 | - 보드 인쇄 및 PDF 저장 레이아웃 최적화<br>- 모바일 UI 다듬기, 접근성 및 성능 감사 | - 인쇄 미리보기에서 레이아웃 깨짐 없음<br>- Lighthouse 성능 및 접근성 점수 검증 |
| **S11** | 배포 및 실운영 인수인계 | - Cloudflare Pages / Vercel 배포 가이드<br>- 관리자 매뉴얼 및 교사용 간이 사용 설명서 작성 | - 퍼블릭 HTTPS 도메인에서 정상 작동 확인 |

---

## 2. 프로젝트 소스 코드 디렉토리 구조 (16-2장 기준)

```
school-board/
├── GEMINI.md
├── docs/
│   ├── PRD.md
│   ├── DB.md
│   ├── PLAN.md
│   ├── STATUS.md
│   ├── agents/
│   │   ├── builder.md
│   │   ├── qa.md
│   │   └── reviewer.md
│   └── reports/
├── supabase/
│   ├── migrations/
│   │   └── 20261111000000_init_schema.sql
│   └── seed.sql
├── public/
│   └── fonts/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (auth)/             # 로그인, 초대 대기 페이지
│   │   ├── (dashboard)/        # 교사/학생 대시보드
│   │   ├── boards/[id]/        # 보드 상세 페이지
│   │   ├── admin/              # 슈퍼 관리자 페이지
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # 공용 UI 컴포넌트
│   │   ├── ui/                 # 버튼, 모달, 인풋 등 원자 컴포넌트
│   │   └── common/             # 네비게이션, 헤더 등
│   ├── features/               # 도메인별 기능 분리
│   │   ├── auth/
│   │   ├── boards/
│   │   ├── posts/
│   │   ├── attachments/
│   │   ├── classes/
│   │   └── moderation/
│   ├── config/                 # 상수 및 환경변수
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── messages.ts
│   ├── lib/                    # 유틸리티 (이미지 압축, 포지셔닝 등)
│   │   ├── image-compressor.ts
│   │   ├── position.ts
│   │   └── utils.ts
│   ├── server/                 # 서버 액션 및 Supabase 클라이언트
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   └── styles/
│       ├── globals.css
│       └── tokens.css
├── package.json
└── tsconfig.json
```
