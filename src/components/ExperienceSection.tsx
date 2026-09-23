import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, Award, Terminal } from 'lucide-react';
import { EXPERIENCES } from '../data/portfolioData';

export const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-20 border-t border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Milestones</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Experience & Engineering Journey
          </h2>
          <p className="text-neutral-400 text-sm">
            Proven track record of turning complex technical specifications into performant, elegant, and maintainable software.
          </p>
        </div>

        {/* Timeline List */}
        <div className="space-y-6">
          {EXPERIENCES.map((exp, idx) => (
            <div
              key={exp.id}
              className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {exp.type}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exp.location}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {exp.role}
                  </h3>
                  <div className="text-sm font-semibold text-neutral-300 mt-0.5">
                    {exp.organization}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400 self-start">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{exp.period}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                {exp.summary}
              </p>

              {/* Achievement bullets */}
              <ul className="space-y-2 mb-6">
                {exp.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Skills Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-neutral-800/80">
                <span className="text-[11px] font-mono text-neutral-500 mr-2">Key Tech:</span>
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded bg-neutral-950 text-[10px] font-mono text-neutral-400 border border-neutral-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
