import React from 'react';
import { Target, ShieldAlert, Crosshair, CheckCircle, Ban, Eye, Compass, Activity } from 'lucide-react';
import { DebrisTarget } from '../types';

interface ObjectClassificationPanelProps {
  targets: DebrisTarget[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

export const ObjectClassificationPanel: React.FC<ObjectClassificationPanelProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
}) => {
  // Aggregate classification counts
  const totalCandidates = 47;
  const validObjects = targets.filter(t => t.type === 'DEBRIS').length;
  const falsePositives = 41;
  const suppressed = 44;

  return (
    <div className="bg-[#0B111A] border border-[rgba(120,160,190,0.2)] rounded p-4 font-mono text-xs flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold tracking-wider text-sm font-sans">
            AI OBJECT CLASSIFICATION & DISCRIMINATION
          </span>
        </div>
        <div className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
          DEBRISNET // INT8
        </div>
      </div>

      {/* Aggregate Stats Matrix */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-[#070B12] p-2 rounded border border-gray-800">
        <div className="text-center border-r border-gray-800/80 pr-1">
          <div className="text-[10px] text-gray-400">CANDIDATES</div>
          <div className="text-white text-sm font-bold">{totalCandidates}</div>
          <div className="text-[9px] text-gray-400">Raw Blobs</div>
        </div>
        <div className="text-center border-r border-gray-800/80 pr-1">
          <div className="text-[10px] text-red-400">VALID DEBRIS</div>
          <div className="text-red-400 text-sm font-bold">{validObjects}</div>
          <div className="text-[9px] text-red-300">Tracked</div>
        </div>
        <div className="text-center border-r border-gray-800/80 pr-1">
          <div className="text-[10px] text-amber-400">FALSE POS.</div>
          <div className="text-amber-400 text-sm font-bold">{falsePositives}</div>
          <div className="text-[9px] text-amber-300">Cosmic/Noise</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-blue-400">SUPPRESSED</div>
          <div className="text-blue-400 text-sm font-bold">{suppressed}</div>
          <div className="text-[9px] text-blue-300">Starfield</div>
        </div>
      </div>

      {/* Target List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {targets.map((target) => {
          const isSelected = target.id === selectedTargetId;
          const isDebris = target.type === 'DEBRIS';
          const isStar = target.type === 'STAR';
          const isNoise = target.type === 'NOISE';

          return (
            <div
              key={target.id}
              onClick={() => onSelectTarget(target.id)}
              className={`p-2.5 rounded border cursor-pointer transition-all ${
                isSelected
                  ? isDebris
                    ? 'bg-red-950/30 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                    : 'bg-cyan-950/30 border-cyan-400'
                  : isDebris
                  ? 'bg-[#070B12] border-red-900/40 hover:border-red-600/70'
                  : isStar
                  ? 'bg-[#070B12] border-blue-900/40 hover:border-blue-700/60 opacity-75'
                  : 'bg-[#070B12] border-gray-800 hover:border-gray-700 opacity-60'
              }`}
            >
              {/* Row 1: Target ID, Badge, Confidence */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isDebris ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ) : isStar ? (
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Ban className="w-3.5 h-3.5 text-gray-500" />
                  )}
                  <span className={`font-bold text-xs ${
                    isDebris ? 'text-red-400' : isStar ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {target.id}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    isDebris
                      ? 'bg-red-900/40 text-red-300 border border-red-800'
                      : isStar
                      ? 'bg-blue-900/40 text-blue-300 border border-blue-800'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {target.type === 'DEBRIS' ? 'SPACE DEBRIS' : target.type === 'STAR' ? 'GUIDE STAR' : 'SENSOR NOISE'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">CONFIDENCE:</span>
                  <span className={`font-bold text-[11px] ${
                    target.confidence > 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {target.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Row 2: Motion, Position, Velocity */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-black/30 p-1.5 rounded border border-gray-800/40">
                <div>
                  <div className="text-gray-400 text-[9px]">MOTION RATE</div>
                  <div className="text-cyan-300 font-semibold">{target.angularRate.toFixed(2)}°/s</div>
                </div>
                <div>
                  <div className="text-gray-400 text-[9px]">REL VELOCITY</div>
                  <div className="text-white font-semibold">
                    {target.relativeVelocity > 0 ? `${target.relativeVelocity.toFixed(1)} m/s` : '0.0 m/s'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-[9px]">APPARENT MAG</div>
                  <div className="text-gray-300 font-semibold">{target.apparentMagnitude.toFixed(2)} M</div>
                </div>
              </div>

              {/* Row 3: Astrometric Coordinates & Status */}
              <div className="mt-1.5 flex items-center justify-between text-[9px] text-gray-400">
                <span>
                  RA: <strong className="text-gray-300">{target.ra.toFixed(2)}°</strong> | DEC: <strong className="text-gray-300">{target.dec.toFixed(2)}°</strong>
                </span>
                <span className={`font-semibold ${
                  target.status === 'TRACKING' ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  ● {target.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Target Deep Telemetry Card */}
      {selectedTargetId && (
        <div className="mt-3 pt-2.5 border-t border-gray-800 bg-[#070B12] p-2 rounded">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="text-gray-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              TARGET ACTIVE FOCUS
            </span>
            <span className="text-cyan-400 font-bold">{selectedTargetId}</span>
          </div>
          <div className="text-[10px] text-gray-300 flex justify-between">
            <span>KALMAN FILTER COVARIANCE:</span>
            <span className="text-emerald-400 font-mono">σ = ±0.038 km</span>
          </div>
          <div className="text-[10px] text-gray-300 flex justify-between">
            <span>CLASSIFICATION CERTAINTY:</span>
            <span className="text-purple-400 font-mono">SOFTMAX 0.984</span>
          </div>
        </div>
      )}
    </div>
  );
};
