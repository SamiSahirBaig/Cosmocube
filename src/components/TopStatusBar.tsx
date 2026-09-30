import React from 'react';
import { Activity, Cpu, Camera, Radio, Zap, Database } from 'lucide-react';

interface TopStatusBarProps {
  batteryLevel: number;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({ batteryLevel }) => {
  return (
    <header className="w-full bg-space-900/90 border-b border-cyan-500/20 px-4 py-1.5 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-slate-300 backdrop-blur-md z-40 select-none">
      {/* Left: Satellite ID & Orbit Coordinates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-space-800/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
          <span className="text-slate-400">SAT:</span>
          <span className="text-cyan-glow font-bold tracking-wider">BX-01</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">MISSION:</span>
          <span className="text-white font-medium">DEBRIS-01</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>ORBIT: <strong className="text-slate-200">LEO SSO</strong></span>
          <span className="text-slate-600">/</span>
          <span>ALT: <strong className="text-slate-200">518.4 KM</strong></span>
          <span className="text-slate-600">/</span>
          <span>VEL: <strong className="text-slate-200">7.61 KM/S</strong></span>
          <span className="text-slate-600">/</span>
          <span>INC: <strong className="text-slate-200">97.4°</strong></span>
        </div>
      </div>

      {/* Right: Subsystem Health & Animated Indicators */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mission Status */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5"></span>
          <span className="text-slate-400 hidden md:inline">SYSTEM:</span>
          <span className="text-emerald-400 font-semibold">NOMINAL</span>
        </div>

        {/* Edge AI Status */}
        <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded">
          <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-slate-400 hidden lg:inline">EDGE AI:</span>
          <span className="text-purple-300 font-medium">ACTIVE</span>
        </div>

        {/* Camera Status */}
        <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 hidden lg:inline">IMX296:</span>
          <span className="text-cyan-300 font-medium">ONLINE</span>
        </div>

        {/* Telemetry Status */}
        <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-slate-400 hidden lg:inline">TELEMETRY:</span>
          <span className="text-blue-300 font-medium">LINK ACTIVE</span>
        </div>

        {/* Power Level */}
        <div className="flex items-center gap-1.5 bg-space-800/80 border border-slate-700 px-2 py-0.5 rounded">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">BATT:</span>
          <span className={`font-bold ${batteryLevel > 20 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {batteryLevel.toFixed(1)}%
          </span>
        </div>

        {/* Buffer Level */}
        <div className="hidden xl:flex items-center gap-1.5 bg-space-800/80 border border-slate-700 px-2 py-0.5 rounded">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">BUFFER:</span>
          <span className="text-slate-200">34%</span>
        </div>
      </div>
    </header>
  );
};
