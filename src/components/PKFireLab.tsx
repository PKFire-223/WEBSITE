import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Flame, Sparkles, RefreshCw, Zap, Sliders, Volume2, Shield } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  colorType: 'core' | 'mid' | 'smoke';
}

const PALETTES = {
  inferno: {
    name: 'Inferno Gold',
    core: ['#ffffff', '#fffbeb', '#fef08a'],
    mid: ['#f59e0b', '#f97316', '#ef4444'],
    smoke: ['#78350f', '#451a03', '#1c1917']
  },
  amethyst: {
    name: 'Amethyst Blaze',
    core: ['#ffffff', '#f5d0fe', '#e879f9'],
    mid: ['#c084fc', '#a855f7', '#7e22ce'],
    smoke: ['#3b0764', '#1e1b4b', '#09090b']
  },
  cyber: {
    name: 'Neon Cyber',
    core: ['#ffffff', '#a5f3fc', '#38bdf8'],
    mid: ['#06b6d4', '#0284c7', '#2563eb'],
    smoke: ['#0f172a', '#020617', '#09090b']
  },
  emerald: {
    name: 'Spirit Flame',
    core: ['#ffffff', '#bbf7d0', '#4ade80'],
    mid: ['#22c55e', '#16a34a', '#15803d'],
    smoke: ['#052e16', '#022c22', '#09090b']
  }
};

type PaletteKey = keyof typeof PALETTES;

export const PKFireLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const [activePalette, setActivePalette] = useState<PaletteKey>('inferno');
  const [particleDensity, setParticleDensity] = useState<number>(30); // emitted per click
  const [particleCount, setParticleCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [autoBurst, setAutoBurst] = useState<boolean>(true);
  const [castCount, setCastCount] = useState<number>(0);

  // Spawn flame blast at x, y
  const spawnBlast = useCallback((x: number, y: number, intensity: number = 35) => {
    const newParticles: Particle[] = [];
    setCastCount(prev => prev + 1);

    for (let i = 0; i < intensity; i++) {
      const angle = (Math.random() * Math.PI) - (Math.PI / 2); // upward cone
      const speed = Math.random() * 6 + 2;
      const vx = Math.cos(angle) * speed * (Math.random() - 0.5) * 2;
      const vy = -Math.abs(Math.sin(angle) * speed) - 1.5;
      const maxLife = Math.random() * 45 + 25;

      const rand = Math.random();
      let colorType: 'core' | 'mid' | 'smoke' = 'mid';
      if (rand < 0.25) colorType = 'core';
      else if (rand > 0.8) colorType = 'smoke';

      newParticles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 12,
        vx,
        vy,
        size: Math.random() * 8 + 3,
        life: maxLife,
        maxLife,
        colorType
      });
    }

    particlesRef.current.push(...newParticles);
    // Cap particles at 1200 for smooth 60fps
    if (particlesRef.current.length > 1200) {
      particlesRef.current = particlesRef.current.slice(-1200);
    }
  }, []);

  // Main animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let frameCounter = 0;
    let autoTimer = 0;

    const render = (time: number) => {
      const delta = time - lastTime;
      frameCounter++;
      if (delta >= 500) {
        setFps(Math.round((frameCounter * 1000) / delta));
        frameCounter = 0;
        lastTime = time;
      }

      // Auto burst ambient emitter if enabled
      if (autoBurst) {
        autoTimer++;
        if (autoTimer % 18 === 0) {
          const centerX = canvas.width / 2 + (Math.sin(time / 400) * (canvas.width * 0.25));
          const bottomY = canvas.height - 30;
          spawnBlast(centerX, bottomY, 8);
        }
      }

      // Smooth clear with trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const palette = PALETTES[activePalette];
      const particles = particlesRef.current;
      const aliveParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= 1;

        if (p.life > 0) {
          // Physics: upward buoyancy & slight gravity decay
          p.vy *= 0.98;
          p.vx += (Math.random() - 0.5) * 0.4;
          p.x += p.vx;
          p.y += p.vy;
          p.size *= 0.97;

          const progress = p.life / p.maxLife; // 1 -> 0
          const alpha = Math.max(0, Math.min(1, progress));

          let colorChoices = palette.mid;
          if (p.colorType === 'core') colorChoices = palette.core;
          else if (p.colorType === 'smoke') colorChoices = palette.smoke;

          const colorIdx = Math.floor((1 - progress) * colorChoices.length) % colorChoices.length;
          const colorHex = colorChoices[colorIdx];

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fillStyle = colorHex;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = p.colorType === 'core' ? 12 : 6;
          ctx.shadowColor = colorHex;
          ctx.fill();
          ctx.restore();

          aliveParticles.push(p);
        }
      }

      particlesRef.current = aliveParticles;
      setParticleCount(aliveParticles.length);
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Canvas size adjustment
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activePalette, autoBurst, spawnBlast]);

  // Handle interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnBlast(x, y, particleDensity);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) { // Left click held
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnBlast(x, y, Math.floor(particleDensity / 3));
    }
  };

  const triggerTriplePillar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    spawnBlast(w * 0.25, h - 40, 80);
    setTimeout(() => spawnBlast(w * 0.5, h - 50, 100), 100);
    setTimeout(() => spawnBlast(w * 0.75, h - 40, 80), 200);
  };

  return (
    <section id="pkfire-lab" className="py-20 border-t border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Interactive Physics Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>PK Fire Interactive Lab</span>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Live Canvas
              </span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-xl">
              Click or drag anywhere in the viewport below to cast reactive elemental flame bursts. Test particle propagation, fluid buoyancy, and custom thermal palettes.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500 mr-1.5">FPS:</span>
              <span className={fps >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{fps}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500 mr-1.5">Active Nodes:</span>
              <span className="text-amber-400">{particleCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hidden sm:block">
              <span className="text-neutral-500 mr-1.5">Casts:</span>
              <span className="text-orange-400">{castCount}</span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 rounded-t-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          {/* Palette selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Palette:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {(Object.keys(PALETTES) as PaletteKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActivePalette(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activePalette === key
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {PALETTES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={triggerTriplePillar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 text-xs font-bold font-mono transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Triple Pillar Combo</span>
            </button>

            <button
              onClick={() => setAutoBurst(!autoBurst)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                autoBurst
                  ? 'bg-neutral-950 text-emerald-400 border-emerald-500/40'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoBurst ? 'animate-spin' : ''}`} />
              <span>Ambient Drift: {autoBurst ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                particlesRef.current = [];
                setCastCount(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-mono transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* The Interactive Canvas */}
        <div className="relative w-full h-[400px] sm:h-[480px] bg-neutral-950 rounded-b-2xl border-x border-b border-neutral-800 overflow-hidden shadow-2xl shadow-black/80 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full block"
          />

          {/* Instructional Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none bg-neutral-900/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Click & drag on canvas to cast flames</span>
          </div>

          <div className="absolute bottom-4 right-4 pointer-events-none bg-neutral-900/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>PK FIRE! Elemental Waveform</span>
          </div>
        </div>

      </div>
    </section>
  );
};
