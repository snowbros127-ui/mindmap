'use client';

import React, { useEffect, useState, use } from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { MindMapCanvasWrapper } from '@/components/canvas/MindMapCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ExportModal } from '@/components/export/ExportModal';
import { MindMap } from '@/types/mindmap';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params);
  const { setMindMap } = useMindMapStore();
  const { mindMaps, loadMindMaps } = useDashboardStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadMindMaps();
  }, [loadMindMaps]);

  useEffect(() => {
    const existing = mindMaps.find((m) => m.id === id);
    if (existing) {
      setMindMap(existing, false);
      setIsLoaded(true);
    } else {
      const blankMap: MindMap = {
        id,
        title: id === 'new-map' ? '새 마인드맵' : '제목 없는 마인드맵',
        nodes: [
          {
            id: 'node-root',
            type: 'mindMapNode',
            position: { x: 0, y: 0 },
            data: { label: '새 학습 주제 💡', emoji: '💡', colorPreset: 'indigo', fontSize: 'xl', isRoot: true },
          },
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false,
        category: 'general',
      };
      setMindMap(blankMap, false);
      setIsLoaded(true);
    }
  }, [id, mindMaps, setMindMap]);

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">마인드맵 캔버스 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0f19]">
      <CanvasToolbar onOpenExportModal={() => setIsExportOpen(true)} />
      <MindMapCanvasWrapper />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
