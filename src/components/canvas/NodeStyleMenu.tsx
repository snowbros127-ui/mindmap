import React from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { NodeColorPreset } from '@/types/mindmap';
import { Palette, Type, Smile, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

const COLOR_OPTIONS: { id: NodeColorPreset; label: string; colorBg: string }[] = [
  { id: 'indigo', label: '남색', colorBg: 'bg-indigo-500' },
  { id: 'emerald', label: '초록', colorBg: 'bg-emerald-500' },
  { id: 'cyan', label: '청록', colorBg: 'bg-cyan-400' },
  { id: 'amber', label: '주황', colorBg: 'bg-amber-400' },
  { id: 'crimson', label: '빨강', colorBg: 'bg-rose-500' },
  { id: 'violet', label: '보라', colorBg: 'bg-purple-500' },
  { id: 'slate', label: '회색', colorBg: 'bg-slate-500' },
];

const EMOJI_PRESETS = ['💡', '🎓', '📖', '🧠', '📐', '⚡', '📝', '🚀', '⭐', '🔥', '✅', '🎯', '📌'];

export function NodeStyleMenu() {
  const {
    nodes,
    selectedNodeId,
    setNodeColorPreset,
    setNodeFontSize,
    setNodeEmoji,
    addChildNode,
    addSiblingNode,
    deleteSelectedNodes,
    isReadOnly,
  } = useMindMapStore();

  if (isReadOnly || !selectedNodeId) return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const currentNodeData = selectedNode.data;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Colors */}
      <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
        <Palette className="w-4 h-4 text-slate-400 mr-1" />
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setNodeColorPreset(selectedNodeId, c.id)}
            className={clsx(
              'w-5 h-5 rounded-full transition-transform hover:scale-125 border border-white/20',
              c.colorBg,
              currentNodeData.colorPreset === c.id && 'ring-2 ring-white scale-110'
            )}
            title={c.label}
          />
        ))}
      </div>

      {/* Font sizes */}
      <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
        <Type className="w-4 h-4 text-slate-400 mr-1" />
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <button
            key={size}
            onClick={() => setNodeFontSize(selectedNodeId, size)}
            className={clsx(
              'px-2 py-0.5 text-xs font-semibold rounded transition',
              currentNodeData.fontSize === size
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {size.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Emoji picker */}
      <div className="flex items-center gap-1 border-r border-slate-800 pr-3 max-w-[180px] overflow-x-auto scrollbar-none py-1">
        <Smile className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
        {EMOJI_PRESETS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setNodeEmoji(selectedNodeId, emoji)}
            className={clsx(
              'p-1 text-sm rounded hover:bg-slate-800 transition shrink-0',
              currentNodeData.emoji === emoji && 'bg-blue-600/50'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => addChildNode(selectedNodeId)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          title="자식 노드 추가 (Tab)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>자식</span>
        </button>

        <button
          onClick={() => addSiblingNode(selectedNodeId)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
          title="형제 노드 추가 (Enter)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>형제</span>
        </button>

        {!currentNodeData.isRoot && (
          <button
            onClick={() => deleteSelectedNodes()}
            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition"
            title="노드 삭제 (Delete)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
