import React from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { useReactFlow } from '@xyflow/react';
import { Plus, Trash2, Undo2, Redo2, LayoutGrid, Maximize2 } from 'lucide-react';

export function TouchToolbar() {
  const {
    selectedNodeId,
    nodes,
    addChildNode,
    addSiblingNode,
    deleteSelectedNodes,
    autoLayout,
    undo,
    redo,
    historyIndex,
    history,
    isReadOnly,
  } = useMindMapStore();

  const { fitView } = useReactFlow();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl p-2 rounded-2xl shadow-2xl touch-none select-none">
      {/* Node action buttons when node selected */}
      {!isReadOnly && selectedNode && (
        <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
          <button
            onClick={() => addChildNode(selectedNodeId || undefined)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl shadow-lg transition"
            title="자식 노드 추가 (Tab / 터치)"
          >
            <Plus className="w-4 h-4" />
            <span>+ 자식</span>
          </button>

          <button
            onClick={() => addSiblingNode(selectedNodeId || undefined)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl shadow-lg transition"
            title="형제 노드 추가 (Enter / 터치)"
          >
            <Plus className="w-4 h-4" />
            <span>+ 형제</span>
          </button>

          {!selectedNode.data.isRoot && (
            <button
              onClick={deleteSelectedNodes}
              className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 active:scale-95 rounded-xl transition"
              title="선택 노드 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Global Actions */}
      <div className="flex items-center gap-1">
        {!isReadOnly && (
          <>
            <button
              onClick={() => autoLayout('LR')}
              className="p-2 text-blue-400 hover:text-blue-200 hover:bg-slate-800 active:scale-95 rounded-xl transition"
              title="자동 정렬"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 active:scale-95 rounded-xl transition"
              title="실행 취소"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 active:scale-95 rounded-xl transition"
              title="다시 실행"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
          className="p-2 text-purple-400 hover:text-purple-200 hover:bg-slate-800 active:scale-95 rounded-xl transition"
          title="화면 맞춤"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
