'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMindMapStore } from '@/store/useMindMapStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { decodeShareableUrl } from '@/lib/exportUtils';
import { MindMapCanvasWrapper } from '@/components/canvas/MindMapCanvas';
import { ExportModal } from '@/components/export/ExportModal';
import { Copy, Eye, ArrowLeft, Download, Check } from 'lucide-react';

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { shareId } = use(params);
  const router = useRouter();
  const { setMindMap, title, nodes, edges, description } = useMindMapStore();
  const { saveMindMap } = useDashboardStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [forked, setForked] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const decoded = decodeShareableUrl(shareId);
    if (decoded) {
      setMindMap(decoded, true);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [shareId, setMindMap]);

  const handleFork = () => {
    const newId = `map-forked-${Date.now()}`;
    const forkedMap = {
      id: newId,
      title: `${title} (사본)`,
      description: description || '공유 링크에서 복사한 마인드맵',
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic: false,
    };

    saveMindMap(forkedMap);
    setForked(true);
    setTimeout(() => {
      router.push(`/editor/${newId}`);
    }, 800);
  };

  if (isValid === false) {
    return (
      <div className="w-screen h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <Eye className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">유효하지 않거나 만료된 링크입니다</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            전달받은 공유 링크 코드에 오류가 있거나 손상되었습니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  if (isValid === null) {
    return (
      <div className="w-screen h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-sm font-medium">공유된 마인드맵 해석 중...</span>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0f19]">
      {/* Banner */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
            title="대시보드로 이동"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                읽기 전용 모드
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">공유받은 학생 학습용 마인드맵</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">내보내기</span>
          </button>

          <button
            onClick={handleFork}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/25 transition"
          >
            {forked ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>내 대시보드로 복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>내 대시보드로 가져오기 & 편집</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Canvas */}
      <MindMapCanvasWrapper />

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
