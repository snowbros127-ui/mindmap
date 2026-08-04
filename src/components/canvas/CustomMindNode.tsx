import React, { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CustomNodeData, NodeColorPreset } from '@/types/mindmap';
import { useMindMapStore } from '@/store/useMindMapStore';
import { clsx } from 'clsx';
import { Plus, Trash2, ChevronRight, Square } from 'lucide-react';

const COLOR_PRESETS: Record<NodeColorPreset, { bg: string; border: string; text: string; badge: string }> = {
  indigo: {
    bg: 'bg-indigo-950/80 hover:bg-indigo-900/90',
    border: 'border-indigo-500/60',
    text: 'text-indigo-100',
    badge: 'bg-indigo-600 border-indigo-400 text-white',
  },
  emerald: {
    bg: 'bg-emerald-950/80 hover:bg-emerald-900/90',
    border: 'border-emerald-500/60',
    text: 'text-emerald-100',
    badge: 'bg-emerald-600 border-emerald-400 text-white',
  },
  cyan: {
    bg: 'bg-cyan-950/80 hover:bg-cyan-900/90',
    border: 'border-cyan-500/60',
    text: 'text-cyan-100',
    badge: 'bg-cyan-600 border-cyan-400 text-white',
  },
  amber: {
    bg: 'bg-amber-950/80 hover:bg-amber-900/90',
    border: 'border-amber-500/60',
    text: 'text-amber-100',
    badge: 'bg-amber-600 border-amber-400 text-white',
  },
  crimson: {
    bg: 'bg-rose-950/80 hover:bg-rose-900/90',
    border: 'border-rose-500/60',
    text: 'text-rose-100',
    badge: 'bg-rose-600 border-rose-400 text-white',
  },
  violet: {
    bg: 'bg-purple-950/80 hover:bg-purple-900/90',
    border: 'border-purple-500/60',
    text: 'text-purple-100',
    badge: 'bg-purple-600 border-purple-400 text-white',
  },
  slate: {
    bg: 'bg-slate-900/80 hover:bg-slate-800/90',
    border: 'border-slate-600/60',
    text: 'text-slate-100',
    badge: 'bg-slate-600 border-slate-400 text-white',
  },
};

const FONT_SIZES = {
  sm: 'text-xs py-1.5 px-3 min-w-[120px]',
  md: 'text-sm py-2 px-4 min-w-[150px]',
  lg: 'text-base py-2.5 px-5 min-w-[180px] font-medium',
  xl: 'text-lg py-3 px-6 min-w-[210px] font-semibold',
};

export const CustomMindNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(nodeData.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<number>(0);

  const {
    edges,
    updateNodeData,
    addFreeNode,
    addChildNode,
    addSiblingNode,
    deleteSelectedNodes,
    toggleCollapseNode,
    isReadOnly,
  } = useMindMapStore();

  const childEdges = edges.filter((e) => e.source === id);
  const hasChildren = childEdges.length > 0;
  const isCollapsed = nodeData.isCollapsed;

  const colorScheme = COLOR_PRESETS[nodeData.colorPreset || 'indigo'];
  const fontSizeClass = FONT_SIZES[nodeData.fontSize || 'md'];

  useEffect(() => {
    setLabel(nodeData.label || '');
  }, [nodeData.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReadOnly) {
      setIsEditing(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      e.stopPropagation();
      if (!isReadOnly) {
        setIsEditing(true);
      }
    }
    lastTapRef.current = now;
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (label.trim() !== nodeData.label) {
      updateNodeData(id, { label: label.trim() || '제목 없음' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBlur();
      } else if (e.key === 'Escape') {
        setLabel(nodeData.label);
        setIsEditing(false);
      }
      return;
    }

    if (selected && !isReadOnly) {
      if (e.key === 'Tab') {
        e.preventDefault();
        addChildNode(id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addSiblingNode(id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!nodeData.isRoot) {
          e.preventDefault();
          deleteSelectedNodes();
        }
      }
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        'group relative rounded-xl border backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer select-none outline-none touch-manipulation',
        colorScheme.bg,
        colorScheme.border,
        colorScheme.text,
        fontSizeClass,
        selected && 'ring-2 ring-blue-500 scale-[1.03] shadow-blue-500/20 shadow-2xl',
        nodeData.isHighlighted && 'ring-4 ring-amber-400 shadow-amber-500/50 animate-pulse',
        nodeData.isRoot && 'shadow-indigo-500/30 border-2 font-bold'
      )}
    >
      {/* Both Target & Source Handles on Left, Right, Top, Bottom for seamless bi-directional connections */}
      {/* Left side handles */}
      <Handle type="target" position={Position.Left} id="left-in" className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Left} id="left-out" className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900" />

      {/* Right side handles */}
      <Handle type="target" position={Position.Right} id="right-in" className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} id="right-out" className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900" />

      {/* Top side handles */}
      <Handle type="target" position={Position.Top} id="top-in" className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Top} id="top-out" className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-900" />

      {/* Bottom side handles */}
      <Handle type="target" position={Position.Bottom} id="bottom-in" className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} id="bottom-out" className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-slate-900" />

      {/* Content */}
      <div className="flex items-center gap-2">
        {nodeData.emoji && <span className="text-base select-none">{nodeData.emoji}</span>}

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-900/90 text-white rounded px-2 py-0.5 border border-blue-400 outline-none text-sm font-normal"
          />
        ) : (
          <span className="break-words leading-tight flex-1">{nodeData.label}</span>
        )}
      </div>

      {/* Branch Collapse/Expand Button Badge */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapseNode(id);
          }}
          className={clsx(
            'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border shadow-md flex items-center justify-center text-[10px] font-bold z-30 transition hover:scale-125',
            colorScheme.badge,
            isCollapsed && 'animate-bounce'
          )}
          title={isCollapsed ? '하위 가지 펼치기' : '하위 가지 접기'}
        >
          {isCollapsed ? `+${childEdges.length}` : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Quick Action Overlay on Select */}
      {selected && !isReadOnly && !isEditing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-xl text-xs z-50 backdrop-blur-md">
          <button
            title="독립 박스 추가"
            onClick={(e) => {
              e.stopPropagation();
              addFreeNode();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition active:scale-95"
          >
            <Square className="w-3.5 h-3.5" />
            <span>독립</span>
          </button>
          <button
            title="자식 노드 추가 (Tab)"
            onClick={(e) => {
              e.stopPropagation();
              addChildNode(id);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>자식</span>
          </button>
          <button
            title="형제 노드 추가 (Enter)"
            onClick={(e) => {
              e.stopPropagation();
              addSiblingNode(id);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>형제</span>
          </button>
          {!nodeData.isRoot && (
            <button
              title="노드 삭제 (Delete)"
              onClick={(e) => {
                e.stopPropagation();
                deleteSelectedNodes();
              }}
              className="p-1 hover:bg-rose-600/80 text-rose-300 hover:text-white rounded transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

CustomMindNode.displayName = 'CustomMindNode';
