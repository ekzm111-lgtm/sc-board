'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BoardDetailView from '@/components/board/board-detail-view';

function BoardQueryContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get('id') || '';

  return <BoardDetailView boardId={boardId} />;
}

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center font-sans">
        <div className="text-xs text-slate-500 font-normal">보드를 불러오는 중...</div>
      </div>
    }>
      <BoardQueryContent />
    </Suspense>
  );
}
