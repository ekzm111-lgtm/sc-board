'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/server/supabase/client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard';

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
          const email = data.user.email || '';

          // 프로필 조회
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!profile) {
            // 학생 초대 명단 확인
            const { data: invitation } = await supabase
              .from('student_invitations')
              .select('*')
              .eq('email', email)
              .single();

            if (invitation) {
              await supabase.from('users').insert({
                id: data.user.id,
                email,
                full_name: invitation.full_name,
                role: 'student',
                approved: true,
                student_number: invitation.student_number,
                avatar_url: data.user.user_metadata?.avatar_url,
              });

              await supabase.from('student_invitations').update({
                is_claimed: true,
                claimed_user_id: data.user.id,
              }).eq('id', invitation.id);

              router.push('/dashboard');
              return;
            } else {
              router.push('/unauthorized');
              return;
            }
          }

          if (profile.role === 'teacher' && !profile.approved) {
            router.push('/pending-approval');
            return;
          }

          router.push(next);
          return;
        }
      }

      // 이미 세션이 있는 경우
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(next);
      } else {
        router.push('/login');
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-700">학교 계정 인증 중입니다...</p>
      <p className="text-xs text-slate-500 mt-1">잠시만 기다려주세요.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">인증 처리 중...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
