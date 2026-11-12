'use client';

import { useState } from 'react';
import { AuthService } from '@/features/auth/services/auth-service';
import { APP_CONFIG } from '@/config/constants';
import { ShieldCheck, School, AlertCircle, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'social' | 'admin'>('social');

  // 관리자 / 간편 로그인 상태
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345');

  // 구글 로그인
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await AuthService.signInWithGoogle('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || '구글 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 네이버 로그인 안내 또는 연동
  const handleNaverLogin = () => {
    setErrorMsg('네이버 연동 준비 중입니다. 현재는 [구글 로그인] 또는 [관리자 로그인]을 이용해 주세요.');
  };

  // 관리자 및 아이디/비밀번호 로그인
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      await AuthService.signInWithPassword(username, password);
      if (username.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.message === 'Invalid login credentials'
          ? '아이디 또는 비밀번호가 일치하지 않습니다. (기본: admin / 12345)'
          : (err.message || '로그인에 실패했습니다.')
      );
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
          학교 전용 협업 보드 (School Board)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* 학생 안내 배너: 학생은 가입할 필요 없음! */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 leading-relaxed">
            <strong>학생은 회원가입이 전혀 필요 없습니다!</strong><br />
            선생님이 공유해주신 보드 링크나 수업 코드로 바로 참여하여 활동할 수 있습니다.
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 sm:rounded-2xl sm:px-10">
          {/* 로그인 유형 탭 (소셜 회원가입/로그인 vs 관리자 로그인) */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => { setTab('social'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'social'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4 text-indigo-600" />
              선생님 로그인 / 가입
            </button>
            <button
              onClick={() => { setTab('admin'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              최고 관리자 로그인
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'social' ? (
            /* 구글 및 네이버 소셜 로그인 버튼 */
            <div className="space-y-3">
              {/* 구글 로그인 */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
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
                <span>Google 계정으로 시작하기</span>
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={handleNaverLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-emerald-500 bg-[#03C75A] hover:bg-[#02b350] rounded-xl shadow-xs text-sm font-semibold text-white transition-all"
              >
                <div className="w-4 h-4 bg-white text-[#03C75A] font-extrabold flex items-center justify-center text-xs rounded-xs">
                  N
                </div>
                <span>Naver 계정으로 시작하기</span>
              </button>

              <p className="pt-3 text-xs text-slate-400 text-center leading-relaxed">
                선생님 계정은 로그인 후 관리자의 승인을 거쳐 보드를 생성할 수 있습니다.
              </p>
            </div>
          ) : (
            /* 관리자 전용 아이디/비밀번호 폼 (admin / 12345) */
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  관리자 아이디
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="12345"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-xs disabled:opacity-50"
              >
                <span>{loading ? '로그인 확인 중...' : '관리자 로그인'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
                <p><strong>초기 설정값:</strong></p>
                <p>• 아이디: <code className="text-indigo-600 font-bold">admin</code></p>
                <p>• 비밀번호: <code className="text-indigo-600 font-bold">12345</code></p>
                <p className="text-slate-400 pt-1">* 로그인 후 관리자 화면에서 언제든 비밀번호를 변경할 수 있습니다.</p>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs font-medium text-indigo-600 px-2">
          <Link href="/" className="hover:text-indigo-500">
            ← 홈으로
          </Link>
          <Link href="/about" className="hover:text-indigo-500">
            사용 안내 및 특장점 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
