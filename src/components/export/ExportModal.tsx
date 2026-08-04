import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMindMapStore } from '@/store/useMindMapStore';
import { exportToPng, exportToPdf, exportToJson } from '@/lib/exportUtils';
import { X, Image as ImageIcon, FileText, Code2, Download, Check, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { title, description, nodes, edges, mindMapId, isPublic } = useMindMapStore();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<string | null>(null);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const getCanvasElement = (): HTMLElement | null => {
    return document.querySelector('.react-flow__viewport') as HTMLElement;
  };

  const handleExportPng = async () => {
    const element = getCanvasElement();
    if (!element) return;
    setLoadingType('png');
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-마인드맵.png`;
    const success = await exportToPng(element, filename);
    setLoadingType(null);
    if (success) {
      setSuccessType('png');
      setTimeout(() => setSuccessType(null), 3000);
    }
  };

  const handleExportPdf = async () => {
    const element = getCanvasElement();
    if (!element) return;
    setLoadingType('pdf');
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-마인드맵.pdf`;
    const success = await exportToPdf(element, filename);
    setLoadingType(null);
    if (success) {
      setSuccessType('pdf');
      setTimeout(() => setSuccessType(null), 3000);
    }
  };

  const handleExportJson = () => {
    const currentMindMap = {
      id: mindMapId,
      title,
      description,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic,
    };
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-마인드맵.json`;
    exportToJson(currentMindMap, filename);
    setSuccessType('json');
    setTimeout(() => setSuccessType(null), 3000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">마인드맵 내보내기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3.5">
          {/* PNG Option */}
          <button
            onClick={handleExportPng}
            disabled={loadingType !== null}
            className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">PNG 이미지 저장</h3>
                <p className="text-xs text-slate-400">발표자료 및 과제 제출용 고해상도 이미지 파일</p>
              </div>
            </div>
            {loadingType === 'png' ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : successType === 'png' ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
            )}
          </button>

          {/* PDF Option */}
          <button
            onClick={handleExportPdf}
            disabled={loadingType !== null}
            className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">PDF 문서 저장</h3>
                <p className="text-xs text-slate-400">인쇄 및 노트 정리용 벡터 문서 파일</p>
              </div>
            </div>
            {loadingType === 'pdf' ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : successType === 'pdf' ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            )}
          </button>

          {/* JSON Option */}
          <button
            onClick={handleExportJson}
            disabled={loadingType !== null}
            className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl transition group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">JSON 백업 파일</h3>
                <p className="text-xs text-slate-400">나중에 다시 불러오거나 백업하기 위한 데이터 파일</p>
              </div>
            </div>
            {successType === 'json' ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            팁: 상단 '공유하기' 버튼을 누르면 링크로도 인터랙티브하게 전달할 수 있습니다!
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
