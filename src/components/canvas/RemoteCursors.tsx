import React from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { MousePointer2 } from 'lucide-react';

export function RemoteCursors() {
  const { collaborators } = useMindMapStore();
  const collabList = Object.values(collaborators);

  if (collabList.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {collabList.map((collab) => {
        if (!collab.cursor) return null;

        return (
          <div
            key={collab.id}
            className="absolute transition-all duration-75 ease-out flex items-center gap-1 z-50"
            style={{
              left: `${collab.cursor.x}px`,
              top: `${collab.cursor.y}px`,
            }}
          >
            <MousePointer2
              className="w-4 h-4 drop-shadow-md"
              style={{ color: collab.color, fill: collab.color }}
            />
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg whitespace-nowrap"
              style={{ backgroundColor: collab.color }}
            >
              {collab.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
