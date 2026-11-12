import { APP_CONFIG } from "@/config/constants";
import { BookOpen, ShieldCheck, Users, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-slate-200">
      {/* 상단 미니멀 네비게이션 */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-medium text-sm">
              대
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-slate-900 text-base tracking-tight">
                {APP_CONFIG.DEFAULT_SCHOOL_NAME}
              </span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                School Board
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200/60"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              관리자 로그인
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 (호흡이 긴 여백과 정갈한 모노톤) */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 sm:py-32 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/70 text-xs text-slate-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            외부인 차단 · 학급 전용 클라우드 협업 보드
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.2]">
            학교 현장을 위한<br />
            차분하고 안전한 협업 보드
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            복잡한 학생 가입 없이 학교 계정으로 바로 연결됩니다.<br className="hidden sm:inline" />
            수업 즉시 잠금, 승인 후 게시, 자동 이미지 최적화로 수업의 몰입을 돕습니다.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
            >
              학교 계정으로 시작하기
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all"
            >
              사용 안내 및 특장점
            </Link>
          </div>
        </div>

        {/* 3대 특징 카드 (미세한 border-slate-100과 은은한 배경 차이) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                외부인 완전 차단 & 초대제
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                사전 등록된 학생과 승인된 교원만 접근할 수 있어 교실 안의 안전한 교육 환경이 보장됩니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <BookOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                수업 통제 & 보드 잠금
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                수업 종료 시 클릭 한 번으로 읽기 전용 잠금 처리하고, 교사 승인 후 게시 옵션을 제공합니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                자동 이미지 최적화 & 영속 저장
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                고용량 사진도 브라우저에서 300KB 이하로 자동 압축하여 학교 무료 쿼터를 안전하게 보호합니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 미니멀 푸터 */}
      <footer className="border-t border-slate-100 bg-white/60 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-400 font-normal">
          © {new Date().getFullYear()} {APP_CONFIG.DEFAULT_SCHOOL_NAME} 협업 보드 플랫폼. 교육 목적으로 제작되었습니다.
        </div>
      </footer>
    </div>
  );
}
