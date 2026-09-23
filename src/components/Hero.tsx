import React, { useState } from 'react';
import { Terminal, Flame, Sparkles, ArrowRight, ExternalLink, ShieldCheck, Code2, Zap } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { USER_INFO, TERMINAL_COMMANDS } from '../data/portfolioData';

interface HeroProps {
  onTriggerFire?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onTriggerFire }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string[] }>>([
    {
      cmd: 'pkfire --status',
      output: [
        'Systems Online: v2026.9',
        `Engineer: ${USER_INFO.fullName} (PKFire)`,
        'Status: Ready to build high-scale, resilient applications.'
      ]
    }
  ]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = terminalInput.trim().toLowerCase();
    if (!cleanCmd) return;

    if (cleanCmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    if (cleanCmd === 'fire' && onTriggerFire) {
      onTriggerFire();
    }

    const commandKey = cleanCmd.replace(/^pkfire\s+(--)?/, '');
    const matchedKey = Object.keys(TERMINAL_COMMANDS).find(k => k === commandKey || cleanCmd === k);

    let outputLines = TERMINAL_COMMANDS[matchedKey || ''] || [
      `Command not found: "${cleanCmd}". Type "help" or "pkfire --help" for available commands.`
    ];

    setTerminalHistory(prev => [...prev.slice(-6), { cmd: cleanCmd, output: outputLines }]);
    setTerminalInput('');
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-600/20 via-amber-500/15 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-12 right-10 w-72 h-72 bg-red-600/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{USER_INFO.status}</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Crafting <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">fast</span>, resilient & expressive software.
              </h1>
              <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl font-normal leading-relaxed pt-2">
                Hi, I'm <strong className="text-white font-semibold">{USER_INFO.fullName}</strong> (<span className="text-amber-400 font-mono">PKFire</span>). I build high-concurrency web systems, interactive canvas tools, and developer platforms with precision and taste.
              </p>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#projects"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#pkfire-lab"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/40 text-neutral-200 font-medium text-sm transition-all"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>PK Fire Lab</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">Live Sim</span>
              </a>

              <a
                href={USER_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-400 hover:text-white text-sm transition-all"
                title="View GitHub"
              >
                <GithubIcon className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-neutral-800/80 max-w-xl">
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">100k+</div>
                <div className="text-xs text-neutral-400">Particle Sim Nodes</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">&lt; 5ms</div>
                <div className="text-xs text-neutral-400">Stream Relay P99</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400">100%</div>
                <div className="text-xs text-neutral-400">Type-Safe & Scalable</div>
              </div>
            </div>
          </div>

          {/* Terminal / Live Interactive Console */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl shadow-black/80 overflow-hidden font-mono text-xs backdrop-blur-md">
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-neutral-400 text-[11px] font-sans">pkfire@terminal:~</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                  <span>bash</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Terminal Screen */}
              <div className="p-4 space-y-3 h-72 overflow-y-auto">
                <div className="text-neutral-500 text-[11px]">
                  # Type 'help', 'projects', 'skills', or 'fire' below:
                </div>

                {terminalHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span className="text-amber-500 font-bold">$</span>
                      <span className="text-amber-200">{item.cmd}</span>
                    </div>
                    <div className="pl-3 space-y-0.5 border-l border-neutral-800 text-neutral-400">
                      {item.output.map((line, lIdx) => (
                        <div key={lIdx} className="leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal Command Input Form */}
              <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900/50 border-t border-neutral-800">
                <span className="text-amber-400 font-bold">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type a command (e.g. fire, help)..."
                  className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 outline-none text-xs"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium uppercase tracking-wider transition-colors"
                >
                  Run
                </button>
              </form>
            </div>
            <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-neutral-500 font-mono">
              <span>Interactive CLI Console</span>
              <span>Try typing: <button onClick={() => setTerminalInput('fire')} className="text-amber-400 hover:underline">fire</button></span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
