import React from 'react';
import { NavigationTab } from '../types';
import { Radio, Clock, ShieldCheck, Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface MissionHeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  utcTime: string;
  missionElapsedSec: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  simSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTriggerEvent: () => void;
  isEventSimulating: boolean;
  eventProgress: number;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  activeTab,
  onTabChange,
  utcTime,
  missionElapsedSec,
  isRunning,
  onTogglePlay,
  onReset,
  simSpeed,
  onSpeedChange,
  onTriggerEvent,
  isEventSimulating,
  eventProgress,
}) => {
  const tabs: NavigationTab[] = [
    'OVERVIEW',
    'CAMERA',
    'EDGE AI',
    'DEBRIS TRACKING',
    'TELEMETRY',
    'POWER',
    'SYSTEM LOGS',
  ];

  const formatMET = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `T+${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-space-850 border-b border-cyan-500/20 px-4 py-2.5 flex flex-col gap-2">
      {/* Top Bar: Title, Mission Tag, UTC, Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Project Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,243,255,0.3)]">
            <span className="text-xl">🛰️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-white">EDGE-DEBRIS-1U</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold">
                TEAM BOXSTER • SIH 2026
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-wide">
              ONBOARD EDGE-AI SPACE DEBRIS DETECTION & DATA REDUCTION SYSTEM
            </p>
          </div>
        </div>

        {/* Center: Mission Control Live Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-space-950/80 rounded-full border border-cyan-500/30">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-glow">
            MISSION CONTROL // LIVE OPERATIONS
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1U CUBESAT LEO TESTBED</span>
        </div>

        {/* Right: Simulation Controls & Clocks */}
        <div className="flex items-center gap-2.5">
          {/* Simulate Debris Event Showcase Button */}
          <button
            onClick={onTriggerEvent}
            disabled={isEventSimulating}
            className={`relative overflow-hidden text-xs font-mono font-bold px-3 py-1.5 rounded border transition-all flex items-center gap-1.5 ${
              isEventSimulating
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-cyan-950/80 hover:bg-cyan-500/20 border-cyan-400 text-cyan-glow hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'
            }`}
          >
            {isEventSimulating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>EVENT SIMULATING ({eventProgress}%)</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>SIMULATE DEBRIS EVENT</span>
              </>
            )}
            {isEventSimulating && (
              <span 
                className="absolute bottom-0 left-0 h-0.5 bg-rose-500 transition-all duration-300" 
                style={{ width: `${eventProgress}%` }}
              />
            )}
          </button>

          {/* Simulation Toggle Controls */}
          <div className="flex items-center bg-space-900 border border-slate-700 rounded p-0.5">
            <button
              onClick={onTogglePlay}
              className={`p-1 rounded text-xs transition-colors ${isRunning ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50'}`}
              title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onReset}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="hidden sm:flex items-center gap-0.5 bg-space-900 border border-slate-700 rounded px-1 text-[11px] font-mono text-slate-300">
            {[0.5, 1, 2, 5].map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded ${simSpeed === s ? 'bg-cyan-500/30 text-cyan-glow font-bold' : 'hover:text-white'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Clocks */}
          <div className="bg-space-950 border border-slate-700/80 px-2.5 py-1 rounded text-right font-mono">
            <div className="text-xs font-bold text-slate-100 flex items-center justify-end gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{utcTime}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              MET: <span className="text-cyan-300">{formatMET(missionElapsedSec)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Tab Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 overflow-x-auto">
        <nav className="flex items-center gap-1.5">
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all uppercase whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-glow border border-cyan-400/60 font-semibold shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60 border border-transparent'
                }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </nav>

        {/* Mini Simulation Mode Disclosure */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-amber-400/80 bg-amber-950/20 border border-amber-500/30 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>SIMULATION MODE // VALIDATED DEMONSTRATION DATA</span>
        </div>
      </div>
    </div>
  );
};
