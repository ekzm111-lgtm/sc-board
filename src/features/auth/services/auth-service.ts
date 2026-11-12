import { createClient } from '@/server/supabase/client';
import { UserProfile } from '@/types/database';

export class AuthService {
  private static get supabase() {
    return createClient();
  }

  /**
   * 이메일/아이디 및 비밀번호로 로그인 (관리자 및 일반 계정)
   */
  static async signInWithPassword(emailOrId: string, password: string) {
    const supabase = this.supabase;
    // 아이디가 'admin'인 경우 학교 도메인 이메일로 자동 변환
    let email = emailOrId.trim();
    if (!email.includes('@')) {
      email = `${email}@daeshin.ms.kr`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 프로필 확인 및 없으면 생성
    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // admin인 경우 자동 admin 부여
        const isAdmin = email.startsWith('admin@');
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: isAdmin ? '최고 관리자' : (data.user.email?.split('@')[0] || '사용자'),
          role: isAdmin ? 'admin' : 'student',
          approved: isAdmin ? true : false,
        });
      }
    }

    return data;
  }

  /**
   * 비밀번호 변경 (관리자 등 본인 계정)
   */
  static async updatePassword(newPassword: string) {
    const supabase = this.supabase;
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
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
   * 현재 프로필 조회
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
}
