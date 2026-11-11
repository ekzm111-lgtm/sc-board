/**
 * 환경 변수 유효성 검사 및 접근 헬퍼
 */

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  school: {
    name: process.env.NEXT_PUBLIC_SCHOOL_NAME || "서귀포대신중학교",
    allowedDomain: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "@daeshin.ms.kr",
  },
  isConfigured: () => {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  },
};
