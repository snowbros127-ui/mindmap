import React, { useState } from 'react';
import Link from 'next/link';
import { useMindMapStore } from '@/store/useMindMapStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { encodeShareableUrl } from '@/lib/exportUtils';
import { CollaboratorsBadge } from './CollaboratorsBadge';
import {
  ArrowLeft,
  Search,
  Undo2,
  Redo2,
  LayoutGrid,
  Share2,
  Download,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

interface CanvasToolbarProps {
  onOpenExportModal: () => void;
}

export function CanvasToolbar({ onOpenExportModal }: CanvasToolbarProps) {
  const {
    mindMapId,
    title,
    description,
    nodes,
    edges,
    edgeType,
    isPublic,
    searchQuery,
    isReadOnly,
    historyIndex,
    history,
    setTitle,
    setIsPublic,
    setSearchQuery,
    setEdgeType,
    autoLayout,
    undo,
    redo,
  } = useMindMapStore();

  const { saveMindMap } = useDashboardStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleSave = () => {
    saveMindMap({
      id: mindMapId,
      title,
      description,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic,
      edgeType,
    });
  };

  const handleShare = () => {
    const mindMapData = {
      id: mindMapId,
      title,
      description,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic,
      edgeType,
    };
    const encoded = encodeShareableUrl(mindMapData);
    const shareUrl = `${window.location.origin}/share/${encoded}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const matchedCount = searchQuery
    ? nodes.filter((n) => n.data.label.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0;

  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl">
      {/* Left section: Navigation & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>대시보드</span>
        </Link>

        <div className="h-5 w-px bg-slate-800" />

        {/* Title editing */}
        {isEditingTitle && !isReadOnly ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              handleSave();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
                handleSave();
              }
            }}
            autoFocus
            className="bg-slate-950 text-white font-semibold px-2 py-1 rounded border border-blue-500 text-sm outline-none"
          />
        ) : (
          <h1
            onClick={() => !isReadOnly && setIsEditingTitle(true)}
            className={clsx(
              'text-sm font-semibold text-white tracking-wide truncate max-w-[160px] sm:max-w-[240px]',
              !isReadOnly && 'hover:text-blue-400 cursor-pointer transition'
            )}
            title={isReadOnly ? title : '클릭하여 제목 수정'}
          >
            {title}
          </h1>
        )}

        {/* Realtime Collaborators Badge */}
        {!isReadOnly && <CollaboratorsBadge />}
      </div>

      {/* Center: Search, Auto Layout & Edge Style */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Live Search */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="노드 검색..."
            className="pl-8 pr-8 py-1.5 bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl outline-none focus:border-blue-500 transition w-36"
          />
          {searchQuery && (
            <span className="absolute right-2 text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
              {matchedCount}
            </span>
          )}
        </div>

        {/* Edge Style Selector */}
        {!isReadOnly && (
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-xl p-0.5 text-xs">
            {(
              [
                { id: 'smoothstep', label: '직각선' },
                { id: 'bezier', label: '곡선' },
                { id: 'straight', label: '직선' },
              ] as const
            ).map((style) => (
              <button
                key={style.id}
                onClick={() => setEdgeType(style.id)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer',
                  edgeType === style.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        )}

        {/* Auto Layout Selector */}
        {!isReadOnly && (
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-xl p-0.5 text-xs">
            <span className="pl-2.5 pr-1 text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <LayoutGrid className="w-3 h-3 text-blue-400" />
              정렬:
            </span>
            <button
              onClick={() => autoLayout('BOTH')}
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-600/30 transition cursor-pointer"
              title="중심 노드를 기준으로 왼쪽/오른쪽 양방향 균등 배치"
            >
              양방향
            </button>
            <button
              onClick={() => autoLayout('LR')}
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-600/30 transition cursor-pointer"
              title="오른쪽 방향 한쪽으로 정렬"
            >
              오른쪽
            </button>
            <button
              onClick={() => autoLayout('TB')}
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-600/30 transition cursor-pointer"
              title="위에서 아래로 세로 정렬"
            >
              세로
            </button>
          </div>
        )}
      </div>

      {/* Right section: History, Export, Share */}
      <div className="flex items-center gap-2">
        {!isReadOnly && (
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              title="실행 취소 (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              title="다시 실행 (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/70 rounded-xl transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">내보내기</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>링크 복사 완료!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>공유하기</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
