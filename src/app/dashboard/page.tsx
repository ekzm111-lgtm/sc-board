'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/server/supabase/client';
import { Board, ClassRoom } from '@/types/database';
import { Plus, LayoutGrid, Users, LogOut, ArrowRight, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading, signOut, isTeacher, isAdmin } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoadingData(true);
        const { data: boardsData } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: false });

        setBoards(boardsData || []);

        if (profile?.role === 'teacher' || profile?.role === 'admin') {
          const { data: classesData } = await supabase
            .from('classes')
            .select('*')
            .eq('teacher_id', user.id);
          setClasses(classesData || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user && profile) {
      fetchData();
    }
  }, [user, profile, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || (loadingData && user)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-normal tracking-tight">대시보드를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-200">
      {/* 상단 네비게이션 헤더 (전문 SaaS 스타일) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-medium text-xs shadow-xs">
              대
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                서귀포대신중학교 패들릿
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                School Board
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* 사용자 프로필 태그 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-medium text-slate-800">
                {profile?.full_name || user?.email}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs">
                {isAdmin ? '최고 관리자' : isTeacher ? '선생님' : '학생'}
              </span>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                관리자 패널
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* 상단 헤더 및 액션 바 (타이포그래피 및 버튼 리팩토링) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-200/60">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {isTeacher ? '선생님 대시보드' : '내 참여 보드'}
            </h1>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              {isTeacher
                ? '학급과 수업 보드를 만들고 학생들의 참여 현황을 한눈에 관리합니다.'
                : '우리 반 수업 협업 보드에 참여하여 의견을 나누고 토론합니다.'}
            </p>
          </div>

          {isTeacher && (
            <div className="flex items-center gap-2.5">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-slate-500 stroke-[1.75]" />
                학급 관리
              </Link>
              <Link
                href="/boards/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                새 보드 만들기
              </Link>
            </div>
          )}
        </div>

        {/* 보드 섹션 */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-slate-500 stroke-[1.75]" />
              전체 수업 보드
              <span className="text-xs font-normal text-slate-400 ml-0.5">({boards.length})</span>
            </h2>
          </div>

          {boards.length === 0 ? (
            /* 텅 빈 상태 (Empty State) 컴팩트화 및 시각적 위계 개선 */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="max-w-md mx-auto space-y-4">
                {/* 부드러운 배경 원형 아이콘 */}
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mx-auto">
                  <LayoutGrid className="w-6 h-6 stroke-[1.5]" />
                </div>
                
                {/* 제목과 설명의 명확한 시각적 위계 */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                    개설된 보드가 아직 없습니다
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {isTeacher
                      ? '우측 상단의 "새 보드 만들기" 버튼을 눌러 첫 수업 보드를 생성하세요.'
                      : '선생님이 보드를 생성하면 이곳에 참여 카드가 나타납니다.'}
                  </p>
                </div>

                {/* 콜투액션 버튼 */}
                {isTeacher && (
                  <div className="pt-2">
                    <Link
                      href="/boards/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all duration-200 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      첫 보드 생성하기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 보드 카드 그리드 (깨끗한 흰색 + 미세 보더 + 연한 shadow-sm) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/board?id=${board.id}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between h-48"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        {board.layout === 'shelf' ? '컬럼형' : board.layout === 'wall' ? '월 그리드' : '자유 캔버스'}
                      </span>
                      {board.is_locked && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-normal">
                          <Lock className="w-3 h-3 text-slate-400" />
                          잠김
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 tracking-tight">
                        {board.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {board.description || '학습 지시사항이 등록되지 않았습니다.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 font-normal">
                    <span>{new Date(board.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                      보드 열기
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
