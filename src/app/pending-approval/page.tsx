'use client';

import { Clock, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            교사 승인 대기 중입니다
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            학교 관리자의 승인이 완료될 때까지 잠시만 기다려주세요.<br />
            승인이 완료되면 학급 개설 및 보드 생성이 가능합니다.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-xs"
          >
            승인 상태 새로고침
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
