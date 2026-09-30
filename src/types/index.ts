export type NavigationTab = 
  | 'OVERVIEW' 
  | 'CAMERA' 
  | 'EDGE AI' 
  | 'DEBRIS TRACKING' 
  | 'TELEMETRY' 
  | 'POWER' 
  | 'SYSTEM LOGS';

export type CameraMode = 'RAW' | 'FILTERED' | 'DETECTION' | 'TRACKING' | 'ROI';

export interface DebrisTarget {
  id: string;
  type: 'DEBRIS' | 'STAR' | 'NOISE';
  confidence: number;
  apparentMagnitude: number;
  angularRate: number; // deg/s
  relativePosition: {
    dx: number; // km
    dy: number; // km
    dz: number; // km
    range: number; // km
  };
  relativeVelocity: number; // m/s
  trackConfidence: number; // %
  screenX: number; // normalized 0..1
  screenY: number; // normalized 0..1
  streakLength: number; // px
  streakAngle: number; // degrees
  history: Array<{ x: number; y: number }>;
  predicted: Array<{ x: number; y: number }>;
  ra: number; // Right Ascension deg
  dec: number; // Declination deg
  status: 'TRACKING' | 'ACQUIRING' | 'SUPPRESSED';
}

export interface TelemetryPacket {
  packetId: number;
  timestamp: string;
  utcEpoch: number;
  targetId: string;
  objectClass: string;
  ra: number;
  dec: number;
  angularRate: number;
  confidence: number;
  rawSizeKb: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  roiWidth: number;
  roiHeight: number;
  status: 'BUFFERED' | 'TRANSMITTING' | 'CONFIRMED';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  category: 'OPTICAL' | 'FILTER' | 'AI' | 'TRACK' | 'TELEMETRY' | 'POWER' | 'WARN';
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT';
}

export interface PowerState {
  solarInput: number; // Watts
  edgeAi: number; // Watts
  camera: number; // Watts
  processing: number; // Watts
  telemetry: number; // Watts
  totalConsumption: number; // Watts
  batteryLevel: number; // %
  batteryVoltage: number; // V
  history: Array<{ time: string; input: number; consumption: number; battery: number }>;
}

export interface AIStats {
  modelName: string;
  modelSize: string;
  precision: string;
  inferenceTimeMs: number;
  cpuLoad: number;
  npuLoad: number;
  ramUsage: number;
  fps: number;
  powerWatts: number;
  activeStage: PipelineStage;
}

export type PipelineStage = 
  | 'CAPTURE'
  | 'FILTER'
  | 'DETECT'
  | 'CLASSIFY'
  | 'CENTROID'
  | 'TRACK'
  | 'PACKETIZE'
  | 'DOWNLINK';

export interface PerformanceCounters {
  framesProcessed: number;
  objectsDetected: number;
  validDebris: number;
  falsePositives: number;
  avgInferenceMs: number;
  telemetryReductionPercent: number;
  edgePowerWatts: number;
  trackConfidence: number;
}
