import React, { useState } from 'react';
import { Layers, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const BeforeAfterFilter: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="w-full bg-space-900 border border-cyan-500/25 rounded-xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Title & Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            BEFORE / AFTER EDGE-AI FILTERING PIPELINE
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold">
          95% CLUTTER REJECTION
        </span>
      </div>

      {/* Pipeline Breadcrumb Label */}
      <div className="flex items-center justify-center gap-2 text-[11px] font-mono py-1 bg-space-950/60 rounded border border-slate-800">
        <span className="text-slate-400">RAW OPTICAL DATA (2.3 MB)</span>
        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-cyan-glow font-bold">EDGE PRE-PROCESSING (10 ms)</span>
        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-emerald-400 font-bold">CLEANED FRAME + ISOLATED STREAK</span>
      </div>

      {/* Interactive Split Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-52">
        {/* LEFT: Raw Frame */}
        <div className="relative bg-black rounded-lg border border-slate-700/80 overflow-hidden flex flex-col justify-between p-3">
          <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none"></div>

          {/* Simulated Raw Clutter: Stars + Cosmic Ray + Debris Streak */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Stars */}
            <div className="absolute top-6 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute top-16 left-28 w-1 h-1 bg-white/80 rounded-full"></div>
            <div className="absolute top-28 left-8 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-12 left-20 w-1 h-1 bg-white/70 rounded-full"></div>
            <div className="absolute top-10 right-24 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute bottom-8 right-16 w-1 h-1 bg-white/80 rounded-full"></div>

            {/* Cosmic ray sharp spike */}
            <div className="absolute top-24 right-20 w-10 h-0.5 bg-white rotate-45"></div>

            {/* Hot pixels */}
            <div className="absolute top-36 left-32 w-1 h-1 bg-red-400"></div>

            {/* The real debris streak */}
            <div className="absolute top-16 left-48 w-8 h-1 bg-cyan-300 -rotate-12 shadow-[0_0_8px_#00f3ff]"></div>
          </div>

          <div className="z-10 flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold rounded">
              RAW FRAME (UNPROCESSED)
            </span>
            <span className="text-[10px] font-mono text-slate-400">48 ARTIFACTS / STARS</span>
          </div>

          <div className="z-10 bg-space-950/80 p-1.5 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
            • Stars & Fixed-Pattern Noise present<br />
            • Single-Event Cosmic Ray spike detected<br />
            • Debris streak obscured by background
          </div>
        </div>

        {/* RIGHT: Cleaned Frame */}
        <div className="relative bg-space-950 rounded-lg border border-cyan-500/50 overflow-hidden flex flex-col justify-between p-3 shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
          <div className="absolute inset-0 pointer-events-none">
            {/* All stars removed, cosmic ray deleted, only highlighted debris streak! */}
            <div className="absolute top-16 left-48 w-12 h-12 border border-cyan-400 rounded">
              <div className="w-8 h-1 bg-cyan-glow -rotate-12 mt-5 ml-2 shadow-[0_0_12px_#00f3ff]"></div>
              <span className="absolute -top-4 left-0 text-[9px] font-mono font-bold text-cyan-glow bg-space-900 px-1 border border-cyan-500/40 rounded">
                D-017 [96.8%]
              </span>
            </div>
          </div>

          <div className="z-10 flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold rounded">
              CLEANED FRAME (EDGE-AI PROCESSED)
            </span>
            <span className="text-[10px] font-mono text-emerald-400">1 VALID DEBRIS ISOLATED</span>
          </div>

          <div className="z-10 bg-space-950/80 p-1.5 rounded border border-cyan-500/30 text-[10px] font-mono text-slate-300">
            • 44 Stationary Stars cancelled via $\Delta I_k$<br />
            • Cosmic Ray rejected by AI attention model<br />
            • Sub-pixel centroid: <strong className="text-cyan-glow">[892.4, 410.2]</strong>
          </div>
        </div>
      </div>

      {/* 4 Active Subsystem Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="flex items-center gap-1.5 bg-space-950 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">STAR SUPPRESSION:</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-space-950 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">COSMIC-RAY REJECT:</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-space-950 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-slate-400">DIFF FILTER:</span>
          <span className="text-cyan-300 font-bold">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-space-950 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">NOISE REDUCTION:</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
