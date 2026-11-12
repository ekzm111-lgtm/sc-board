'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/server/supabase/client';
import { AuthService } from '@/features/auth/services/auth-service';
import { UserProfile, StudentInvitation } from '@/types/database';
import { Users, Check, X, KeyRound, UserPlus, LogOut, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'password'>('teachers');
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<StudentInvitation[]>([]);

  // 비밀번호 변경 폼
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 학생 일괄 등록 폼
  const [studentCsv, setStudentCsv] = useState('10101, 홍길동, student1@daeshin.ms.kr\n10102, 김영희, student2@daeshin.ms.kr');
  const [csvMsg, setCsvMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      if (user && profile && profile.role !== 'admin') {
        router.push('/dashboard');
      } else if (!user) {
        router.push('/login');
      }
    }
  }, [user, profile, loading, router]);

  const fetchData = useCallback(async () => {
    try {
      const { data: teachersData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });
      setTeachers(teachersData || []);

      const { data: invitationsData } = await supabase
        .from('student_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      setInvitations(invitationsData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile, fetchData]);

  const handleApproveTeacher = async (teacherId: string, approve: boolean) => {
    try {
      await supabase
        .from('users')
        .update({ approved: approve })
        .eq('id', teacherId);
      fetchData();
    } catch (err) {
      console.error('Teacher approve error:', err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: '비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    try {
      AuthService.changeAdminPassword(newPassword);
      setPasswordMsg({ type: 'success', text: '관리자 비밀번호가 성공적으로 변경되었습니다.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || '비밀번호 변경 실패' });
    }
  };

  const handleRegisterStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    setCsvMsg(null);
    const lines = studentCsv.split('\n').filter(l => l.trim().length > 0);
    const records = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const studentNumber = parts[0];
        const fullName = parts[1];
        const email = parts[2];
        const grade = parseInt(studentNumber.substring(0, 1)) || null;
        const classNum = parseInt(studentNumber.substring(1, 3)) || null;

        records.push({
          student_number: studentNumber,
          full_name: fullName,
          email,
          grade,
          class_num: classNum,
          school_code: 'DAESHIN_MS',
        });
      }
    }

    if (records.length === 0) {
      setCsvMsg('형식에 맞는 학생 정보가 없습니다. (학번, 이름, 이메일)');
      return;
    }

    try {
      const { error } = await supabase
        .from('student_invitations')
        .upsert(records, { onConflict: 'email' });

      if (error) throw error;
      setCsvMsg(`${records.length}명의 학생 명단이 등록되었습니다.`);
      fetchData();
    } catch (err: any) {
      setCsvMsg(`등록 실패: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans antialiased text-slate-900">
      {/* 관리자 헤더 */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-medium text-white text-xs">
              관
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm tracking-tight">서귀포대신중학교 관리자</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 font-normal">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              일반 대시보드
            </Link>
            <button
              onClick={() => { signOut(); router.push('/login'); }}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`py-4 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'teachers'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 stroke-[1.75]" />
            교사 승인 관리 ({teachers.filter(t => !t.approved).length}건 대기)
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4 stroke-[1.75]" />
            학생 일괄 초대 명단 ({invitations.length}명)
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'password'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 stroke-[1.75]" />
            관리자 비밀번호 변경
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 (호흡이 긴 여백과 얇은 테두리) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">교사 가입 승인</h2>
                <p className="text-xs text-slate-600 font-normal">
                  가입 신청한 선생님들의 보드 생성 권한을 승인합니다.
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                새로고침
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-500">교사 성명</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-500">이메일</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-500">신청 일시</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-500">상태</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-slate-500">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-normal">
                        가입 신청한 교사 계정이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{teacher.full_name}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.email}</td>
                        <td className="px-6 py-4 text-slate-400 font-normal">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-[11px] font-normal rounded-md border ${
                            teacher.approved
                              ? 'bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {teacher.approved ? '승인 완료' : '대기 중'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!teacher.approved ? (
                            <button
                              onClick={() => handleApproveTeacher(teacher.id, true)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              승인
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveTeacher(teacher.id, false)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-normal transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              승인 취소
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">학생 명단 일괄 등록</h2>
              <p className="text-xs text-slate-600 font-normal">
                등록된 학생만 학교 구글 계정으로 로그인할 수 있습니다. 엑셀에서 복사하여 아래에 붙여넣으세요.
              </p>
            </div>

            <form onSubmit={handleRegisterStudents} className="bg-white p-8 rounded-2xl border border-slate-100 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  명단 입력 형식: <code className="text-slate-900 font-mono font-semibold">학번, 이름, 이메일</code> (줄바꿈 구분)
                </label>
                <textarea
                  rows={6}
                  value={studentCsv}
                  onChange={(e) => setStudentCsv(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-400 leading-relaxed"
                  placeholder="10101, 홍길동, student1@daeshin.ms.kr"
                />
              </div>

              {csvMsg && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-normal">
                  {csvMsg}
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
              >
                학생 명단 일괄 저장하기
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-medium text-xs text-slate-800">
                등록된 학생 명단 ({invitations.length}명)
              </div>
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-slate-500">학번</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-500">이름</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-500">이메일</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-500">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-normal">
                        등록된 학생 명단이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    invitations.slice(0, 10).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono text-slate-900">{inv.student_number}</td>
                        <td className="px-6 py-3 text-slate-800 font-medium">{inv.full_name}</td>
                        <td className="px-6 py-3 text-slate-600">{inv.email}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-[11px] font-normal rounded-md border ${
                            inv.is_claimed
                              ? 'bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {inv.is_claimed ? '연동 완료' : '미접속'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-100 space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">관리자 비밀번호 변경</h2>
              <p className="text-xs text-slate-600 font-normal">
                기본 비밀번호(12345)를 안전한 비밀번호로 변경하세요.
              </p>
            </div>

            {passwordMsg && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  새 비밀번호 (6자 이상)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="새 비밀번호 입력"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
              >
                비밀번호 변경 저장
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
