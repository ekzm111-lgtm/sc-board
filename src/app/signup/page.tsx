'use client';

import { useState } from 'react';
import { createClient } from '@/server/supabase/client';
import { APP_CONFIG } from '@/config/constants';
import { School, User, Mail, Lock, BookOpen, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);

      // 1. users 테이블에 교사 가입 신청 레코드 등록 (승인 대기 상태 approved: false)
      const newUserId = crypto.randomUUID();
      const { error: dbError } = await supabase.from('users').insert({
        id: newUserId,
        email: email.trim(),
        full_name: fullName.trim(),
        role: 'teacher',
        approved: false, // 관리자 승인 전까지 보드 생성 불가
      });

      if (dbError) {
        // 이미 가입된 이메일 등
        if (dbError.code === '23505') {
          throw new Error('이미 등록된 이메일 주소입니다. 로그인을 시도해 주세요.');
        }
        throw dbError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMsg(err.message || '가입 신청 중 오류가 발생했습니다.');
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
            선생님 회원가입 신청
          </h2>
          <p className="text-xs text-slate-600 font-normal">
            {APP_CONFIG.DEFAULT_SCHOOL_NAME} 교원 전용 계정 등록
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {success ? (
          /* 가입 완료 안내 카드 */
          <div className="bg-white p-10 border border-slate-100 rounded-2xl text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
              <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                가입 신청이 완료되었습니다!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                선생님의 가입 신청이 학교 관리자에게 전달되었습니다.<br />
                관리자의 승인 완료 후 보드 개설 및 수업 진행이 가능합니다.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
              >
                로그인 화면으로 이동
              </Link>
            </div>
          </div>
        ) : (
          /* 교사 가입 신청 폼 */
          <div className="bg-white py-10 px-8 border border-slate-100 rounded-2xl sm:px-10 space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  선생님 성함
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  학교 이메일 (구글 또는 네이버)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@daeshin.ms.kr 또는 naver.com"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  담당 과목 또는 학년/반
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="예: 2학년 과학 / 3학년 2반 담임"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  비밀번호 (6자 이상)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-all disabled:opacity-50 mt-2"
              >
                <span>{loading ? '신청 처리 중...' : '선생님 가입 신청하기'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-2 font-normal">
                * 신청 즉시 최고 관리자에게 승인 요청이 전달되며, 승인 완료 후 보드 생성이 가능합니다.
              </p>
            </form>
          </div>
        )}

        <div className="mt-8 text-center text-xs font-normal text-slate-500">
          이미 가입하셨나요?{' '}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
