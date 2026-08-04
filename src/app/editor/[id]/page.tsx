'use client';

import React, { useEffect, useState, use } from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { MindMapCanvasWrapper } from '@/components/canvas/MindMapCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ExportModal } from '@/components/export/ExportModal';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params);
  const { setMindMap } = useMindMapStore();
  const { mindMaps, loadMindMaps, createEmptyMap } = useDashboardStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadMindMaps();
  }, [loadMindMaps]);

  useEffect(() => {
    if (mindMaps.length > 0) {
      const existing = mindMaps.find((m) => m.id === id);
      if (existing) {
        setMindMap(existing, false);
      } else {
        const newMap = createEmptyMap();
        setMindMap(newMap, false);
      }
      setIsLoaded(true);
    } else {
      // Fallback
      const newMap = createEmptyMap();
      setMindMap(newMap, false);
      setIsLoaded(true);
    }
  }, [id, mindMaps, setMindMap, createEmptyMap]);

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading mind map canvas...</span>
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
