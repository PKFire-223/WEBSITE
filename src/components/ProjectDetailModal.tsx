import React from 'react';
import { X, ExternalLink, CheckCircle2, Layers, Cpu, Sparkles } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {project.category}
              </span>
              <span className="text-xs text-neutral-500 font-mono">{project.date}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {project.title}
            </h3>
            <p className="text-neutral-400 text-sm">{project.summary}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deep Dive Description */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Architecture & Execution</span>
          </h4>
          <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-orange-500" />
            <span>Key Performance Benchmarks</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {project.metrics.map((metric, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs font-mono text-amber-300">
                <span className="text-neutral-500 block text-[10px] mb-1">Metric 0{idx + 1}</span>
                {metric}
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Technical Highlights</span>
          </h4>
          <ul className="space-y-2 pt-1">
            {project.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2 border-t border-neutral-800 pt-4">
          <div className="text-xs font-mono text-neutral-400">Technologies Utilized:</div>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Footers */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Repository</span>
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              onClick={() => {
                if (project.demoUrl?.startsWith('#')) {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-lg transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demonstration</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
