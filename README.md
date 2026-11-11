# 🌌 Spatial Odyssey — Awwwards-Level Interactive 3D Journey

An award-winning (Awwwards-style) interactive 3D personal website and portfolio that tells a life story, pivotal milestones, and achievements as an immersive WebGL journey along a 3D spline.

Built with **Vite**, **Three.js**, **GSAP**, **Lenis Smooth Scroll**, and custom **GLSL Shaders**, strictly maintaining **60 FPS+** with adaptive quality regulation.

---

## ⚡ Quick Start

### 1. Direct in Browser (Zero Server Needed)
Simply double-click `index.html` (or `dist/index.html`) or open with **VS Code Live Server** / `python -m http.server`.
A pre-compiled classic fallback bundle (`app.bundle.js`) automatically loads whenever Vite's dev server isn't running, bypassing `file://` ES-module CORS restrictions.

### 2. Development Mode with Vite
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
├── index.html                    # Semantic HTML5 entry, HUD, Modals, Loader & fallback boot
├── app.bundle.js                 # Pre-compiled standalone classic bundle for file:// & Live Server
├── build-standalone.mjs          # Generates app.bundle.js via esbuild during npm run build
├── package.json                  # Pinned dependencies (Three.js, GSAP, Lenis)
├── vite.config.js                # Vite config (relative base './')
├── README.md                     # Documentation & architectural breakdown
└── src/
    ├── main.js                   # Application orchestrator, Lenis & GSAP single RAF loop
    ├── data/
    │   └── portfolioData.js      # Story chapters, milestones, achievements & socials
    ├── webgl/
    │   ├── World.js              # Three.js canvas, post-processing, light, resize & render loop
    │   ├── CameraPath.js         # CatmullRom 3D spline flight, banking/roll, inspection mode
    │   ├── Environment.js        # 2,500-star InstancedMesh tunnel, chapter rings & Future Portal
    │   ├── MorphParticles.js     # 24,000 GPU particles morphing between 6 shapes
    │   ├── Artifacts.js          # Interactive 3D floating monuments with Fresnel shaders & raycasting
    │   ├── Constellation.js      # Glowing dynamic 3D lines connecting discovered achievements
    │   ├── QualityManager.js     # Rolling FPS monitor, adaptive DPR regulator & debug HUD
    │   └── Shaders.js            # Custom GLSL shaders (Sky dome, Morph particles, Fresnel, Grain)
    ├── audio/
    │   └── SoundEngine.js        # Generative Web Audio API synthesizer (no external audio files needed!)
    ├── ui/
    │   ├── Cursor.js             # Magnetic buttons & custom trailing context cursor
    │   ├── Loader.js             # Cinematic intro counter (0–100%) & masked text reveal
    │   ├── Hud.js                # Chapter progress, constellation tracker, audio visualizer
    │   └── Modal.js              # 3D inspection drawer with scores, metrics, and tags
    └── styles/
        ├── main.css              # Dark luxury palette, glassmorphism, typography
        └── components.css        # HUD, custom cursor, modals, loader, responsive layout
```

---

## 🎯 Unique Features Implemented

1. **CatmullRom 3D Spline Flight**:
   - Camera flies along a smooth mathematical trajectory through 6 distinct spatial zones.
   - LookAt trajectory smoothly frames each landmark.
   - Dynamic camera banking / roll on turns (`-curvature * velocity`) and micro camera shake during high scroll speeds.

2. **24,000 GPU Particles Morphing System**:
   - Custom GLSL vertex shader morphs particles seamlessly between 6 mathematical shapes:
     1. *Seed / Blossom* (Fibonacci Phyllotaxis Golden Spiral)
     2. *Crystalline Book* (Parametric Origami Pages)
     3. *Cyber Lattice* (Quantized Neural Matrix Grid)
     4. *Orbital Accelerator* (Double Torus with Particle Ring)
     5. *Stellated Trophy* (Golden Icosahedral Spike Star)
     6. *Future Portal* (Multi-turn Hyperspace Vortex)
   - Zero CPU geometry recreation: transitions run purely on the GPU via `mix()` with cubic bezier ease.

3. **Cursor-Reactive World**:
   - Mouse parallax tilting the camera and directional lighting.
   - Mouse-following 3D point light casting real-time specular glints.
   - Particle cursor repulsion in vertex shader.
   - Raycasting with hover glow, tilt, and click-to-inspect 3D camera zoom.

4. **Custom GLSL Shaders & Post-Processing**:
   - Dynamic Celestial Sky Shader: Simplex noise nebula, real-time procedural stars, and smooth chapter palette shifts.
   - Fresnel Iridescent Shader: Chromatic rim lighting and holographic contour lines on floating monuments.
   - Cinematic Post-Processing: Three.js `EffectComposer` with `UnrealBloomPass` and fine `FilmGrainShader` + radial vignette.

5. **Constellation of Achievements**:
   - Glowing 3D lasers connect achievements in space as you discover them.
   - Real-time HUD progress bar tracking unlocked milestones (e.g. `0 / 5` → `5 / 5`).

6. **Cinematic Intro Loader**:
   - Smooth 0% → 100% counter with progress bar.
   - Split masked typography reveal.

7. **Magnetic Ergonomics & Custom Cursor**:
   - Trailing inertia cursor with context states (`hover`, `inspect`, `sound`).
   - Magnetic pull on all interactive buttons.

8. **Zero-Asset Generative Audio Engine**:
   - Built directly on the native browser **Web Audio API** — no mp3/wav files required!
   - Generative sub-bass drone (55Hz) with harmonic pentatonic pad.
   - Reactive lowpass filter: as scroll speed increases, filter opens from 380Hz to 1200Hz, simulating rush through hyperspace.
   - Real-time frequency analyzer powering the HUD animated equalizer bars.

---

## ⚡ How 60 FPS+ Performance is Maintained

1. **Single Unified RAF Loop**:
   - GSAP Ticker, Lenis smooth scroll, and Three.js composer rendering are bound to a single `requestAnimationFrame` loop, eliminating synchronization jitter.
2. **Zero In-Loop Memory Allocations**:
   - Pre-allocated, pooled instances of `THREE.Vector3`, `THREE.Euler`, and `THREE.Matrix4` are reused across frames. No garbage collection pauses.
3. **GPU-Accelerated Morphing**:
   - Morph positions are stored in GPU attributes (`position` and `targetPosition`). Interpolation happens entirely in the vertex shader.
4. **Adaptive Quality Manager**:
   - Continuously records rolling FPS over 60 frames.
   - If average FPS drops below 54 FPS: automatically scales down `devicePixelRatio` and toggles bloom passes to guarantee smooth thermal performance.
5. **Debug Mode**:
   - Toggle live engine metrics (FPS, DPR, Draw Calls, Triangles) by clicking the **FPS** button in the header or adding `?debug=1` to the URL.

---

## ♿ Accessibility & SEO

- **Semantic HTML5**: Native `<header>`, `<main>`, `<section>`, `<article>`, and `<nav>` landmarks.
- **Keyboard Navigation**: Full support for `ArrowDown`, `ArrowUp`, `PageDown`, `PageUp`, and `Escape` to close drawers.
- **Reduced Motion Support**: Respects `prefers-reduced-motion: reduce` and defaults to clean static navigation.
- **SEO & Social Graph**: Rich Open Graph and Twitter Card tags pre-configured in `index.html`.

---

## 🛠️ Personalization

To personalize the website with your own milestones, achievements, or links, simply edit:
👉 `src/data/portfolioData.js`
All text, metrics, years, colors, and camera coordinates update automatically!
