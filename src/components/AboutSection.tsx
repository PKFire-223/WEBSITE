import React from 'react';
import { Terminal, Shield, Zap, Sparkles, Heart, Compass, CheckCircle } from 'lucide-react';
import { USER_INFO } from '../data/portfolioData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 border-t border-neutral-900 bg-neutral-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Background & Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Driven by simplicity, speed, and deep craft.
            </h2>

            <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
              <p>
                I'm <strong className="text-white font-semibold">{USER_INFO.fullName}</strong>, widely known as <strong className="text-amber-400 font-mono">PKFire</strong> across engineering communities. My journey began with game development and algorithmic problem solving, which ingrained in me a relentless obsession with runtime performance and low-latency systems.
              </p>
              <p>
                Today, I construct end-to-end web applications, distributed streaming bridges, and developer utilities. I treat software engineering as an art form — prioritizing pristine code ergonomics, deterministic state machines, and interfaces that feel instantaneous to the touch.
              </p>
              <p>
                When I'm not writing TypeScript or optimizing render loops, you'll find me analyzing distributed system papers, designing accessible UI tokens, or collaborating with open-source builders.
              </p>
            </div>

            {/* Core Tenets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Performance First</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Every millisecond of latency counts. Zero redundant re-renders and minimal payload footprints.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-orange-400 font-mono text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Resilient Foundations</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Defensive validation, strict typing contracts, and graceful offline degradation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Fast Facts & Setup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Developer Spec Sheet</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500">Handle</span>
                  <span className="text-amber-400 font-bold">PKFire-223</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500">Primary Ecosystem</span>
                  <span className="text-neutral-200">TypeScript / React / Node.js</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500">Editor & Theme</span>
                  <span className="text-neutral-200">VS Code / JetBrains Mono</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500">Location</span>
                  <span className="text-neutral-200">{USER_INFO.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500">Availability</span>
                  <span className="text-emerald-400">Contracts & Full-time</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Currently Exploring</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  WebGL compute shaders, WebAssembly high-throughput data transforms, and local-first syncing algorithms (CRDTs).
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
