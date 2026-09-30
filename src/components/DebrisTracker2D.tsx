import React, { useRef, useEffect } from 'react';
import { Crosshair, Radar, Navigation, ShieldAlert } from 'lucide-react';
import { DebrisTarget } from '../types';

interface DebrisTracker2DProps {
  targets: DebrisTarget[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

export const DebrisTracker2D: React.FC<DebrisTracker2DProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 25;

      // Clear with dark aerospace background
      ctx.fillStyle = '#070B12';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(120, 160, 190, 0.08)';
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Range rings (1 km, 2.5 km, 5 km, 8 km)
      const rings = [
        { r: maxRadius * 0.25, label: '2.0 km' },
        { r: maxRadius * 0.50, label: '4.0 km' },
        { r: maxRadius * 0.75, label: '6.0 km' },
        { r: maxRadius * 1.00, label: '8.0 km' },
      ];

      rings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on ring
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.font = '9px monospace';
        ctx.fillText(ring.label, centerX + ring.r + 3, centerY - 3);
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // Sweeping radar beam
      angle += 0.015;
      const sweepX = centerX + Math.cos(angle) * maxRadius;
      const sweepY = centerY + Math.sin(angle) * maxRadius;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.06)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Center CubeSat (BX-01)
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = '10px monospace';
      ctx.fillText('BX-01 [1U]', centerX + 12, centerY + 3);

      // Plot targets
      targets.forEach(target => {
        if (target.type !== 'DEBRIS') return;

        // Map delta x/dy (-6km to +6km) to canvas
        const scale = maxRadius / 6.0;
        const posX = centerX + target.relativePosition.dx * scale;
        const posY = centerY + target.relativePosition.dy * scale;

        const isSelected = target.id === selectedTargetId;

        // 1. Draw Historical Trail (fading line)
        if (target.history.length > 1) {
          ctx.beginPath();
          target.history.forEach((pt, idx) => {
            const hx = centerX + (pt.x - 0.5) * 2 * maxRadius;
            const hy = centerY + (pt.y - 0.5) * 2 * maxRadius;
            if (idx === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          });
          ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 2. Draw Predicted Trajectory (dashed line)
        if (target.predicted.length > 0) {
          ctx.beginPath();
          ctx.moveTo(posX, posY);
          target.predicted.forEach(pt => {
            const px = centerX + (pt.x - 0.5) * 2 * maxRadius;
            const py = centerY + (pt.y - 0.5) * 2 * maxRadius;
            ctx.lineTo(px, py);
          });
          ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 240, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 3. Current Position Marker
        ctx.fillStyle = isSelected ? '#EF4444' : '#00F0FF';
        ctx.beginPath();
        ctx.arc(posX, posY, isSelected ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing circle around target
        ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(posX, posY, (Date.now() / 150) % 8 + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Target Tag
        ctx.fillStyle = isSelected ? '#FCA5A5' : '#E2E8F0';
        ctx.font = '10px monospace';
        ctx.fillText(target.id, posX + 7, posY - 7);

        // Vector line to center (range line)
        ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 240, 255, 0.12)';
        ctx.setLineDash([1, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(posX, posY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targets, selectedTargetId]);

  const activeTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  return (
    <div className="bg-[#0B111A] border border-[rgba(120,160,190,0.2)] rounded p-4 font-mono text-xs flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold tracking-wider text-sm font-sans">
            2D RELATIVE ORBITAL TRACKING RADAR
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          FOV CONE: 28.4° × 21.6°
        </div>
      </div>

      {/* Main Content: Canvas on Left/Center + Telemetry Card on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-[300px]">
        {/* Radar Canvas Container */}
        <div className="md:col-span-2 relative bg-[#070B12] rounded border border-gray-800 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            className="w-full h-full object-contain cursor-crosshair"
          />
          {/* North and Orbit Direction Indicators */}
          <div className="absolute top-2 left-2 text-[9px] text-gray-400 bg-black/60 px-1.5 py-0.5 rounded border border-gray-800 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" />
            +V VECTOR (7.6 km/s)
          </div>
          <div className="absolute bottom-2 right-2 text-[9px] text-gray-400 bg-black/60 px-1.5 py-0.5 rounded border border-gray-800">
            FRAME: J2000 INERTIAL
          </div>
        </div>

        {/* Selected Target Deep Telemetry Panel */}
        <div className="bg-[#070B12] p-3 rounded border border-gray-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-gray-400 text-[11px] font-sans font-semibold">SELECTED TARGET</span>
              <span className="text-red-400 font-bold text-sm bg-red-950/40 px-2 py-0.5 rounded border border-red-800">
                {activeTarget ? activeTarget.id : 'N/A'}
              </span>
            </div>

            {activeTarget ? (
              <div className="space-y-2 mt-3 text-[11px]">
                {/* 3D Relative Coordinates */}
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-[10px] text-gray-400 mb-1">RELATIVE POSITION (HILL FRAME)</div>
                  <div className="grid grid-cols-3 gap-1 font-mono text-cyan-300">
                    <div>ΔX: {activeTarget.relativePosition.dx > 0 ? `+${activeTarget.relativePosition.dx.toFixed(2)}` : activeTarget.relativePosition.dx.toFixed(2)} km</div>
                    <div>ΔY: {activeTarget.relativePosition.dy > 0 ? `+${activeTarget.relativePosition.dy.toFixed(2)}` : activeTarget.relativePosition.dy.toFixed(2)} km</div>
                    <div>ΔZ: {activeTarget.relativePosition.dz > 0 ? `+${activeTarget.relativePosition.dz.toFixed(2)}` : activeTarget.relativePosition.dz.toFixed(2)} km</div>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400 flex justify-between">
                    <span>RANGE:</span>
                    <span className="text-white font-bold">{activeTarget.relativePosition.range.toFixed(2)} km</span>
                  </div>
                </div>

                {/* Velocity and Rates */}
                <div className="bg-black/40 p-2 rounded border border-gray-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RELATIVE VELOCITY:</span>
                    <span className="text-white font-bold">{activeTarget.relativeVelocity.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ANGULAR RATE:</span>
                    <span className="text-cyan-400 font-bold">{activeTarget.angularRate.toFixed(2)}°/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TRACK CONFIDENCE:</span>
                    <span className="text-emerald-400 font-bold">{activeTarget.trackConfidence.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Celestial Coordinates */}
                <div className="bg-black/40 p-2 rounded border border-gray-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RIGHT ASCENSION (RA):</span>
                    <span className="text-gray-200">{activeTarget.ra.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DECLINATION (DEC):</span>
                    <span className="text-gray-200">{activeTarget.dec.toFixed(2)}°</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">NO TARGET SELECTED</div>
            )}
          </div>

          {/* Radar Legend */}
          <div className="mt-3 pt-2 border-t border-gray-800/80 text-[10px] space-y-1 text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>BX-01 1U CubeSat (Center Reference)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span>Active Debris Target with Kalman Filter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 border-t border-dashed border-red-400"></span>
              <span>Predicted 6-State Orbit Trajectory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
