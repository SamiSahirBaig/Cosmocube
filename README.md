# COSMOCUBE: EDGE-DEBRIS-1U 🛰️
### Autonomous Onboard Edge-AI Space Debris Detection & Tracking System for a 1U CubeSat

**Project Name:** EDGE-DEBRIS-1U (Cosmocube)  
**Team:** Team Boxster  
**Event:** Smart India Hackathon (SIH) 2026 — Student Innovation Category  

---

## 🌌 Overview

In Low Earth Orbit (LEO), space debris ranging from 1 mm to 10 cm poses an existential threat to satellite constellations. Traditional ground-based radars cannot track sub-centimeter particles, and conventional 1U CubeSats cannot downlink megapixel camera streams over constrained UHF radio links (typically 9.6 to 19.2 kbps).

**EDGE-DEBRIS-1U** solves this problem by performing **100% of detection, starfield suppression, AI classification, sub-pixel centroiding, and orbit tracking onboard the satellite**:

$$\text{RAW Optical Frame (2.3 MB)} \longrightarrow \text{Edge-AI Processing} \longrightarrow \text{Telemetry Packet (180 Bytes)}$$

> **Over 99.9% of raw optical data is discarded onboard.** Only actionable astrometric vectors and target telemetry packets are transmitted to Earth, conserving satellite power and scarce downlink bandwidth.

---

## 🚀 Key Innovations & Subsystems

1. **Optical Payload:** Sony IMX296 global shutter monochrome CMOS sensor (1440×1080 @ 30 fps, 60 ms exposure, 35mm f/1.4 lens, 20.3 arcsec/pixel IFOV).
2. **Onboard Hardware Filtering:** Temporal frame differencing ($\Delta t = 3$ frames) eliminates static starfields and cosmic ray artifacts in hardware before AI inference.
3. **Edge-AI Co-Processor:** Google Coral Edge TPU (4.0 TOPS INT8 @ 0.5W/TOPS) running quantized `DebrisNet-INT8` (MobileNetV3 Tiny) in **3.8 ms**.
4. **Sub-Pixel Centroiding & Astrometry:** Gaussian Point Spread Function (PSF) curve fitting achieves $\pm 0.08$ pixel centroid precision mapped to J2000 celestial coordinates (Right Ascension & Declination).
5. **Orbit Estimation:** 6-state Extended Kalman Filter (EKF) propagates relative Hill-frame vectors ($\Delta X, \Delta Y, \Delta Z$) and calculates collision proximity.
6. **Intelligent Telemetry Packetization:** Discards empty space pixels and packages a 64×64 Region of Interest (RoI) with target metadata into a compact 178-byte JSON payload for AX.25 UHF transmission.

---

## 🖥️ Mission Control Operations Frontend Prototype

The repository includes a mission-control dashboard (`index.html`):
- **Live Space Camera + AI Vision:** 60 FPS Canvas rendering starfield, Earth limb curvature, target streaks, and HUD targeting brackets.
- **Before / After Filter Visualizer:** Split view showing raw optical sensor data vs. cleaned debris frame.
- **Interactive 3D 1U CubeSat:** 3D model with GaAs solar panels, camera lens, and transparent 28.4° optical field-of-view cone.
- **2D Orbital Tracking Radar:** Relative Hill-frame astrometry with range rings and Kalman predicted trajectories.
- **Earth Downlink Visualizer:** Packet transmission from CubeSat orbit to Bengaluru Ground Station (12.97° N, 77.59° E).
- **EPS Power Monitor:** Live multi-trace waveform of Solar Input (4.82 W) vs System Load (3.75 W) vs Battery (92%).
- **10-Second Event Showcase:** `SIMULATE DEBRIS EVENT` demonstrates the end-to-end pipeline with sound synthesis and alert escalation.

---

## 📂 Repository Contents

```
├── index.html                                        # Complete interactive Mission Control dashboard
├── presentation_slides.html                          # Interactive SIH presentation slide deck
├── SPACE_DEBRIS_EDGE_AI_CUBESAT_RESEARCH_HANDBOOK.md # 800+ line technical handbook & 50 verified literature review papers
├── MISSION_CONTROL_PROTOTYPE_DOCS.md                 # Frontend architecture and evaluation guide
├── src/                                              # Modular React/TypeScript application sources
│   ├── components/                                   # Mission control UI components
│   ├── data/                                         # Space debris simulation datasets
│   ├── hooks/                                        # Real-time ticking simulation hooks
│   └── types/                                        # Domain data contracts
├── package.json                                      # Project dependencies & scripts
├── tsconfig.json                                     # TypeScript configuration
├── vite.config.ts                                    # Vite bundler configuration
└── tailwind.config.js                                # Tailwind CSS styling tokens
```

---

## ⚡ How to Run

### Quick View (Zero Dependencies)
Simply open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Brave, Mozilla Firefox).

### Via Local Server
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080/index.html`.

---

## 👥 Team
- **Team Name:** Team Boxster  
- **Lead / Developer:** Sami Sahir Baig  
- **Initiative:** Smart India Hackathon (SIH) 2026 Student Innovation  
