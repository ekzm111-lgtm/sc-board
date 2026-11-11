'use client';

import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            접근 권한이 없습니다
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            사전 등록된 학생 명단에 포함되어 있지 않은 계정입니다.<br />
            학교 구글 계정으로 로그인했는지 확인해 주시고, 문제가 지속될 경우 담임 선생님께 문의해 주세요.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            로그아웃 후 다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
