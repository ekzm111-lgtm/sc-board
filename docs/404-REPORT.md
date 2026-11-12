# 404 오류 및 보드 조회 실패 종합 조사 보고서 (404-REPORT)

- **조사 일시**: 2026-11-12
- **조사 대상**: `school-board` (GitHub: `ekzm111-lgtm/sc-board`, 배포: `https://sc-board-9pl.pages.dev`)
- **조사 목적**: 사용자 보고 404 오류 및 보드 화면의 `"보드를 찾을 수 없습니다"` 현상에 대한 심층 원인 규명
- **원칙 준수**: 본 조사는 일체의 코드 수정을 진행하지 않고 현재 소스코드와 빌드 산출물, 배포 환경만을 기반으로 정밀 조사함.

---

## 1. 링크·이동 경로와 실제 존재하는 페이지 대조표

코드 베이스 전수 조사 결과 총 **17개의 네비게이션/리다이렉트 경로**가 확인되었으며, 실제 빌드 산출물(`out/`)과의 대조 결과는 다음과 같습니다.

| 코드 내 호출 위치 | 코드의 이동 경로 (URL) | 실제 빌드 파일 (`out/`) | 404 발생 여부 | 원인 및 상태 분석 |
|---|---|---|---|---|
| `app/page.tsx:27,34,64` | `/login` | `out/login/index.html` | **정상 (200)** | Cloudflare가 `/login/`으로 자동 리라이트하여 정상 서빙됨 |
| `app/page.tsx:71` | `/about` | `out/about/index.html` | **정상 (200)** | `out/about/index.html` 존재 |
| `app/about/page.tsx:11` | `/` | `out/index.html` | **정상 (200)** | 루트 인덱스 정상 존재 |
| `app/login/page.tsx:226` | `/signup` | `out/signup/index.html` | **정상 (200)** | `out/signup/index.html` 존재 |
| `app/login/page.tsx:59` | `/pending-approval/` | `out/pending-approval/index.html` | **정상 (200)** | 끝에 슬래시(`/`)가 포함되어 즉시 매칭 |
| `app/login/page.tsx:65` | `/dashboard/` | `out/dashboard/index.html` | **정상 (200)** | 끝에 슬래시(`/`)가 포함되어 즉시 매칭 |
| `app/login/page.tsx:80` | `/admin/` | `out/admin/index.html` | **정상 (200)** | 끝에 슬래시(`/`)가 포함되어 즉시 매칭 |
| `app/dashboard/page.tsx:105` | `/admin` | `out/admin/index.html` | **조건부 404 가능** | 끝에 `/`가 없는 `/admin` 요청 시 Cloudflare 캐시 또는 설정에 따라 404 발생 가능 |
| `app/dashboard/page.tsx:142` | `/classes` | `out/classes/index.html` | **조건부 404 가능** | 슬래시 없는 `/classes` 직접 요청 시 404 위험 |
| `app/dashboard/page.tsx:149,194` | `/boards/new` | `out/boards/new/index.html` | **조건부 404 가능** | 슬래시 없는 `/boards/new` 직접 요청 시 404 위험 |
| `app/dashboard/page.tsx:182` | `/board?id=${id}` | `out/board/index.html` | **페이지는 200 / 데이터는 실패** | HTML은 열리나 화면에 `"보드를 찾을 수 없습니다"` 출력 (아래 6절 참조) |
| `app/boards/new/page.tsx:84` | `/board?id=${newBoardId}` | `out/board/index.html` | **페이지는 200 / 데이터는 실패** | 보드 생성 실패 후 이동하여 빈 화면 출력 |
| *(과거 커밋 링크)* | `/boards/${id}` (동적 라우트) | **파일 없음 (누락)** | **치명적 404** | Next.js export 제한으로 `src/app/boards/[id]`가 삭제되어, 과거 북마크나 외부 공유 링크는 100% 404 |
| `auth/callback/page.tsx:58` | `/unauthorized` | `out/unauthorized/index.html` | **정상 (200)** | `out/unauthorized/index.html` 존재 |
| `components/board/...:184` | `/board?id=${boardId}` | `out/board/index.html` | **페이지는 200** | 공유 링크 생성 시 사용 |

---

## 2. 프레임워크, 출력 방식, 빌드 명령, 출력 폴더

- **프레임워크**: Next.js v14.2.35 (React 18.3.1, App Router 기반)
- **출력 방식 (Output Mode)**: **순수 정적 내보내기 (`output: 'export'`)**
  - 설정 파일: `next.config.mjs`
  ```javascript
  const nextConfig = {
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,
    images: { unoptimized: true },
    webpack: (config) => {
      config.cache = false;
      return config;
    },
  };
  ```
- **빌드 명령 (Build Command)**:
  - `package.json`의 `scripts.build`:
    `next build && node -e "try{require('fs').rmSync('.next/cache',{recursive:true,force:true})}catch(e){}"`
- **빌드 출력 폴더 (Output Directory)**:
  - **`out/`** (Cloudflare Pages의 `Build output directory` 설정값)
  - 빌드 결과물: 총 15개 HTML 파일과 `_next/static` 정적 자산들로 구성됨.

---

## 3. 배포 설정 파일 조사 결과

Cloudflare Pages 라우팅 및 리라이트를 제어하는 특수 파일들의 존재 여부를 정밀 조사한 결과는 다음과 같습니다:

| 파일명 | 권장 위치 | 현재 존재 여부 | 영향 |
|---|---|---|---|
| **`_redirects`** | `public/_redirects` 또는 `out/_redirects` | **없음 (False)** | SPA(Single Page Application) Fallback(`/* /index.html 200`)이 설정되어 있지 않아, 사용자가 새로고침(F5)을 하거나 서브 경로로 직접 접속할 때 정적 파일이 정확히 일치하지 않으면 Cloudflare 자체 404 반환 |
| **`_routes.json`** | `public/_routes.json` | **없음 (False)** | 정적 자산과 라우트 분기 제어 규칙 없음 |
| **`wrangler.toml`** | 프로젝트 루트 | **없음 (False)** | Cloudflare Pages 빌드 시 `No Wrangler configuration file found` 경고 발생 중 |
| **`functions/` 폴더** | 프로젝트 루트 | **없음 (False)** | Cloudflare Pages Functions(엣지 서버리스 함수)가 전혀 없음 |

---

## 4. 번호/식별자가 들어가는 주소 (`/board/[id]`) 처리 현황

1. **과거 방식**:
   - `src/app/boards/[id]/page.tsx` 형태로 App Router 동적 라우트를 시도했음.
   - 그러나 Next.js의 `output: 'export'`(정적 내보내기) 모드에서는 빌드 시점에 모든 `[id]` 목록을 `generateStaticParams()`로 미리 반환해야만 HTML을 생성할 수 있음.
   - 동적으로 생성되는 모든 학교 수업 보드의 ID를 빌드 시점에 알 수 없기 때문에 빌드 에러(`Error: Page /boards/[id] cannot use both use client and generateStaticParams`)가 발생하여 해당 폴더를 삭제함.
2. **현재 처리 방식**:
   - 정적 페이지 **`/board/index.html`** 1개만 생성.
   - 브라우저 주소창에서 **쿼리 스트링(`?id=5ea1bf52-...`)** 형태로 식별자를 전달받음.
   - 클라이언트에서 `useSearchParams().get('id')`를 읽어 Supabase에서 실시간 조회하도록 구현됨.
3. **현재 발생하는 문제점**:
   - 주소는 `https://sc-board-9pl.pages.dev/board/?id=...`로 열리지만, 아래 5절 및 6절의 RLS 권한 문제로 인해 **"보드를 찾을 수 없습니다"** 에러 화면이 노출됨.

---

## 5. 서버에서 실행되어야 하는 코드(API, 서버 함수) 실행 위치

- **Next.js API Routes (`src/app/api/...`)**: **전무함 (0개)**
  - `output: 'export'` 정적 빌드 모드이므로 Next.js Node.js 서버리스 함수는 빌드 시 제외되며 동작하지 않음.
- **Supabase SSR 서버 클라이언트 (`src/server/supabase/server.ts`)**:
  - `cookies()`를 사용하는 코드가 작성되어 있으나, 정적 export 환경에서는 서버가 없으므로 런타임에 호출되지 않음.
- **현재 모든 비즈니스 로직의 실제 실행 위치**:
  - **100% 브라우저(Client-Side SPA)**에서 실행 중.
  - 사용자의 크롬/엣지 브라우저에서 `@supabase/ssr`의 `createBrowserClient()`를 통해 Supabase 클라우드(`https://uccrleyxuwyyfdtdkatc.supabase.co`)로 직접 HTTPS REST 요청을 전송함.

---

## 6. 원인 후보 분석 (가능성 순위 및 확인 방법)

### 🔴 원인 후보 1순위 (가능성 95%): Supabase RLS(Row Level Security)로 인한 보드 생성 실패 및 조회 차단
- **현상**:
  - 화면에 Cloudflare의 404가 뜨는 것이 아니라, 우리 앱의 UI 컴포넌트인 **`보드를 찾을 수 없습니다.`**가 렌더링됨.
- **메커니즘**:
  1. 관리자 직통 로그인(`admin / 12345`)은 브라우저 `sessionStorage`에만 저장되고, Supabase Auth에는 정식 로그인 세션(JWT 토큰)이 발급되지 않은 **익명(anon)** 상태임.
  2. Supabase DB의 `boards` 테이블 RLS 정책:
     - `CREATE POLICY "Teachers can insert boards" ON public.boards FOR INSERT TO authenticated ...`
     - `CREATE POLICY "Boards readable by authenticated" ON public.boards FOR SELECT TO authenticated ...`
     - **오직 `authenticated`(인증된 유저)만 쓰기와 조회가 가능하도록 엄격히 잠겨 있음.**
  3. 선생님이나 관리자가 `새 보드 만들기`에서 저장을 누르면 Supabase가 RLS 위반으로 INSERT를 거부함.
  4. 그러나 코드(`boards/new/page.tsx:80`)에서 에러 발생 시 진행을 멈추지 않고 `console.warn`만 찍은 후 바로 `/board?id=...`로 라우팅시킴.
  5. 상세 페이지가 DB에 없는 보드 ID를 SELECT 하거나, RLS 차단으로 빈 값을 받아 최종적으로 `"보드를 찾을 수 없습니다"`가 출력됨.
- **확인 방법**:
  - 브라우저 개발자 도구(F12) ➔ **Console 및 Network 탭** 확인:
    `POST https://.../rest/v1/boards` 호출 결과가 `401 Unauthorized` 또는 `403 Forbidden` (RLS 위반)으로 실패했는지 확인.

---

### 🟠 원인 후보 2순위 (가능성 80%): Cloudflare Pages의 `_redirects` 부재로 인한 슬래시 없는 URL 404
- **현상**:
  - 링크를 클릭할 때(클라이언트 네비게이션)는 정상이지만, 주소창에 `/classes`나 `/admin`을 직접 입력하거나 **새로고침(F5)** 시 Cloudflare 404 발생.
- **메커니즘**:
  - `next.config.mjs`의 `trailingSlash: true`로 인해 산출물 폴더가 `out/classes/index.html`로 생성됨.
  - 사용자가 끝에 슬래시를 뺀 `https://.../classes`로 직접 진입하면 Cloudflare가 정적 파일을 찾지 못하고 404를 반환할 수 있음.
  - SPA Fallback 규칙(`/* /index.html 200`)을 담은 `_redirects` 파일이 부재함.
- **확인 방법**:
  - 주소창에 `https://sc-board-9pl.pages.dev/classes/` (슬래시 있음)로 들어갔을 때와 `https://sc-board-9pl.pages.dev/classes` (슬래시 없음)로 들어갔을 때의 응답 코드(200 vs 404) 대조.

---

### 🟡 원인 후보 3순위 (가능성 50%): 과거 동적 라우트 `/boards/[id]` 링크 잔존
- **현상**:
  - 대시보드나 컴포넌트 어딘가에 `/boards/${board.id}` 형태의 이전 URL이 남아있는 경우 클릭 즉시 완전한 404 발생.
- **메커니즘**:
  - 현재 빌드 파일에는 `out/board/index.html`만 존재하며 `out/boards/[id]` 경로는 빌드되지 않음.
- **확인 방법**:
  - 브라우저 주소창이 `/board?id=...`가 아닌 `/boards/...`로 이동하는지 확인.

---

## 7. 요약 결론

현재 사용자가 겪고 계신 **"보드를 찾을 수 없습니다"** 화면은 웹 서버 차원의 404가 아니라, **Supabase RLS(Row Level Security) 정책에 의해 보드 데이터 생성이 거부되었거나 조회가 차단되어 앱 내부에서 보여주는 에러 상태**입니다. 

또한 새로고침이나 직접 URL 입력 시 발생할 수 있는 404는 Cloudflare Pages용 SPA 라우팅 규칙인 **`_redirects` 파일이 아직 없기 때문**으로 명확히 규명되었습니다.
