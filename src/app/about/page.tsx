import { APP_CONFIG } from "@/config/constants";
import { ShieldCheck, BookOpen, Users, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans antialiased text-slate-900">
      {/* 헤더 */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            홈으로 돌아가기
          </Link>
          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            {APP_CONFIG.DEFAULT_SCHOOL_NAME} 협업 보드
          </span>
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </header>

      {/* 본문 콘텐츠 (호흡이 긴 여백과 정갈한 카드) */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/70 text-xs text-slate-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            학교 맞춤형 교육 솔루션
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-snug">
            서귀포대신중학교 패들릿(School Board) 특장점
          </h1>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            상용 패들릿의 유료화, 광고, 외부 유입 문제를 해결하고<br />
            학교 수업 환경에 꼭 필요한 기능만을 담아 자체 구축되었습니다.
          </p>
        </div>

        {/* 4대 주요 기능 카드 (미세 테두리와 은은한 톤 차이) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">1. 외부인 100% 차단 & 사전 초대제</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                임의의 외부인이 가입하거나 수업 보드에 접근할 수 없습니다. 교사나 관리자가 등록한 학생 명단과 학교 공식 구글 계정이 일치해야만 입장이 가능합니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <Lock className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">2. 수업 즉시 잠금 (읽기 전용)</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                수업 활동 시간이 끝나면 선생님이 버튼 한 번으로 보드를 읽기 전용으로 잠글 수 있어, 수업 후 학생들의 임의 수정이나 장난을 방지합니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <BookOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">3. 게시물 승인제 및 신고 기능</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                선생님의 승인을 거친 게시물만 전체 학생에게 공개되도록 설정할 수 있으며, 부적절한 글 발견 시 학생들이 즉각 신고할 수 있는 안전장치가 마련되어 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">4. 자동 이미지 최적화 (용량 절약)</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                스마트폰으로 찍은 10MB가 넘는 고용량 사진도 학생 브라우저에서 자동으로 300KB 이하로 압축하여 업로드되므로, 로딩이 빠르고 서버 용량을 영구 절약합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 이용 가이드 요약 (미세 테두리와 단정한 여백) */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 space-y-6">
          <h2 className="text-base font-semibold text-slate-900">사용 방법 요약</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 stroke-[1.75]" />
              <div className="text-sm text-slate-600 leading-relaxed font-normal">
                <strong className="font-semibold text-slate-800">선생님:</strong> 관리자에게 교사 권한을 승인받은 후, 학급을 개설하고 보드를 생성하여 수업을 진행합니다.
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 stroke-[1.75]" />
              <div className="text-sm text-slate-600 leading-relaxed font-normal">
                <strong className="font-semibold text-slate-800">학생:</strong> 별도 회원가입 없이 선생님이 공유해주신 링크나 코드로 바로 입장하여 의견을 작성합니다.
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 stroke-[1.75]" />
              <div className="text-sm text-slate-600 leading-relaxed font-normal">
                <strong className="font-semibold text-slate-800">관리자:</strong> 교사 가입을 승인하고, 학년 초 학생 명단(CSV)을 등록하여 전교생의 계정을 일괄 활성화합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            시작하기
          </Link>
        </div>
      </main>
    </div>
  );
}
