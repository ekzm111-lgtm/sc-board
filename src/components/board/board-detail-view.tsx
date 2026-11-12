'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/server/supabase/client';
import { Board, BoardColumn, Post } from '@/types/database';
import { POST_COLORS } from '@/config/constants';
import { 
  ArrowLeft, Plus, Lock, Unlock, Share2, Check, 
  Trash2, Link2, Columns
} from 'lucide-react';
import Link from 'next/link';

export default function BoardDetailView({ boardId }: { boardId: string }) {
  const router = useRouter();
  const { user, profile, loading, isTeacher } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // 포스트 작성 모달 상태
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postAuthor, setPostAuthor] = useState('');
  const [postColor, setPostColor] = useState('#FFFFFF');
  const [linkUrl, setLinkUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // 새 컬럼 추가 모달 상태
  const [showColModal, setShowColModal] = useState(false);
  const [colTitle, setColTitle] = useState('');

  const supabase = createClient();

  // 기본 작성자 이름 설정
  useEffect(() => {
    if (profile?.full_name) {
      setPostAuthor(profile.full_name);
    } else if (user?.email) {
      setPostAuthor(user.email.split('@')[0]);
    } else {
      setPostAuthor('익명의 학생');
    }
  }, [profile, user]);

  const fetchBoardData = useCallback(async () => {
    if (!boardId) return;
    try {
      setLoadingData(true);

      const { data: bData } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

      setBoard(bData || null);

      const { data: colsData } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      setColumns(colsData || []);

      const { data: pData } = await supabase
        .from('posts')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      setPosts(pData || []);
    } catch (err) {
      console.error('Error fetching board details:', err);
    } finally {
      setLoadingData(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // 보드 잠금 토글
  const handleToggleLock = async () => {
    if (!board) return;
    const nextLocked = !board.is_locked;
    try {
      await supabase
        .from('boards')
        .update({ is_locked: nextLocked })
        .eq('id', board.id);
      setBoard({ ...board, is_locked: nextLocked });
    } catch (err) {
      console.error('Lock toggle error:', err);
    }
  };

  // 포스트 생성
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    if (board.is_locked && !isTeacher) {
      alert('현재 보드가 읽기 전용으로 잠겨 있어 새 글을 작성할 수 없습니다.');
      return;
    }

    try {
      const newPostId = crypto.randomUUID();
      const authorId = user?.id === 'admin-master' ? '00000000-0000-0000-0000-000000000000' : (user?.id || '00000000-0000-0000-0000-000000000000');

      await supabase.from('posts').insert({
        id: newPostId,
        board_id: board.id,
        column_id: activeColumnId,
        author_id: authorId,
        author_name: postAuthor.trim() || '익명',
        title: postTitle.trim() || null,
        content: postContent.trim(),
        color: postColor,
        is_approved: !board.require_approval,
      });

      if (linkUrl.trim()) {
        await supabase.from('attachments').insert({
          post_id: newPostId,
          type: 'link',
          url: linkUrl.trim(),
        });
      }

      setPostTitle('');
      setPostContent('');
      setLinkUrl('');
      setShowPostModal(false);
      fetchBoardData();
    } catch (err) {
      console.error('Post submit error:', err);
    }
  };

  // 새 컬럼 추가
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board || !colTitle.trim()) return;

    try {
      const nextPos = (columns.length + 1) * 1000;
      await supabase.from('columns').insert({
        board_id: board.id,
        title: colTitle.trim(),
        position: nextPos,
      });

      setColTitle('');
      setShowColModal(false);
      fetchBoardData();
    } catch (err) {
      console.error('Add column error:', err);
    }
  };

  // 포스트 삭제
  const handleDeletePost = async (postId: string) => {
    if (!confirm('이 게시물을 삭제하시겠습니까?')) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      fetchBoardData();
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  // 보드 초대 링크 복사
  const handleCopyBoardLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/board?id=${boardId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center font-sans">
        <div className="text-xs text-slate-500 font-normal">수업 보드를 불러오는 중...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center font-sans space-y-4">
        <p className="text-sm text-slate-700">보드를 찾을 수 없습니다.</p>
        <Link href="/dashboard" className="text-xs text-slate-900 font-medium underline">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans antialiased text-slate-900">
      {/* 상단 보드 바 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              title="대시보드로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                  {board.title}
                </h1>
                {board.is_locked ? (
                  <span className="flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-500" />
                    읽기 전용 잠금
                  </span>
                ) : (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                    참여 가능
                  </span>
                )}
              </div>
              {board.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-normal">
                  {board.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 링크 복사 버튼 */}
            <button
              onClick={handleCopyBoardLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? '링크 복사됨' : '학생 초대 링크'}</span>
            </button>

            {/* 선생님 전용 잠금 제어 */}
            {isTeacher && (
              <button
                onClick={handleToggleLock}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
                  board.is_locked
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {board.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{board.is_locked ? '잠금 해제' : '수업 마감 잠금'}</span>
              </button>
            )}

            {/* 새 글 작성 버튼 */}
            <button
              onClick={() => {
                setActiveColumnId(columns[0]?.id || null);
                setShowPostModal(true);
              }}
              disabled={board.is_locked && !isTeacher}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              글쓰기
            </button>
          </div>
        </div>
      </header>

      {/* 컬럼 및 포스트 영역 */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="flex items-start gap-6 min-w-max pb-8">
          {columns.map((col) => {
            const colPosts = posts.filter((p) => p.column_id === col.id);

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/60 rounded-2xl p-4 flex flex-col max-h-[calc(100vh-140px)]"
              >
                {/* 컬럼 헤더 */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {col.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {colPosts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveColumnId(col.id);
                      setShowPostModal(true);
                    }}
                    disabled={board.is_locked && !isTeacher}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors disabled:opacity-30"
                    title="이 열에 글 쓰기"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* 포스트잇 카드 목록 */}
                <div className="flex-1 overflow-y-auto pt-3 space-y-3.5 pr-1">
                  {colPosts.map((post) => (
                    <div
                      key={post.id}
                      style={{ backgroundColor: post.color || '#FFFFFF' }}
                      className="p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5 transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          {post.title && (
                            <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                              {post.title}
                            </h4>
                          )}
                          <span className="text-[11px] text-slate-500 font-normal">
                            {post.author_name}
                          </span>
                        </div>
                        {isTeacher && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-colors"
                            title="게시물 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-normal">
                        {post.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
                        <span>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}

                  {colPosts.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-normal">
                      아직 작성된 글이 없습니다.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveColumnId(col.id);
                    setShowPostModal(true);
                  }}
                  disabled={board.is_locked && !isTeacher}
                  className="mt-3 w-full py-2 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  글 추가하기
                </button>
              </div>
            );
          })}

          {isTeacher && (
            <button
              onClick={() => setShowColModal(true)}
              className="w-80 shrink-0 h-32 bg-white border border-dashed border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-medium text-xs"
            >
              <Columns className="w-5 h-5 text-slate-400" />
              <span>+ 새 열(컬럼) 추가하기</span>
            </button>
          )}
        </div>
      </main>

      {/* 새 포스트 작성 모달 */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-8 rounded-2xl border border-slate-100 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">새 포스트 작성</h3>
              <p className="text-xs text-slate-500 font-normal">
                학습 활동 내용과 생각을 자유롭게 기록해 보세요.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">작성자 이름</label>
                <input
                  type="text"
                  required
                  value={postAuthor}
                  onChange={(e) => setPostAuthor(e.target.value)}
                  placeholder="예: 2학년 3반 15번 김대신"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">제목 (선택)</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">본문 내용</label>
                <textarea
                  rows={4}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="수업 의견, 조사 내용, 생각을 적어주세요."
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">참고 웹 링크 (선택)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">메모지 색상</label>
                <div className="flex items-center gap-2.5">
                  {POST_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setPostColor(c.value)}
                      style={{ backgroundColor: c.value }}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        postColor === c.value
                          ? 'border-slate-900 scale-110 shadow-xs'
                          : 'border-slate-300'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 새 열(컬럼) 추가 모달 */}
      {showColModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-8 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">새 열(컬럼) 추가</h3>
            <form onSubmit={handleAddColumn} className="space-y-4">
              <input
                type="text"
                required
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                placeholder="열 제목 (예: 1모둠, 2모둠, 질문방)"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowColModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
