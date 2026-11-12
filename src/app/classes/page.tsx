'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/server/supabase/client';
import { ClassRoom } from '@/types/database';
import { Users, Plus, ArrowLeft, Copy, Check, School, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ClassesPage() {
  const { user, profile, loading, isTeacher } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 학급 생성 폼 상태
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || (!isTeacher && profile?.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, profile, loading, isTeacher, router]);

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, fetchClasses]);

  // 학급 생성
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 6자리 고유 학급 코드 생성 (예: DSH-103)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `CLS-${randomSuffix}`;

    setCreateError(null);
    try {
      const isUuid = user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      const { error } = await supabase.from('classes').insert({
        name: className.trim(),
        description: classDesc.trim() || null,
        teacher_id: isUuid ? user.id : null,
        code,
      });

      if (error) {
        console.warn('Class insert error:', error);
        throw new Error(
          error.code === '42501'
            ? 'Supabase 데이터베이스 RLS 권한 제한으로 학급 생성이 차단되었습니다.'
            : error.message
        );
      }

      setClassName('');
      setClassDesc('');
      setShowModal(false);
      fetchClasses();
    } catch (err: any) {
      console.error('Class create error:', err);
      setCreateError(err.message || '학급 생성 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans antialiased text-slate-900">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              대시보드로 돌아가기
            </Link>
          </div>
          <span className="font-semibold text-sm tracking-tight text-slate-900">
            학급 관리
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            새 학급 개설
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            선생님 학급 목록
          </h1>
          <p className="text-xs text-slate-600 font-normal">
            개설된 학급을 확인하고 학생들에게 참여 코드를 공유하세요.
          </p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <School className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">개설된 학급이 없습니다.</p>
              <p className="text-xs text-slate-500 font-normal">
                새 학급을 개설하여 우리 반 학생들과 함께 사용할 보드를 묶어보세요.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              첫 학급 개설하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between h-48 space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                      코드: {c.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(c.code)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
                      title="학급 코드 복사"
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {c.description || '학급 설명이 없습니다.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-normal">
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/dashboard?classId=${c.id}`}
                    className="text-slate-700 hover:text-slate-900 font-medium"
                  >
                    학급 보드 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 새 학급 개설 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-100 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">새 학급 개설</h2>
              <p className="text-xs text-slate-600 font-normal">
                학급 이름과 설명을 입력하여 새로운 반을 개설합니다.
              </p>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
                  {createError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  학급 이름
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="예: 2학년 3반 / 과학 탐구동아리"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  학급 설명 (선택)
                </label>
                <input
                  type="text"
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  placeholder="예: 2026학년도 2학년 3반 학급 협업 보드 모음"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                >
                  학급 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
