'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/server/supabase/client';
import { AuthService } from '@/features/auth/services/auth-service';
import { UserProfile, StudentInvitation } from '@/types/database';
import { ShieldCheck, Users, Check, X, KeyRound, UserPlus, LogOut, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'password'>('teachers');
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<StudentInvitation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
      // 관리자가 아니면 대시보드로 리다이렉트
      if (user && profile && profile.role !== 'admin') {
        router.push('/dashboard');
      } else if (!user) {
        router.push('/login');
      }
    }
  }, [user, profile, loading, router]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // 1. 교사 목록 조회
      const { data: teachersData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });
      setTeachers(teachersData || []);

      // 2. 학생 초대 명단 조회
      const { data: invitationsData } = await supabase
        .from('student_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      setInvitations(invitationsData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  // 교사 승인 처리
  const handleApproveTeacher = async (teacherId: string, approve: boolean) => {
    try {
      if (approve) {
        await supabase
          .from('users')
          .update({ approved: true })
          .eq('id', teacherId);
      } else {
        await supabase
          .from('users')
          .update({ approved: false })
          .eq('id', teacherId);
      }
      fetchData();
    } catch (err) {
      console.error('Teacher approve error:', err);
    }
  };

  // 비밀번호 변경 처리
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
      await AuthService.updatePassword(newPassword);
      setPasswordMsg({ type: 'success', text: '관리자 비밀번호가 성공적으로 변경되었습니다!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || '비밀번호 변경 실패' });
    }
  };

  // 학생 일괄 등록 처리
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
      setCsvMsg(`${records.length}명의 학생 명단이 성공적으로 등록되었습니다!`);
      fetchData();
    } catch (err: any) {
      setCsvMsg(`등록 실패: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 관리자 헤더 */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
              관
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">서귀포대신중학교 최고 관리자</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              일반 대시보드 가기
            </Link>
            <button
              onClick={() => { signOut(); router.push('/login'); }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'teachers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            교사 승인 관리 ({teachers.filter(t => !t.approved).length}건 대기)
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            학생 일괄 초대 명단 ({invitations.length}명)
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            관리자 비밀번호 변경
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* 1. 교사 승인 관리 탭 */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">교사 가입 승인</h2>
                <p className="text-sm text-slate-500 mt-1">
                  학교 구글 계정으로 가입 신청한 선생님들의 보드 생성 권한을 승인합니다.
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                새로고침
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">교사 성명</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">신청 일시</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">승인 조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        가입 신청한 교사 계정이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{teacher.full_name}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.email}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            teacher.approved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {teacher.approved ? '승인 완료' : '승인 대기'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!teacher.approved ? (
                            <button
                              onClick={() => handleApproveTeacher(teacher.id, true)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              승인
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveTeacher(teacher.id, false)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-xs font-medium transition-colors"
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

        {/* 2. 학생 일괄 등록 탭 */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">학생 명단 일괄 등록 (사전 초대)</h2>
              <p className="text-sm text-slate-500 mt-1">
                등록된 학생만 학교 구글 계정으로 로그인할 수 있습니다. 엑셀에서 복사하여 아래에 붙여넣으세요.
              </p>
            </div>

            <form onSubmit={handleRegisterStudents} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  명단 입력 형식: <code className="text-indigo-600 font-mono">학번, 이름, 이메일</code> (줄바꿈 구분)
                </label>
                <textarea
                  rows={6}
                  value={studentCsv}
                  onChange={(e) => setStudentCsv(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="10101, 홍길동, student1@daeshin.ms.kr"
                />
              </div>

              {csvMsg && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700">
                  {csvMsg}
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs"
              >
                학생 명단 일괄 저장하기
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 font-semibold text-sm text-slate-800">
                등록된 학생 명단 ({invitations.length}명)
              </div>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">학번</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">로그인 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        등록된 학생 명단이 없습니다. 위 입력창에서 등록해 주세요.
                      </td>
                    </tr>
                  ) : (
                    invitations.slice(0, 10).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono font-semibold text-slate-900">{inv.student_number}</td>
                        <td className="px-6 py-3 text-slate-800">{inv.full_name}</td>
                        <td className="px-6 py-3 text-slate-600">{inv.email}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            inv.is_claimed
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-500'
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

        {/* 3. 비밀번호 변경 탭 */}
        {activeTab === 'password' && (
          <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">관리자 비밀번호 변경</h2>
              <p className="text-xs text-slate-500 mt-1">
                기본 비밀번호(12345)를 원하시는 안전한 비밀번호로 변경하세요.
              </p>
            </div>

            {passwordMsg && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  새 비밀번호 (6자 이상)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="새 비밀번호 입력"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs"
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
