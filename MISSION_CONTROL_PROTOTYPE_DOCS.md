# EDGE-DEBRIS-1U: Mission Control Operations Frontend Prototype

**Team:** Team Boxster  
**Event:** Smart India Hackathon (SIH) 2026 — Student Innovation  
**System:** Onboard Edge-AI Space Debris Detection & Tracking System for a 1U CubeSat  
**File Location:** [index.html](file:///c:/Users/baigs/OneDrive/Desktop/sih%20cubesat/index.html)  
**Local Web Server:** `http://localhost:8080/index.html`

---

## 1. Executive Summary & Core Mission Story

In Low Earth Orbit (LEO), space debris poses a catastrophic collision risk to operational satellites. Standard ground radar networks cannot track sub-centimeter particles, and typical CubeSats lack the radio downlink bandwidth (typically 9.6 to 19.2 kbps UHF) to transmit high-resolution video or megapixel images to Earth.

**EDGE-DEBRIS-1U** solves this bandwidth bottleneck through **100% Onboard Autonomous Edge-AI Intelligence**:
$$\text{Optical Capture (2.3 MB)} \xrightarrow{\text{Temporal Difference}} \text{Star Cancellation} \xrightarrow{\text{Coral Edge TPU}} \text{Classification} \xrightarrow{\text{EKF Orbit}} \text{Telemetry Packet (180 B)}$$

The satellite discards **>99.9%** of raw pixel data onboard and **only transmits verified debris state vectors and a 64×64 region-of-interest (RoI)** to Earth, conserving satellite power and scarce downlink bandwidth.

---

## 2. Architecture & Interactive Panels

The frontend is a single-page mission control application built with aerospace aesthetics:
- **Primary Palette:** Deep aerospace black (`#05080D`), dark navy surfaces (`#070B12`, `#0B111A`, `#0F1722`), electric cyan accents (`#00F0FF`), warning reds (`#EF4444`), telemetry blues (`#3B82F6`), TPU violet (`#A855F7`), and nominal greens (`#10B981`).
- **Typography:** `JetBrains Mono`, `Space Grotesk`, and `Inter` with micro-labels and scanlines.
- **Audio Feedback:** In-browser Web Audio API synthesizing high-tech telemetry beeps for command activations and proximity alerts.

### 2.1 Overview Dashboard (Main Tab)
- **Top Status Bar:**
  - Real-time telemetry: CubeSat `BX-01`, LEO SSO altitude (~519.4 km), orbital velocity (~7.61 km/s), nominal status.
  - Subsystems: Coral Edge TPU INT8 active, Sony IMX296 global shutter online, UHF link active, battery bar (92%), circular data buffer gauge (34%).
- **Center Hero Panel — Live Space Camera & AI Vision Canvas:**
  - HTML5 Canvas rendering 220+ twinkling background stars, Earth limb atmospheric curvature glow in bottom-left, sensor thermal noise, and moving debris streaks.
  - Computer-Vision HUD layer: Cyan/Red bounding box, corner targeting brackets, target ID (`D-017`), confidence (96.8%), angular rate (0.42°/s), estimated velocity (7.42 m/s), and J2000 celestial coordinates (RA 184.32°, DEC -12.81°).
  - Interactive Camera Modes: `RAW`, `FILTERED`, `DETECTION`, `TRACKING`, `ROI`.
- **Left Column:**
  - **Interactive 3D 1U CubeSat Canvas:** Rotatable via mouse drag, auto-rotation toggle, forward camera aperture with transparent projected 28.4° FOV cone.
  - **Proximity Alert Panel:** Scientific warning for high-motion intersecting vectors.
  - **Mission Control Command Panel:** Interactive buttons for operator telecommands (`CAPTURE FRAME`, `RUN INFERENCE`, `START TRACKING`, `EXTRACT RoI`, `CREATE TELEM`, `TRANSMIT UHF`).
- **Right Column:**
  - **AI Object Classification Panel:** Softmax confidence breakdown for `D-017` (Debris 96.8%), `D-018` (Debris 91.3%), `S-041` (Star 99.1%), `N-008` (Noise 87.4%) with aggregate candidate counters.
  - **2D Orbital Tracking Radar Canvas:** CubeSat at center, concentric range rings (2, 4, 6, 8 km), rotating radar sweep beam, fading historical track, and dashed predicted 6-state Kalman trajectory.
- **Bottom Multi-Panel:**
  - **Intelligent Telemetry Packetization Visualizer:** Animated reduction from 2.3 MB Raw Image &rarr; Edge AI &rarr; 180-Byte JSON Packet (>99.9% reduction).
  - **Earth Downlink Terminal:** 2D Earth globe visualization showing downlinked packet stream from CubeSat to Bengaluru Ground Station (12.97° N, 77.59° E), signal (-62 dBm), packet loss (0.3%), latency (142 ms).
  - **Real-Time System Log Terminal:** Live auto-scrolling log with millisecond UTC timestamps.
- **Horizontal Mission Lifecycle Timeline:**
  - 8 stages: `1. CAPTURE` &rarr; `2. FILTER` &rarr; `3. DETECT` &rarr; `4. CLASSIFY` &rarr; `5. CENTROID` &rarr; `6. TRACK` &rarr; `7. PACKETIZE` &rarr; `8. DOWNLINK`.
  - Click any stage to inspect execution duration, hardware unit, and mathematical operations.

---

## 3. Dedicated Inspection Tabs

1. **Tab 1: OVERVIEW** — Integrated mission control operations console.
2. **Tab 2: CAMERA** — Side-by-side Before/After filter comparison (Raw frame with stars/cosmic rays vs Cleaned frame isolating debris target) with 4 status badges.
3. **Tab 3: EDGE AI** — Detailed 8-stage execution sequence, Google Coral TPU (4.0 TOPS INT8) telemetry, CPU/NPU/RAM/FPS load gauges.
4. **Tab 4: DEBRIS TRACKING** — Large-format 2D radar astrometry and Hill-frame Cartesian state vectors ($ΔX, ΔY, ΔZ$).
5. **Tab 5: TELEMETRY** — Live AX.25 hex dump, decoded JSON payload inspector, and historical packet table.
6. **Tab 6: POWER** — EPS subsystem breakdown (Solar 4.82W vs Systems 3.75W) with live SVG/Canvas waveform graph.
7. **Tab 7: SYSTEM LOGS** — Full-screen audit trail with category filtering (`ALL`, `OPTICAL`, `FILTER`, `AI`, `TRACK`, `TELEMETRY`, `WARN`).

---

## 4. The 10-Second Showcase: "SIMULATE DEBRIS EVENT"

Clicking the **SIMULATE DEBRIS EVENT (10s)** button at the top-right triggers an automated end-to-end mission demonstration designed specifically for Hackathon evaluators:

| Elapsed | Action | Visual Indication | Audio Feedback |
|---|---|---|---|
| **0.0s** | Event Triggered | Red event progress bar initiates, log warning | Low saw-tooth alarm beep |
| **2.0s** | Optical Filtering | 46 background stars suppressed via temporal differencing | Chime 520 Hz |
| **4.0s** | Edge-AI Detection | Coral Edge TPU identifies target (e.g. `D-089`), softmax 98.4% | Alert 780 Hz |
| **6.0s** | Trajectory Estimation | Sub-pixel Gaussian centroid resolved; Kalman orbit lock | Chime 880 Hz |
| **8.0s** | Telemetry Packetization | 64×64 RoI cropped; 2.3 MB raw image discarded | Data pulse 980 Hz |
| **10.0s** | Downlink Confirmation | Packet received at Bengaluru Ground Station; counters update | Success tone 1200 Hz |

---

## 5. How to Run & Present

The prototype is 100% self-contained in a single file with zero external dependencies.

### Option A: Via Python Web Server (Active)
The local server is already running in the background on port `8080`:
```
http://localhost:8080/index.html
```

### Option B: Direct Browser Opening
Simply double-click or open [index.html](file:///c:/Users/baigs/OneDrive/Desktop/sih%20cubesat/index.html) in any modern browser (Google Chrome, Microsoft Edge, Brave, Mozilla Firefox).
