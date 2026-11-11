import { APP_CONFIG } from "@/config/constants";
import { BookOpen, ShieldCheck, Users, Sparkles, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              대
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                {APP_CONFIG.DEFAULT_SCHOOL_NAME}
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                School Board
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              학교 구글 로그인
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            외부인 차단 · 학급 전용 클라우드 협업 보드
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            선생님과 학생이 안심하고 쓰는<br />
            <span className="text-indigo-600">서귀포대신중학교 맞춤형 패들릿</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            비싼 상용 유료 플랜 없이, 복잡한 학생 가입 없이 학교 구글 계정으로 바로 연결됩니다.<br />
            실시간 수업 참여, 읽기 전용 보드 잠금, 불건전 게시물 차단 기능까지 완벽 지원합니다.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              학교 계정으로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all"
            >
              사용 안내 및 특장점
            </Link>
          </div>
        </div>

        {/* 3대 핵심 특장점 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              외부인 완전 차단 & 승인제
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              사전 등록된 학생과 승인된 교원만 접근할 수 있어 교육 활동의 안전성이 보장됩니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              수업 통제 & 보드 잠금
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              수업 종료 시 클릭 한 번으로 읽기 전용 잠금 처리하고, 교사 승인 후 게시 옵션을 제공합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              자동 이미지 최적화 & 영속 저장
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              고용량 사진도 300KB 이하로 자동 압축하여 학교 무료 쿼터를 안전하게 보호하고 데이터는 영구 보존됩니다.
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {APP_CONFIG.DEFAULT_SCHOOL_NAME} 협업 보드 플랫폼. 교육 목적으로 제작되었습니다.
        </div>
      </footer>
    </div>
  );
}
