import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getBezierPath,
  getStraightPath,
  EdgeProps,
} from '@xyflow/react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { X } from 'lucide-react';

export function CustomMindEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const { edgeType, onEdgesChange, saveHistoryStep, isReadOnly } = useMindMapStore();
  const [isHovered, setIsHovered] = useState(false);

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (edgeType === 'bezier') {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else if (edgeType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdgesChange([{ id, type: 'remove' }]);
    saveHistoryStep();
  };

  const showButton = !isReadOnly && (selected || isHovered);

  return (
    <>
      {/* Invisible wider interaction path for easy clicking/hovering */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible Edge Line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected || isHovered ? 3.5 : 2.5,
          filter: selected ? 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))' : undefined,
        }}
      />

      {/* Floating Delete Button at Edge Center */}
      {!isReadOnly && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan transition-all duration-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition-all transform duration-150 border border-slate-950 cursor-pointer ${
                showButton ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
              }`}
              title="연결선 삭제"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold pr-0.5">삭제</span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
