import React, { useState } from 'react';
import Link from 'next/link';
import { MindMap } from '@/types/mindmap';
import { useDashboardStore } from '@/store/useDashboardStore';
import { encodeShareableUrl } from '@/lib/exportUtils';
import {
  Calendar,
  Share2,
  Copy,
  Trash2,
  Edit3,
  Layers,
  Check,
} from 'lucide-react';

interface MindMapCardProps {
  map: MindMap;
}

export function MindMapCard({ map }: MindMapCardProps) {
  const { deleteMindMap, duplicateMindMap } = useDashboardStore();
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const encoded = encodeShareableUrl(map);
    const shareUrl = `${window.location.origin}/share/${encoded}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    duplicateMindMap(map.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`"${map.title}" 마인드맵을 삭제하시겠습니까?`)) {
      deleteMindMap(map.id);
    }
  };

  const formattedDate = new Date(map.updatedAt || Date.now()).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 group-hover:bg-blue-600/20 rounded-full blur-2xl transition duration-500" />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-800/60 text-blue-300">
            <Layers className="w-3.5 h-3.5" />
            노드 {map.nodes?.length || 0}개
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
              title="공유 링크 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDuplicate}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
              title="마인드맵 복사"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/editor/${map.id}`} className="block group-hover:text-blue-400 transition">
          <h3 className="text-base font-bold text-white tracking-wide mb-1.5 line-clamp-1">
            {map.title}
          </h3>
          {map.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {map.description}
            </p>
          )}
        </Link>
      </div>

      {/* Footer info & CTA */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formattedDate}</span>
        </div>

        <Link
          href={`/editor/${map.id}`}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-800 group-hover:bg-blue-600 text-slate-200 group-hover:text-white rounded-xl transition duration-200"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>편집기 열기</span>
        </Link>
      </div>
    </div>
  );
}
