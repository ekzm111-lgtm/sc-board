import { createClient } from '@/server/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
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
        // 새 유저인 경우 초대 명단 확인
        const { data: invitation } = await supabase
          .from('student_invitations')
          .select('*')
          .eq('email', email)
          .single();

        if (invitation) {
          // 학생 자동 매칭
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

          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          // 초대 명단에 없는 일반 로그인: 미등록 안내 페이지로
          return NextResponse.redirect(`${origin}/unauthorized`);
        }
      }

      // 교사인데 아직 승인되지 않은 경우
      if (profile.role === 'teacher' && !profile.approved) {
        return NextResponse.redirect(`${origin}/pending-approval`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
