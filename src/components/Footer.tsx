import React from 'react';
import { Flame, ArrowUp, Heart } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { USER_INFO } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span>{USER_INFO.name}</span>
                <span className="text-[10px] text-amber-500 px-1.5 py-0.2 rounded bg-amber-500/10">223</span>
              </div>
              <div className="text-xs text-neutral-500">{USER_INFO.tagline}</div>
            </div>
          </div>

          {/* Center text */}
          <div className="text-xs text-neutral-400 font-mono text-center">
            Designed & Engineered with React 19, TypeScript & Tailwind CSS
          </div>

          {/* Action links & Scroll to Top */}
          <div className="flex items-center gap-4">
            <a
              href={USER_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono transition-colors"
              title="Return to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono gap-2">
          <div>© {new Date().getFullYear()} PKFire-223. All rights reserved.</div>
          <div>Node.js 22 • 0.0.0.0:3000 • Production Ready</div>
        </div>
      </div>
    </footer>
  );
};
