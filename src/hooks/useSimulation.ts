import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DebrisTarget, 
  SystemLog, 
  TelemetryPacket, 
  PowerState, 
  AIStats, 
  PerformanceCounters,
  CameraMode,
  PipelineStage 
} from '../types';
import { INITIAL_TARGETS, INITIAL_LOGS, INITIAL_PACKETS } from '../data/simulationData';

export function useSimulation() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('DETECTION');
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('D-017');
  const [isEventSimulating, setIsEventSimulating] = useState<boolean>(false);
  const [eventProgress, setEventProgress] = useState<number>(0);

  // Time metrics
  const [utcTime, setUtcTime] = useState<string>('12:42:17 UTC');
  const [missionElapsedSec, setMissionElapsedSec] = useState<number>(841202);
  const [frameCount, setFrameCount] = useState<number>(18427);

  // Core Data
  const [targets, setTargets] = useState<DebrisTarget[]>(INITIAL_TARGETS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [packets, setPackets] = useState<TelemetryPacket[]>(INITIAL_PACKETS);

  // Power state
  const [power, setPower] = useState<PowerState>({
    solarInput: 4.82,
    edgeAi: 1.84,
    camera: 0.72,
    processing: 0.88,
    telemetry: 0.31,
    totalConsumption: 3.75,
    batteryLevel: 92.4,
    batteryVoltage: 7.82,
    history: [
      { time: '12:38', input: 4.8, consumption: 3.7, battery: 92.0 },
      { time: '12:39', input: 4.9, consumption: 3.8, battery: 92.1 },
      { time: '12:40', input: 4.7, consumption: 3.7, battery: 92.2 },
      { time: '12:41', input: 4.8, consumption: 3.7, battery: 92.3 },
      { time: '12:42', input: 4.8, consumption: 3.75, battery: 92.4 },
    ]
  });

  // AI Inference stats
  const [aiStats, setAiStats] = useState<AIStats>({
    modelName: 'DebrisNet-Tiny INT8 (MobileNetV3)',
    modelSize: '52 KB (Compiled for Edge TPU)',
    precision: 'INT8 Quantized',
    inferenceTimeMs: 3.8,
    cpuLoad: 42,
    npuLoad: 67,
    ramUsage: 61,
    fps: 26.4,
    powerWatts: 1.84,
    activeStage: 'DETECT',
  });

  // Counters
  const [counters, setCounters] = useState<PerformanceCounters>({
    framesProcessed: 18427,
    objectsDetected: 127,
    validDebris: 8,
    falsePositives: 41,
    avgInferenceMs: 3.8,
    telemetryReductionPercent: 99.98,
    edgePowerWatts: 1.84,
    trackConfidence: 94.2,
  });

  // Active Alert
  const [currentAlert, setCurrentAlert] = useState<{
    id: string;
    title: string;
    description: string;
    confidence: number;
    rangeKm: number;
    level: 'CRITICAL' | 'WARN' | 'NOMINAL';
  }>({
    id: 'D-017',
    title: 'SPACE DEBRIS // INTERSECTING LEO VECTORS',
    description: 'High angular velocity debris detected (0.42°/s). Track confirmed across 4 consecutive frames.',
    confidence: 96.8,
    rangeKm: 2.99,
    level: 'WARN'
  });

  // Add Log Helper
  const addLog = useCallback((category: SystemLog['category'], message: string, level: SystemLog['level'] = 'INFO') => {
    const now = new Date();
    const ts = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')}.${now.getUTCMilliseconds().toString().padStart(3, '0')}`;
    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: ts,
      category,
      message,
      level,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Main tick loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // 1. Update clock
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setMissionElapsedSec(prev => prev + 1);
      setFrameCount(prev => prev + 1);

      // 2. Animate target movements smoothly
      setTargets(prev => prev.map(target => {
        if (target.status !== 'TRACKING') return target;

        // Move target along angle
        const rad = (target.streakAngle * Math.PI) / 180;
        const speed = (target.angularRate * 0.002 * simSpeed);
        let newX = target.screenX + Math.cos(rad) * speed;
        let newY = target.screenY + Math.sin(rad) * speed;

        // Wrap around screen bounds
        if (newX > 0.95) newX = 0.05;
        if (newX < 0.05) newX = 0.95;
        if (newY > 0.95) newY = 0.05;
        if (newY < 0.05) newY = 0.95;

        // Append to history
        const newHistory = [...target.history.slice(-6), { x: newX, y: newY }];
        const newPred = [
          { x: newX + Math.cos(rad) * speed * 4, y: newY + Math.sin(rad) * speed * 4 },
          { x: newX + Math.cos(rad) * speed * 8, y: newY + Math.sin(rad) * speed * 8 },
        ];

        return {
          ...target,
          screenX: newX,
          screenY: newY,
          history: newHistory,
          predicted: newPred,
          confidence: Math.min(99.9, Math.max(88.0, target.confidence + (Math.random() - 0.5) * 0.4)),
        };
      }));

      // 3. Jitter AI stats realistically
      setAiStats(prev => ({
        ...prev,
        cpuLoad: Math.min(60, Math.max(35, Math.round(prev.cpuLoad + (Math.random() - 0.5) * 3))),
        npuLoad: Math.min(85, Math.max(55, Math.round(prev.npuLoad + (Math.random() - 0.5) * 4))),
        inferenceTimeMs: Number((3.8 + (Math.random() - 0.5) * 0.4).toFixed(1)),
        fps: Number((26.4 + (Math.random() - 0.5) * 0.8).toFixed(1)),
        powerWatts: Number((1.84 + (Math.random() - 0.5) * 0.06).toFixed(2)),
      }));

      // 4. Update power stats
      setPower(prev => {
        const newBat = Math.min(98, Math.max(80, prev.batteryLevel + 0.005 * simSpeed));
        const newSolar = Number((4.82 + (Math.random() - 0.5) * 0.15).toFixed(2));
        const newTotal = Number((3.72 + (Math.random() - 0.5) * 0.08).toFixed(2));
        return {
          ...prev,
          batteryLevel: Number(newBat.toFixed(2)),
          solarInput: newSolar,
          totalConsumption: newTotal,
        };
      });

      // 5. Update performance frame counter
      setCounters(prev => ({
        ...prev,
        framesProcessed: prev.framesProcessed + 1,
      }));

    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, addLog]);

  // "SIMULATE DEBRIS EVENT" (Full 10-Second Showcase)
  const triggerDebrisEvent = useCallback(() => {
    if (isEventSimulating) return;
    setIsEventSimulating(true);
    setEventProgress(0);

    const eventTargetId = `D-0${Math.floor(Math.random() * 80 + 20)}`;

    addLog('OPTICAL', `[SIMULATION EVENT INITIATED] INCOMING HIGH-SPEED OBJECT DETECTED IN FOV`, 'WARN');
    setCameraMode('DETECTION');

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setEventProgress(step * 10);

      if (step === 2) {
        addLog('FILTER', `TEMPORAL FRAME DIFFERENCING: 46 BACKGROUND STARS CANCELLED`, 'SUCCESS');
      } else if (step === 4) {
        addLog('AI', `CORAL EDGE TPU INT8: TARGET ${eventTargetId} CLASSIFIED [SPACE_DEBRIS 98.4%]`, 'ALERT');
        setTargets(prev => [
          {
            id: eventTargetId,
            type: 'DEBRIS',
            confidence: 98.4,
            apparentMagnitude: 7.82,
            angularRate: 0.65,
            relativePosition: { dx: 1.84, dy: -0.92, dz: 0.45, range: 2.1 },
            relativeVelocity: 9.12,
            trackConfidence: 96.0,
            screenX: 0.42,
            screenY: 0.28,
            streakLength: 34,
            streakAngle: -55,
            history: [{ x: 0.38, y: 0.32 }, { x: 0.42, y: 0.28 }],
            predicted: [{ x: 0.46, y: 0.24 }, { x: 0.50, y: 0.20 }],
            ra: 198.42,
            dec: -15.11,
            status: 'TRACKING',
          },
          ...prev.slice(0, 4)
        ]);
        setSelectedTargetId(eventTargetId);
        setCurrentAlert({
          id: eventTargetId,
          title: `PROXIMITY ALERT // HIGH MOTION DEBRIS`,
          description: `Object ${eventTargetId} moving at 0.65°/s relative angular velocity. Predicted miss distance 2.1 km.`,
          confidence: 98.4,
          rangeKm: 2.1,
          level: 'CRITICAL'
        });
      } else if (step === 6) {
        addLog('TRACK', `SUB-PIXEL CENTROID RESOLVED: [612.4, 401.8] | J2000 ASTROMETRY LOCKED`, 'INFO');
      } else if (step === 8) {
        addLog('TELEMETRY', `64x64 ROI EXTRACTED | 2.3 MB RAW FRAME DISCARDED (99.98% REDUCTION)`, 'SUCCESS');
        const newPkt: TelemetryPacket = {
          packetId: Math.floor(Math.random() * 5000 + 10500),
          timestamp: new Date().toUTCString().slice(17, 25),
          utcEpoch: Date.now() / 1000,
          targetId: eventTargetId,
          objectClass: 'SPACE_DEBRIS',
          ra: 198.42,
          dec: -15.11,
          angularRate: 0.65,
          confidence: 98.4,
          rawSizeKb: 2332.8,
          compressedSizeBytes: 178,
          reductionPercentage: 99.992,
          roiWidth: 64,
          roiHeight: 64,
          status: 'TRANSMITTING',
        };
        setPackets(prev => [newPkt, ...prev.slice(0, 9)]);
      } else if (step === 10) {
        addLog('TELEMETRY', `UHF AX.25 DOWNLINK CONFIRMED: PACKET RECEIVED AT BENGALURU GROUND STATION`, 'SUCCESS');
        setPackets(prev => prev.map((p, idx) => idx === 0 ? { ...p, status: 'CONFIRMED' } : p));
        setCounters(prev => ({
          ...prev,
          objectsDetected: prev.objectsDetected + 1,
          validDebris: prev.validDebris + 1,
        }));
        setIsEventSimulating(false);
        clearInterval(interval);
      }
    }, 1000);
  }, [isEventSimulating, addLog]);

  // Manual commands
  const handleCommand = (action: string) => {
    switch (action) {
      case 'CAPTURE':
        setFrameCount(prev => prev + 1);
        addLog('OPTICAL', `MANUAL FRAME CAPTURE TRIGGERED [IMX296 1440x1080 @ 60ms]`, 'INFO');
        break;
      case 'INFERENCE':
        addLog('AI', `MANUAL INFERENCE RUN ON CORAL EDGE TPU (3.8 ms) [INT8_NOMINAL]`, 'SUCCESS');
        break;
      case 'TRACKING':
        setCameraMode('TRACKING');
        addLog('TRACK', `TRACKING MODE ENGAGED: KALMAN TRAJECTORY PREDICTION ACTIVE`, 'INFO');
        break;
      case 'ROI':
        setCameraMode('ROI');
        addLog('TELEMETRY', `REGION OF INTEREST (RoI) EXTRACTION ACTIVE (64x64 TILE)`, 'INFO');
        break;
      case 'TRANSMIT':
        addLog('TELEMETRY', `MANUAL DOWNLINK PACKET BROADCAST VIA UHF AX.25 GATED`, 'SUCCESS');
        break;
      default:
        break;
    }
  };

  return {
    isRunning,
    setIsRunning,
    simSpeed,
    setSimSpeed,
    cameraMode,
    setCameraMode,
    activeTab,
    setActiveTab,
    selectedTargetId,
    setSelectedTargetId,
    utcTime,
    missionElapsedSec,
    frameCount,
    targets,
    logs,
    packets,
    power,
    aiStats,
    counters,
    currentAlert,
    isEventSimulating,
    eventProgress,
    triggerDebrisEvent,
    handleCommand,
    addLog,
  };
}
