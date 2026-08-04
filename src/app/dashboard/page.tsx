'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/useDashboardStore';
import { MindMapCard } from '@/components/dashboard/MindMapCard';
import { TemplateSelector } from '@/components/dashboard/TemplateSelector';
import {
  Plus,
  Search,
  Brain,
  Upload,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardPage() {
  const router = useRouter();
  const {
    mindMaps,
    searchQuery,
    categoryFilter,
    loadMindMaps,
    createEmptyMap,
    saveMindMap,
    setSearchQuery,
    setCategoryFilter,
  } = useDashboardStore();

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadMindMaps();
  }, [loadMindMaps]);

  const handleCreateNew = () => {
    const newMap = createEmptyMap();
    router.push(`/editor/${newMap.id}`);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.nodes && parsed.edges) {
        const newMap = {
          ...parsed,
          id: `map-${Date.now()}`,
          title: parsed.title ? `${parsed.title} (가져옴)` : '가져온 마인드맵',
          updatedAt: new Date().toISOString(),
        };
        saveMindMap(newMap);
        setShowImportModal(false);
        setImportJsonText('');
        router.push(`/editor/${newMap.id}`);
      } else {
        alert('올바른 마인드맵 JSON 형식이 아닙니다.');
      }
    } catch (e) {
      alert('JSON 코드를 해석하지 못했습니다.');
    }
  };

  const filteredMaps = mindMaps.filter((map) => {
    const matchesSearch =
      map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (map.description && map.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || map.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MindCraft Study
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/80 transition"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              <span>JSON 불러오기</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>새 마인드맵</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Templates */}
        <TemplateSelector />

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: '전체' },
              { id: 'study', label: '학습 및 시험' },
              { id: 'book', label: '독서 노트' },
              { id: 'concept', label: '개념 지도' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap',
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="마인드맵 제목 검색..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Grid List */}
        {filteredMaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.map((map) => (
              <MindMapCard key={map.id} map={map} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">저장된 마인드맵이 없습니다</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              상단의 학습 템플릿을 선택하거나 새 마인드맵을 만들어 공부 정리를 시작해보세요!
            </p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
            >
              새 마인드맵 만들기
            </button>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">마인드맵 JSON 불러오기</h3>
            <p className="text-xs text-slate-400 mb-4">내보냈던 JSON 코드를 아래에 붙여넣으세요</p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="JSON 코드를 이곳에 붙여넣으세요..."
              className="w-full p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl outline-none focus:border-purple-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleImportJson}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition"
              >
                마인드맵 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
