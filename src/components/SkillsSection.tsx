import React, { useState } from 'react';
import { Cpu, Server, Layout, CheckCircle, Terminal, Layers, Zap, Database } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';

export const SkillsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
        return <Layout className="w-4 h-4 text-amber-400" />;
      case 'Server':
        return <Server className="w-4 h-4 text-orange-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-red-400" />;
      default:
        return <Terminal className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="skills" className="py-20 border-t border-neutral-900 bg-neutral-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Capability Index</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Stack & Engineering Mastery
          </h2>
          <p className="text-neutral-400 text-sm">
            Disciplined full-stack foundation focused on sub-second rendering, type-safe API boundaries, and dependable operational health.
          </p>
        </div>

        {/* Categories Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {SKILL_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.title}
              onClick={() => setActiveTab(idx)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeTab === idx
                  ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <h3 className="font-bold text-white text-base">{cat.title}</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {cat.description}
              </p>
            </button>
          ))}
        </div>

        {/* Active Skills Content */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/70 border border-neutral-800 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
            <div>
              <h4 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>{SKILL_CATEGORIES[activeTab].title}</span>
                <span className="text-xs text-neutral-500 font-normal">
                  ({SKILL_CATEGORIES[activeTab].skills.length} core proficiencies)
                </span>
              </h4>
            </div>
            <div className="text-xs font-mono text-neutral-400 hidden sm:block">
              Continuous iteration & daily production usage
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_CATEGORIES[activeTab].skills.map((skill) => (
              <div
                key={skill.name}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-sm font-semibold text-neutral-100 font-mono">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {skill.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {skill.level}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Philosophy Banner */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-neutral-200">Zero-Compromise Types</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">End-to-end typed contracts between client, schema, and API.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-neutral-200">60 FPS Render Budget</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">Offloading heavy math to workers, zero jank or frame drops.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-neutral-200">Defensive Architecture</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">Graceful fallbacks, resilient retries, and comprehensive error traps.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
