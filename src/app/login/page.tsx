'use client';

import { useState } from 'react';
import { AuthService } from '@/features/auth/services/auth-service';
import { createClient } from '@/server/supabase/client';
import { APP_CONFIG } from '@/config/constants';
import { ShieldCheck, School, AlertCircle, Lock, User, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'teacher' | 'admin'>('teacher');

  // 교사 로그인 입력값
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // 관리자 로그인 입력값
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('12345');

  const supabase = createClient();

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

  // 선생님 이메일/비밀번호 로그인
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      // users 테이블에서 교사 확인
      const { data: userProfile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', teacherEmail.trim())
        .single();

      if (profileErr || !userProfile) {
        setErrorMsg('등록되지 않은 선생님 계정입니다. [선생님 회원가입 신청]을 먼저 진행해 주세요.');
        setLoading(false);
        return;
      }

      if (!userProfile.approved) {
        window.location.href = '/pending-approval/';
        return;
      }

      // 교사 세션 저장
      sessionStorage.setItem('school_board_teacher_auth', JSON.stringify(userProfile));
      window.location.href = '/dashboard/';
    } catch (err: any) {
      console.error('Teacher login error:', err);
      setErrorMsg('로그인 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 관리자 직통 로그인 (admin / 12345)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (AuthService.verifyAdmin(adminUsername, adminPassword)) {
      window.location.href = '/admin/';
    } else {
      setErrorMsg('관리자 아이디 또는 비밀번호가 일치하지 않습니다. (기본: admin / 12345)');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-20 px-6 font-sans antialiased text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-medium text-base">
            대
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {APP_CONFIG.DEFAULT_SCHOOL_NAME}
          </h2>
          <p className="text-xs text-slate-600 font-normal">
            학교 전용 협업 보드 (School Board)
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* 학생 안내 배너 */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 stroke-[1.75]" />
          <div className="text-xs text-slate-600 leading-relaxed font-normal">
            <span className="font-semibold text-slate-800">학생은 회원가입이 필요 없습니다.</span><br />
            선생님이 공유해주신 보드 링크나 수업 코드로 바로 참여합니다.
          </div>
        </div>

        {/* 메인 로그인 박스 */}
        <div className="bg-white py-10 px-8 border border-slate-100 rounded-2xl sm:px-10 space-y-6">
          {/* 탭 전환 (선생님 로그인 vs 관리자 로그인) */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => { setTab('teacher'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'teacher'
                  ? 'bg-white text-slate-900 border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5 text-slate-600" />
              선생님 로그인
            </button>
            <button
              onClick={() => { setTab('admin'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              최고 관리자
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'teacher' ? (
            /* 선생님 로그인 영역 */
            <div className="space-y-5">
              {/* 소셜 로그인 버튼 */}
              <div className="space-y-2.5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google 학교 계정으로 로그인</span>
                </button>

                <button
                  onClick={() => setErrorMsg('네이버 연동 준비 중입니다. 구글 로그인 또는 아래 이메일 로그인을 이용해 주세요.')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <div className="w-3.5 h-3.5 bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px] rounded-xs">
                    N
                  </div>
                  <span>Naver 계정으로 로그인</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-100 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 font-normal">또는 이메일 로그인</span>
              </div>

              {/* 이메일 로그인 폼 */}
              <form onSubmit={handleTeacherLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">이메일 주소</label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="teacher@daeshin.ms.kr"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">비밀번호</label>
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {loading ? '확인 중...' : '선생님 로그인'}
                </button>
              </form>

              {/* 선생님 회원가입 신청 배너 (눈에 잘 띄게 배치) */}
              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 font-normal">
                  아직 계정이 없으신가요?
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  선생님 회원가입 신청하기 →
                </Link>
              </div>
            </div>
          ) : (
            /* 관리자 로그인 폼 */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  관리자 아이디
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="12345"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <span>{loading ? '확인 중...' : '관리자 즉시 로그인'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 space-y-1 font-normal">
                <p className="font-medium text-slate-700">초기 접속 안내:</p>
                <p>• 아이디: <code className="text-slate-900 font-semibold font-mono">admin</code></p>
                <p>• 비밀번호: <code className="text-slate-900 font-semibold font-mono">12345</code></p>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between text-xs font-normal text-slate-500 px-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            ← 홈으로
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            사용 안내 및 특장점 →
          </Link>
        </div>
      </div>
    </div>
  );
}
