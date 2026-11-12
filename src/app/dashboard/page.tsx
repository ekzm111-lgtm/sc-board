'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/server/supabase/client';
import { Board, ClassRoom } from '@/types/database';
import { Plus, LayoutGrid, Users, LogOut, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center font-sans">
        <div className="text-xs text-slate-500 font-normal">보드 대시보드를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans antialiased text-slate-900">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-medium text-xs">
              대
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              서귀포대신중학교 패들릿
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-800">
                {profile?.full_name || user?.email}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-normal border bg-slate-100 text-slate-600 border-slate-200/60">
                {isAdmin ? '관리자' : isTeacher ? '선생님' : '학생'}
              </span>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                관리자 패널
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 (여유로운 호흡과 정돈된 모노톤 카드) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        {/* 상단 액션 바 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {isTeacher ? '선생님 대시보드' : '내 참여 보드'}
            </h1>
            <p className="text-xs text-slate-600 font-normal">
              {isTeacher
                ? '학급과 수업 보드를 만들고 학생들의 참여 현황을 확인합니다.'
                : '우리 반 수업 협업 보드에 참여하여 의견을 나눕니다.'}
            </p>
          </div>

          {isTeacher && (
            <div className="flex items-center gap-2.5">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                학급 관리
              </Link>
              <Link
                href="/boards/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                새 보드 만들기
              </Link>
            </div>
          )}
        </div>

        {/* 보드 카드 그리드 (미세 테두리와 가벼운 shadow-sm) */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-slate-500 stroke-[1.75]" />
            전체 보드 ({boards.length})
          </h2>

          {boards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <LayoutGrid className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">개설된 보드가 아직 없습니다.</p>
                <p className="text-xs text-slate-500 font-normal">
                  {isTeacher
                    ? '우측 상단의 "새 보드 만들기" 버튼을 눌러 첫 수업 보드를 생성하세요.'
                    : '선생님이 보드를 생성하면 이곳에 표시됩니다.'}
                </p>
              </div>
              {isTeacher && (
                <Link
                  href="/boards/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  첫 보드 생성하기
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between h-48"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                        {board.layout === 'shelf' ? '컬럼형' : board.layout === 'wall' ? '월 그리드' : '자유 캔버스'}
                      </span>
                      {board.is_locked && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          잠김
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {board.description || '설명 없음'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 font-normal">
                    <span>{new Date(board.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                      보드 열기
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
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
