import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Activity, Layers, Microchip, Clock, Gauge, Database, ArrowDown } from 'lucide-react';
import { AIStats, PipelineStage } from '../types';

interface EdgeAIProcessorProps {
  stats: AIStats;
  activeStage?: PipelineStage;
}

const PIPELINE_STAGES: Array<{
  id: PipelineStage;
  label: string;
  sublabel: string;
  duration: string;
  ops: string;
  desc: string;
}> = [
  { id: 'CAPTURE', label: '1. SENSOR CAPTURE', sublabel: '1440x1080 Global Shutter', duration: '12.4 ms', ops: 'RAW Mono12', desc: 'Direct MIPI-CSI2 DMA capture buffer' },
  { id: 'FILTER', label: '2. PREPROCESSING & CLEANING', sublabel: 'Star / Noise / Cosmic Filter', duration: '4.8 ms', ops: '44 Stars Suppressed', desc: 'Adaptive morphological & median filter' },
  { id: 'DETECT', label: '3. MOVING OBJECT DETECTION', sublabel: 'Temporal Differencing', duration: '6.2 ms', ops: 'Δt = 3 frames', desc: 'Background flux cancellation & candidate masking' },
  { id: 'CLASSIFY', label: '4. EDGE-AI CLASSIFICATION', sublabel: 'DebrisNet-INT8 TPU Model', duration: '3.8 ms', ops: '4.0 TOPS INT8', desc: 'Quantized MobileNetV3 debris classifier' },
  { id: 'CENTROID', label: '5. SUB-PIXEL CENTROIDING', sublabel: 'Gaussian PSF Curve Fit', duration: '2.1 ms', ops: '±0.08 px precision', desc: 'Sub-pixel optical center of mass computation' },
  { id: 'TRACK', label: '6. TRAJECTORY ESTIMATION', sublabel: 'Extended Kalman Filter', duration: '3.4 ms', ops: '6-State EKF Orbit', desc: 'Covariance propagation & angular vector estimation' },
  { id: 'PACKETIZE', label: '7. TELEMETRY PACKETIZATION', sublabel: 'RoI Extraction & Compression', duration: '1.2 ms', ops: '2.3MB → 180 Bytes', desc: 'Discard 99.98% starfield, encode metadata' },
  { id: 'DOWNLINK', label: '8. DOWNLINK GATING', sublabel: 'AX.25 UHF Packet Link', duration: '0.8 ms', ops: '9.6 kbps queue', desc: 'Prioritized event packet sent to ground station' },
];

export const EdgeAIProcessor: React.FC<EdgeAIProcessorProps> = ({ stats }) => {
  const [pulseStageIndex, setPulseStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0B111A] border border-[rgba(120,160,190,0.2)] rounded p-4 font-mono text-xs flex flex-col h-full shadow-lg relative overflow-hidden">
      {/* Background technical watermarks */}
      <div className="absolute top-2 right-2 text-[9px] text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-0.5 rounded bg-[#070B12]/80">
        SIMULATED EDGE-AI TELEMETRY
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
        <Cpu className="w-4 h-4 text-purple-400" />
        <span className="text-white font-semibold tracking-wider text-sm font-sans">
          EDGE-AI ONBOARD INFERENCE PIPELINE
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-purple-400 bg-purple-950/40 border border-purple-800/60 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
          INT8 TPU ACCELERATED
        </span>
      </div>

      {/* Hardware Spec Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-[#070B12] p-2.5 rounded border border-gray-800/80">
        <div>
          <div className="text-gray-400 text-[10px] flex items-center gap-1">
            <Microchip className="w-3 h-3 text-cyan-400" /> MODEL ARCH
          </div>
          <div className="text-cyan-300 font-bold text-[11px] truncate">DebrisNet-INT8</div>
          <div className="text-gray-400 text-[9px]">MobileNetV3 Backbone</div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px] flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-400" /> FOOTPRINT
          </div>
          <div className="text-purple-300 font-bold text-[11px]">8.4 MB (Weight)</div>
          <div className="text-gray-400 text-[9px]">52 KB Active Tensor</div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> INFERENCE
          </div>
          <div className="text-amber-300 font-bold text-[11px]">{stats.inferenceTimeMs} ms</div>
          <div className="text-gray-400 text-[9px]">Target: &lt; 50 ms</div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> ACCEL POWER
          </div>
          <div className="text-emerald-300 font-bold text-[11px]">{stats.powerWatts} W</div>
          <div className="text-gray-400 text-[9px]">Coral Edge TPU 4 TOPS</div>
        </div>
      </div>

      {/* Live Resource Load Gauges */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {/* CPU */}
        <div className="bg-[#070B12] p-2 rounded border border-gray-800/60">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">CPU LOAD</span>
            <span className="text-cyan-400 font-bold">{stats.cpuLoad}%</span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${stats.cpuLoad}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-400 mt-1">Quad A72 @ 1.5GHz</div>
        </div>

        {/* NPU / TPU */}
        <div className="bg-[#070B12] p-2 rounded border border-gray-800/60">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">TPU LOAD</span>
            <span className="text-purple-400 font-bold">{stats.npuLoad}%</span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${stats.npuLoad}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-400 mt-1">4.0 TOPS @ 2W</div>
        </div>

        {/* RAM */}
        <div className="bg-[#070B12] p-2 rounded border border-gray-800/60">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">RAM USAGE</span>
            <span className="text-blue-400 font-bold">{stats.ramUsage}%</span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${stats.ramUsage}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-400 mt-1">1.22 GB / 2.0 GB</div>
        </div>

        {/* FPS */}
        <div className="bg-[#070B12] p-2 rounded border border-gray-800/60">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">PIPELINE FPS</span>
            <span className="text-emerald-400 font-bold">{stats.fps}</span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (stats.fps / 30) * 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-400 mt-1">Global Shutter Rate</div>
        </div>
      </div>

      {/* Vertical Dataflow Pipeline with Glowing Pulse */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-cyan-400" />
          ONBOARD EXECUTION SEQUENCE (END-TO-END LATENCY: ~34 ms)
        </div>

        {PIPELINE_STAGES.map((stage, idx) => {
          const isPulse = pulseStageIndex === idx;
          return (
            <div
              key={stage.id}
              className={`p-2 rounded border transition-all duration-300 relative ${
                isPulse
                  ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-[#070B12]/80 border-gray-800/70 hover:border-gray-700'
              }`}
            >
              {/* Animated pulse dot */}
              {isPulse && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    isPulse ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className={`font-semibold text-xs ${isPulse ? 'text-purple-200' : 'text-gray-200'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {stage.sublabel} &bull; <span className="text-gray-300">{stage.desc}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-[11px] font-bold ${isPulse ? 'text-purple-300' : 'text-cyan-400'}`}>
                    {stage.duration}
                  </div>
                  <div className="text-[9px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">
                    {stage.ops}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary bar */}
      <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          EDGE AUTONOMY: ZERO GROUND UPLINK REQUIRED
        </span>
        <span className="text-purple-400 font-semibold">TENSORFLOW LITE MICRO</span>
      </div>
    </div>
  );
};
