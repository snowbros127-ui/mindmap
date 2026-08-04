import React from 'react';
import { useRouter } from 'next/navigation';
import { MINDMAP_TEMPLATES } from '@/lib/templates';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Sparkles, ArrowRight } from 'lucide-react';

export function TemplateSelector() {
  const router = useRouter();
  const { createFromTemplate } = useDashboardStore();

  const handleSelectTemplate = (templateId: string) => {
    const newMap = createFromTemplate(templateId);
    router.push(`/editor/${newMap.id}`);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            빠른 시작 학습 템플릿
          </h2>
          <p className="text-xs text-slate-400">
            검증된 전공/시험/독서 템플릿을 선택하여 빠르게 작성을 시작하세요
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {MINDMAP_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => handleSelectTemplate(tmpl.id)}
            className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2 bg-slate-800/80 rounded-xl group-hover:scale-110 transition">
                {tmpl.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800/50">
                {tmpl.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1">
              {tmpl.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {tmpl.description}
            </p>

            <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition">
              <span>템플릿 사용하기</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
