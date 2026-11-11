'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/server/supabase/client';
import { Board, ClassRoom } from '@/types/database';
import { Plus, LayoutGrid, Users, School, LogOut, ArrowRight, Lock } from 'lucide-react';
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
        // 보드 목록 조회
        const { data: boardsData } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: false });

        setBoards(boardsData || []);

        // 교사인 경우 학급 목록 조회
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500 font-medium">대시보드를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              대
            </div>
            <span className="font-bold text-slate-900 tracking-tight">
              서귀포대신중학교 패들릿
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {profile?.full_name || user?.email}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isTeacher ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {isAdmin ? '관리자' : isTeacher ? '선생님' : '학생'}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* 상단 액션 바 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isTeacher ? '선생님 대시보드' : '내 참여 보드'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isTeacher
                ? '학급과 수업 보드를 만들고 학생들의 참여 현황을 관리하세요.'
                : '우리 반 수업 협업 보드에 참여하여 의견을 나누어보세요.'}
            </p>
          </div>

          {isTeacher && (
            <div className="flex items-center gap-3">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
              >
                <Users className="w-4 h-4 text-slate-500" />
                학급 관리
              </Link>
              <Link
                href="/boards/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                새 보드 만들기
              </Link>
            </div>
          )}
        </div>

        {/* 보드 카드 그리드 */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            전체 보드 ({boards.length})
          </h2>

          {boards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700">개설된 보드가 아직 없습니다.</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isTeacher
                    ? '우측 상단의 "새 보드 만들기" 버튼을 눌러 수업 보드를 시작해보세요.'
                    : '선생님이 보드를 생성하면 이곳에 표시됩니다.'}
                </p>
              </div>
              {isTeacher && (
                <Link
                  href="/boards/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  첫 보드 생성하기
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between h-48"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {board.layout === 'shelf' ? '컬럼형' : board.layout === 'wall' ? '월 그리드' : '자유 캔버스'}
                      </span>
                      {board.is_locked && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Lock className="w-3 h-3" />
                          잠김
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {board.description || '설명 없음'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                    <span>{new Date(board.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium group-hover:text-indigo-600">
                      보드 열기
                      <ArrowRight className="w-3.5 h-3.5" />
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
