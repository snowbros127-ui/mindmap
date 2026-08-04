import Link from 'next/link';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  Share2,
  BookOpen,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MindCraft Study
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition duration-200"
            >
              대시보드 이동
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-800/60 text-blue-300 mb-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>학생과 교사를 위한 스마트 마인드맵 학습 플랫폼</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
          개념 정리부터 시험 대비까지{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            마인드맵으로 쉽고 빠르게.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          단축키(<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 font-mono">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 font-mono">Enter</kbd>), 가지접기, 직각/곡선 연결선, 색상 테마, 실시간 공유링크 및 PNG/PDF 내보내기를 자유롭게 활용해보세요.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition duration-200 flex items-center justify-center gap-2"
          >
            <span>마인드맵 대시보드 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/editor/new-map"
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl transition duration-200 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>빈 캔버스 만들기</span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 hover:border-blue-500/40 transition duration-300">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">초속 단축키 & 가지 접기</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              마우스 없이 <code className="text-blue-300">Tab</code>(하위) 및 <code className="text-emerald-300">Enter</code>(형제) 단축키로 작성하고, 노드가 많아지면 가지 접기 버튼으로 깔끔하게 정리하세요.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/40 transition duration-300">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">학습 전용 템플릿</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              기말고사 시험 플랜, 독서 요약 노트, 인공지능/생명과학 총정리 템플릿으로 몇 초 만에 마인드맵 생성을 시작할 수 있습니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 hover:border-purple-500/40 transition duration-300">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">URL 공유 & 포크(복사)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              친구와 교사에게 압축 URL로 마인드맵을 전송하세요. 공유받은 사람은 인터랙티브하게 확인하고 '내 대시보드로 복사'할 수 있습니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>MindCraft Study • 학생 및 교사를 위한 마인드맵 앱</p>
      </footer>
    </div>
  );
}
