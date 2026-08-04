import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMindMapStore } from '@/store/useMindMapStore';
import { Users, Radio, Check, Copy, X } from 'lucide-react';

export function CollaboratorsBadge() {
  const {
    isRealtimeActive,
    collaborators,
    initRealtimeSession,
    mindMapId,
  } = useMindMapStore();

  const [studentNameInput, setStudentNameInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const collabList = Object.values(collaborators);

  const handleStartRealtime = () => {
    initRealtimeSession(mindMapId, studentNameInput || undefined);
    setShowModal(false);
  };

  const handleCopyRoomLink = () => {
    const roomUrl = `${window.location.origin}/editor/${mindMapId}?room=${mindMapId}`;
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isRealtimeActive ? (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {collabList.length + 1}명 동시 편집 중
            </span>

            <button
              onClick={handleCopyRoomLink}
              className="p-1 hover:bg-emerald-900/60 rounded text-emerald-200 transition"
              title="초대 링크 복사"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 rounded-xl shadow-lg transition"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>실시간 동시 편집 참여</span>
          </button>
        )}
      </div>

      {/* Portal Modal anchored directly to document.body */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white">실시간 동시 편집 참가</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              학생들과 실시간으로 커서와 노드 수정을 공유하며 함께 마인드맵을 작성합니다.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                학생 이름 또는 닉네임
              </label>
              <input
                type="text"
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartRealtime();
                }}
                placeholder="예: 김철수 학생"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleStartRealtime}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition"
              >
                실시간 세션 시작
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
