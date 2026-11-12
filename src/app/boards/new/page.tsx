'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/server/supabase/client';
import { ClassRoom, BoardLayout } from '@/types/database';
import { ArrowLeft, LayoutGrid, Columns, Move, Lock, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewBoardPage() {
  const { user, profile, loading, isTeacher } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [layout, setLayout] = useState<BoardLayout>('shelf');
  const [classId, setClassId] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || (!isTeacher && profile?.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, profile, loading, isTeacher, router]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const { data } = await supabase.from('classes').select('*');
        setClasses(data || []);
      } catch (e) {
        // 무시
      }
    }
    loadClasses();
  }, [supabase]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    try {
      setIsSubmitting(true);
      const newBoardId = crypto.randomUUID();

      // creatorId가 유효한 UUID인지 검사 (admin-master 등은 null 처리)
      const isUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      const creatorId = isUuid ? user.id : null;

      // 1. 보드 생성
      const { error: boardErr } = await supabase.from('boards').insert({
        id: newBoardId,
        title: title.trim(),
        description: description.trim() || null,
        layout,
        class_id: classId.trim() ? classId.trim() : null,
        created_by: creatorId,
        is_locked: isLocked,
        require_approval: requireApproval,
        allow_comments: allowComments,
      });

      if (boardErr) {
        throw new Error(
          boardErr.code === '42501'
            ? '데이터베이스 권한(RLS) 제한으로 보드 생성이 차단되었습니다. 아래 안내를 확인해 주세요.'
            : boardErr.message
        );
      }

      // 2. 컬럼형(shelf)인 경우 기본 수업 컬럼 3개 자동 추가
      if (layout === 'shelf') {
        await supabase.from('columns').insert([
          { board_id: newBoardId, title: '생각 열기', position: 1000 },
          { board_id: newBoardId, title: '모둠 활동 및 의견', position: 2000 },
          { board_id: newBoardId, title: '질문과 피드백', position: 3000 },
        ]);
      }

      // 성공 시 보드 상세 페이지로 이동
      window.location.href = `/board/?id=${newBoardId}`;
    } catch (err: any) {
      console.error('Error creating board:', err);
      setErrorMsg(err.message || '보드 생성 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-200">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <span className="font-semibold text-sm tracking-tight text-slate-900">
            새 수업 보드 만들기
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* 메인 폼 */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <form onSubmit={handleCreateBoard} className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-8">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              수업 보드 설정
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              보드의 주제와 수업 형태에 맞는 레이아웃을 선택하세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs text-red-700">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">보드 생성 실패</p>
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              </div>
              {errorMsg.includes('RLS') && (
                <div className="mt-2 pt-2 border-t border-red-200/60 text-[11px] text-red-600 font-mono bg-white/70 p-2.5 rounded-lg">
                  💡 Supabase SQL Editor에서 RLS 비활성화 쿼리를 실행해 주셔야 합니다. (채팅창 안내 참조)
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {/* 제목 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                보드 제목 <span className="text-slate-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2학기 과학 탐구활동 - 지속가능한 에너지"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* 설명 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                학습 목표 및 안내 설명
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="학생들이 보드에 들어왔을 때 확인할 학습 지시사항을 적어주세요."
                className="w-full p-3.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors leading-relaxed"
              />
            </div>

            {/* 학급 배정 */}
            {classes.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  대상 학급 선택
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">학급 지정 없음 (전체 공개)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 레이아웃 선택 */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                보드 레이아웃 형태
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLayout('shelf')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                    layout === 'shelf'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Columns className="w-5 h-5 text-slate-700 stroke-[1.75]" />
                    {layout === 'shelf' && <Check className="w-4 h-4 text-slate-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">컬럼형 (Shelf)</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug font-normal">
                      모둠별, 단계별로 열을 나누어 정돈
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('wall')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                    layout === 'wall'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <LayoutGrid className="w-5 h-5 text-slate-700 stroke-[1.75]" />
                    {layout === 'wall' && <Check className="w-4 h-4 text-slate-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">그리드 (Wall)</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug font-normal">
                      포스트잇이 차곡차곡 빈틈없이 배치
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('canvas')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                    layout === 'canvas'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Move className="w-5 h-5 text-slate-700 stroke-[1.75]" />
                    {layout === 'canvas' && <Check className="w-4 h-4 text-slate-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">자유 캔버스</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug font-normal">
                      원하는 위치로 자유롭게 드래그 배치
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 수업 통제 설정 */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <label className="block text-xs font-medium text-slate-700">
                선생님 수업 통제 옵션
              </label>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={(e) => setIsLocked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      읽기 전용 잠금으로 시작
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                      학생들이 아직 글을 쓸 수 없게 차단하고 수업 시작 시 해제합니다.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      게시물 승인제 적용
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                      학생이 작성한 글을 선생님이 승인한 후에만 전체 학생에게 공개됩니다.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? '생성 중...' : '보드 생성 완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
