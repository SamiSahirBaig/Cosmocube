import React, { useRef, useEffect, useState } from 'react';
import { DebrisTarget, CameraMode } from '../types';
import { Crosshair, Eye, Shield, Layers, ZoomIn, Info } from 'lucide-react';

interface LiveCameraPanelProps {
  targets: DebrisTarget[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  cameraMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  frameCount: number;
}

export const LiveCameraPanel: React.FC<LiveCameraPanelProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  cameraMode,
  onModeChange,
  frameCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; brightness: number; size: number }>>([]);
  const [cosmicRays, setCosmicRays] = useState<Array<{ x: number; y: number; len: number; angle: number; ttl: number }>>([]);

  // Generate static starfield once
  useEffect(() => {
    const starList = [];
    for (let i = 0; i < 280; i++) {
      starList.push({
        x: Math.random(),
        y: Math.random(),
        brightness: Math.random() * 0.7 + 0.3,
        size: Math.random() < 0.1 ? 2 : 1,
      });
    }
    setStars(starList);
  }, []);

  // Occasional random cosmic ray strike
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setCosmicRays(prev => [
          ...prev.slice(-3),
          {
            x: Math.random(),
            y: Math.random(),
            len: Math.random() * 15 + 5,
            angle: Math.random() * Math.PI * 2,
            ttl: 20, // frames to live
          }
        ]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, width, height);

      // 2. Earth limb curvature glow at bottom right
      const gradient = ctx.createRadialGradient(
        width * 1.1, height * 1.2, width * 0.4,
        width * 1.1, height * 1.2, width * 0.85
      );
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
      gradient.addColorStop(0.3, 'rgba(3, 105, 161, 0.15)');
      gradient.addColorStop(0.7, 'rgba(3, 7, 18, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Earth limb atmosphere edge line
      ctx.beginPath();
      ctx.arc(width * 1.1, height * 1.2, width * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Render Stars (Suppressed in FILTERED mode)
      if (cameraMode !== 'FILTERED' && cameraMode !== 'ROI') {
        stars.forEach(star => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * (cameraMode === 'DETECTION' ? 0.4 : 0.85)})`;
          ctx.beginPath();
          ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. Render Cosmic Ray Spikes (Suppressed in FILTERED / DETECTION / TRACKING modes)
      if (cameraMode === 'RAW') {
        cosmicRays.forEach(cr => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cr.x * width, cr.y * height);
          ctx.lineTo(
            cr.x * width + Math.cos(cr.angle) * cr.len,
            cr.y * height + Math.sin(cr.angle) * cr.len
          );
          ctx.stroke();
        });
      }

      // 5. Render Debris Targets & Moving Streaks
      targets.forEach(target => {
        const isSelected = target.id === selectedTargetId;
        const tx = target.screenX * width;
        const ty = target.screenY * height;

        // Draw Historical Track Trail
        if (cameraMode === 'TRACKING' || cameraMode === 'DETECTION') {
          if (target.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(target.history[0].x * width, target.history[0].y * height);
            for (let i = 1; i < target.history.length; i++) {
              ctx.lineTo(target.history[i].x * width, target.history[i].y * height);
            }
            ctx.strokeStyle = target.type === 'DEBRIS' ? 'rgba(0, 243, 255, 0.4)' : 'rgba(100, 116, 139, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Draw Predicted Trajectory (Dashed line)
          if (target.predicted.length > 0 && target.type === 'DEBRIS') {
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            target.predicted.forEach(pt => ctx.lineTo(pt.x * width, pt.y * height));
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }
        }

        // Draw Optical Streak (Moving target)
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate((target.streakAngle * Math.PI) / 180);

        // Streak core
        ctx.beginPath();
        ctx.moveTo(-target.streakLength / 2, 0);
        ctx.lineTo(target.streakLength / 2, 0);
        ctx.strokeStyle = target.type === 'DEBRIS' ? '#00f3ff' : '#94a3b8';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = target.type === 'DEBRIS' ? '#00f3ff' : '#64748b';
        ctx.shadowBlur = target.type === 'DEBRIS' ? 8 : 2;
        ctx.stroke();
        ctx.restore();

        // 6. AI Computer-Vision Bounding Box & HUD Overlay
        if (cameraMode !== 'RAW' && target.type === 'DEBRIS') {
          const boxSize = 48;
          const half = boxSize / 2;

          ctx.save();
          // Bounding Box
          ctx.strokeStyle = isSelected ? '#ff3344' : '#00f3ff';
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.strokeRect(tx - half, ty - half, boxSize, boxSize);

          // Corner Brackets
          const bLen = 8;
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 2;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(tx - half, ty - half + bLen);
          ctx.lineTo(tx - half, ty - half);
          ctx.lineTo(tx - half + bLen, ty - half);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(tx + half - bLen, ty - half);
          ctx.lineTo(tx + half, ty - half);
          ctx.lineTo(tx + half, ty - half + bLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(tx - half, ty + half - bLen);
          ctx.lineTo(tx - half, ty + half);
          ctx.lineTo(tx - half + bLen, ty + half);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(tx + half - bLen, ty + half);
          ctx.lineTo(tx + half, ty + half);
          ctx.lineTo(tx + half, ty + half - bLen);
          ctx.stroke();

          // Sub-pixel Centroid Reticle
          ctx.beginPath();
          ctx.arc(tx, ty, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#00f3ff';
          ctx.fill();

          // Targeting Metadata Label Tag
          ctx.fillStyle = 'rgba(5, 8, 13, 0.85)';
          ctx.fillRect(tx + half + 6, ty - half, 120, 52);
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
          ctx.strokeRect(tx + half + 6, ty - half, 120, 52);

          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = isSelected ? '#ff3344' : '#00f3ff';
          ctx.fillText(`TARGET: ${target.id}`, tx + half + 10, ty - half + 14);

          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`CLASS: ${target.type}`, tx + half + 10, ty - half + 26);

          ctx.fillStyle = '#10b981';
          ctx.fillText(`CONF: ${target.confidence.toFixed(1)}%`, tx + half + 10, ty - half + 37);

          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`RATE: ${target.angularRate.toFixed(2)}°/s`, tx + half + 10, ty - half + 47);

          ctx.restore();
        }
      });

      // 7. Subtle Grid Coordinates Overlay
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Central optical axis crosshair
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 15, height / 2);
      ctx.lineTo(width / 2 + 15, height / 2);
      ctx.moveTo(width / 2, height / 2 - 15);
      ctx.lineTo(width / 2, height / 2 + 15);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [stars, targets, cosmicRays, cameraMode, selectedTargetId]);

  return (
    <div className="w-full h-full flex flex-col bg-space-900 border border-cyan-500/25 rounded-xl overflow-hidden relative shadow-[0_0_25px_rgba(0,0,0,0.7)]">
      {/* Top Header & Mode Switcher */}
      <div className="px-4 py-2.5 bg-space-850 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-wider text-white">LIVE OPTICAL SENSOR FEED</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold">
            GLOBAL SHUTTER • 1440×1080
          </span>
        </div>

        {/* Camera Mode Pills */}
        <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-slate-700">
          {(['RAW', 'FILTERED', 'DETECTION', 'TRACKING', 'ROI'] as CameraMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                cameraMode === mode
                  ? 'bg-cyan-500/20 text-cyan-glow border border-cyan-400/60 shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-space-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* Live HUD Metadata Overlays (Top Left) */}
        <div className="absolute top-3 left-3 bg-space-950/80 border border-cyan-500/30 p-2 rounded text-[10px] font-mono text-slate-300 pointer-events-none backdrop-blur-sm space-y-0.5">
          <div className="text-cyan-glow font-bold">SONY IMX296 // 35mm f/1.4</div>
          <div>FRAME: <span className="text-white">#{frameCount.toString().padStart(8, '0')}</span></div>
          <div>EXPOSURE: <span className="text-white">12.4 ms</span> | GAIN: <span className="text-white">18.2 dB</span></div>
          <div>FOV: <span className="text-white">8.1° × 6.1°</span> | IFOV: <span className="text-white">20.3 arcsec</span></div>
        </div>

        {/* Active Filter Indicators (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 text-[10px] font-mono pointer-events-none">
          <div className="flex items-center gap-1.5 bg-space-950/80 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>STARFIELD FILTER: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-space-950/80 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>COSMIC RAY REJECTION: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-space-950/80 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>TEMPORAL DIFFERENCING: ACTIVE</span>
          </div>
        </div>

        {/* Selected Target HUD Quick Card (Bottom Left) */}
        {selectedTargetId && (
          <div className="absolute bottom-3 left-3 bg-space-950/90 border border-rose-500/40 p-2.5 rounded-lg text-xs font-mono text-slate-200 pointer-events-auto backdrop-blur-md flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
            <div>
              <div className="text-rose-400 font-bold flex items-center gap-2">
                <span>LOCKED TARGET: {selectedTargetId}</span>
                <span className="text-[10px] px-1 bg-rose-950/60 rounded border border-rose-500/40 text-rose-300">
                  CONFIRMED DEBRIS
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                RANGE: <strong className="text-white">2.99 km</strong> | REL VEL: <strong className="text-white">7.42 m/s</strong> | RATE: <strong className="text-cyan-glow">0.42°/s</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Camera Metadata Strip */}
      <div className="px-4 py-1.5 bg-space-850 border-t border-cyan-500/20 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>MODE: <strong className="text-cyan-glow">{cameraMode}</strong></span>
          <span>TARGETS IN FOV: <strong className="text-white">{targets.filter(t => t.type === 'DEBRIS').length}</strong></span>
          <span>SUPPRESSED STARS: <strong className="text-emerald-400">44</strong></span>
        </div>
        <div className="text-[10px] text-slate-400">
          CLICK DEBRIS TO LOCK RETICLE
        </div>
      </div>
    </div>
  );
};
