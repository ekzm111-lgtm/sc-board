'use client';

import { useState } from 'react';
import { AuthService } from '@/features/auth/services/auth-service';
import { APP_CONFIG } from '@/config/constants';
import { ShieldCheck, GraduationCap, School, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'student' | 'teacher'>('student');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await AuthService.signInWithGoogle('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || '로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
            대
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          {APP_CONFIG.DEFAULT_SCHOOL_NAME}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          학교 전용 협업 보드 (School Board) 로그인
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 sm:rounded-2xl sm:px-10">
          {/* 역할 탭 선택 */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setTab('student')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                tab === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              학생 로그인
            </button>
            <button
              onClick={() => setTab('teacher')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                tab === 'teacher'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              선생님 로그인
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all disabled:opacity-50"
            >
              {/* Google G 로고 */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? '연결 중...' : '학교 구글 계정으로 로그인'}</span>
            </button>

            <div className="pt-2 text-xs text-slate-500 leading-relaxed text-center">
              {tab === 'student' ? (
                <>
                  * 사전 등록된 학생만 로그인 가능합니다.<br />
                  로그인이 안 되는 경우 담임 선생님께 문의해 주세요.
                </>
              ) : (
                <>
                  * 교사 신규 로그인 시 관리자 승인 후 보드 생성이 가능합니다.
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
