import { createClient } from '@/server/supabase/client';
import { UserProfile } from '@/types/database';

const ADMIN_STORAGE_KEY = 'school_board_admin_auth';
const ADMIN_PW_KEY = 'school_board_admin_pw';

export class AuthService {
  private static get supabase() {
    return createClient();
  }

  /**
   * 관리자 직통 인증 (admin / 12345 지원 및 커스텀 비밀번호)
   */
  static verifyAdmin(username: string, password: string): boolean {
    const cleanUser = username.trim();
    if (cleanUser !== 'admin' && cleanUser !== 'admin@daeshin.ms.kr') {
      return false;
    }

    // 변경된 비밀번호가 있는지 확인 (기본값: 12345)
    let savedPw = '12345';
    if (typeof window !== 'undefined') {
      savedPw = localStorage.getItem(ADMIN_PW_KEY) || '12345';
    }

    if (password === savedPw) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
          id: 'admin-master',
          email: 'admin@daeshin.ms.kr',
          full_name: '최고 관리자',
          role: 'admin',
          approved: true,
          authenticated_at: new Date().toISOString()
        }));
      }
      return true;
    }

    return false;
  }

  /**
   * 관리자 세션 체크
   */
  static getAdminSession(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const session = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  /**
   * 관리자 비밀번호 변경
   */
  static changeAdminPassword(newPassword: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_PW_KEY, newPassword);
    }
  }

  /**
   * 관리자 로그아웃
   */
  static signOutAdmin() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }

  /**
   * 일반 아이디/비밀번호 로그인
   */
  static async signInWithPassword(emailOrId: string, password: string) {
    // 1. 관리자 계정 직통 체크 (admin / 12345)
    if (this.verifyAdmin(emailOrId, password)) {
      return { user: { email: 'admin@daeshin.ms.kr' }, isAdmin: true };
    }

    // 2. 일반 계정 Supabase 인증
    const supabase = this.supabase;
    let email = emailOrId.trim();
    if (!email.includes('@')) {
      email = `${email}@daeshin.ms.kr`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * 구글 로그인
   */
  static async signInWithGoogle(redirectTo?: string) {
    const supabase = this.supabase;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${origin}/auth/callback/${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * 로그아웃
   */
  static async signOut() {
    this.signOutAdmin();
    const supabase = this.supabase;
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // 무시
    }
  }
}
