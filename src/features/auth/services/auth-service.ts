import { createClient } from '@/server/supabase/client';
import { UserProfile, StudentInvitation } from '@/types/database';

export class AuthService {
  private static get supabase() {
    return createClient();
  }

  /**
   * 학교 구글 계정으로 로그인 (OAuth)
   */
  static async signInWithGoogle(redirectTo?: string) {
    const supabase = this.supabase;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * 로그아웃
   */
  static async signOut() {
    const supabase = this.supabase;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * 현재 로그인된 사용자 세션 및 프로필 조회
   */
  static async getCurrentProfile(): Promise<{ user: any; profile: UserProfile | null }> {
    const supabase = this.supabase;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    return { user, profile: profile || null };
  }

  /**
   * 로그인 후 프로필 동기화 및 학생 초대 명단 매칭
   */
  static async syncProfile(user: any, requestedRole: 'teacher' | 'student' = 'student'): Promise<UserProfile> {
    const supabase = this.supabase;
    const email = user.email || '';
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;

    // 1. 이미 존재하는 프로필인지 확인
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile as UserProfile;
    }

    // 2. 학생 초대 명단 조회
    const { data: invitation } = await supabase
      .from('student_invitations')
      .select('*')
      .eq('email', email)
      .single();

    let role = requestedRole;
    let approved = false;
    let studentNumber = null;

    if (invitation) {
      // 사전 등록된 학생인 경우 자동 매칭 및 승인 완료
      role = 'student';
      approved = true;
      studentNumber = invitation.student_number;
    } else if (requestedRole === 'teacher') {
      // 교사는 신청 후 관리자 승인 대기 상태
      role = 'teacher';
      approved = false;
    }

    // 3. 새 프로필 삽입
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        role,
        approved,
        student_number: studentNumber,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 4. 초대를 Claim 처리
    if (invitation) {
      await supabase
        .from('student_invitations')
        .update({ is_claimed: true, claimed_user_id: user.id })
        .eq('id', invitation.id);
    }

    return newProfile as UserProfile;
  }
}
