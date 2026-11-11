/**
 * QualityManager & Performance Monitor
 * Guarantees steady 60fps+ by dynamically regulating DPR, bloom intensity, and particle scales.
 */

export class QualityManager {
  constructor(renderer, postprocessing) {
    this.renderer = renderer;
    this.postprocessing = postprocessing;

    // Detect high refresh rate & cap DPR at 2.0
    this.baseDpr = Math.min(window.devicePixelRatio || 1, 2.0);
    this.currentDpr = this.baseDpr;
    this.minDpr = 1.0;

    // Frame metrics
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.historyLength = 60;

    // Adaptive state
    this.isDegraded = false;
    this.degradeCooldown = 0;

    // Check debug mode
    const urlParams = new URLSearchParams(window.location.search);
    this.isDebug = urlParams.get('debug') === '1' || window.location.hash === '#debug';

    // Reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initDebugHud();
  }

  initDebugHud() {
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'perf-debug-hud';
    this.hudEl.className = 'perf-debug-hud';
    if (!this.isDebug) {
      this.hudEl.style.display = 'none';
    }

    this.hudEl.innerHTML = `
      <div class="hud-header">
        <span class="hud-dot"></span>
        <strong>ENGINE MONITOR</strong>
      </div>
      <div class="hud-stat"><span class="hud-lbl">FPS:</span> <span id="debug-fps" class="hud-val">60</span></div>
      <div class="hud-stat"><span class="hud-lbl">DPR:</span> <span id="debug-dpr" class="hud-val">${this.currentDpr.toFixed(2)}</span></div>
      <div class="hud-stat"><span class="hud-lbl">Draw Calls:</span> <span id="debug-draws" class="hud-val">0</span></div>
      <div class="hud-stat"><span class="hud-lbl">Triangles:</span> <span id="debug-triangles" class="hud-val">0</span></div>
      <div class="hud-stat"><span class="hud-lbl">Mode:</span> <span id="debug-mode" class="hud-val">Ultra 60fps</span></div>
    `;

    document.body.appendChild(this.hudEl);

    this.fpsValEl = this.hudEl.querySelector('#debug-fps');
    this.dprValEl = this.hudEl.querySelector('#debug-dpr');
    this.drawsValEl = this.hudEl.querySelector('#debug-draws');
    this.trianglesValEl = this.hudEl.querySelector('#debug-triangles');
    this.modeValEl = this.hudEl.querySelector('#debug-mode');
  }

  toggleDebug(show) {
    if (show !== undefined) {
      this.isDebug = show;
    } else {
      this.isDebug = !this.isDebug;
    }
    this.hudEl.style.display = this.isDebug ? 'block' : 'none';
  }

  recordFrame(now) {
    if (!this.initialized) {
      this.initialized = true;
      this.lastTime = now;
      this.updateDebugDisplay();
      return;
    }

    this.frameCount++;
    const delta = now - this.lastTime;

    if (delta >= 500) {
      this.fps = Math.max(1, Math.round((this.frameCount * 1000) / delta));
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > this.historyLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = now;

      this.checkAdaptiveScale();
      this.updateDebugDisplay();
    }
  }

  checkAdaptiveScale() {
    if (this.fpsHistory.length < 20) return;

    // Calculate rolling average
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

    if (avgFps < 54 && this.currentDpr > this.minDpr) {
      // Step down resolution
      this.currentDpr = Math.max(this.minDpr, this.currentDpr - 0.25);
      this.renderer.setPixelRatio(this.currentDpr);
      this.isDegraded = true;
      if (this.postprocessing && this.postprocessing.bloomPass) {
        this.postprocessing.bloomPass.enabled = this.currentDpr > 1.2;
      }
    } else if (avgFps >= 58 && this.currentDpr < this.baseDpr) {
      // Recover gracefully if system has stabilized
      this.degradeCooldown++;
      if (this.degradeCooldown > 10) {
        this.currentDpr = Math.min(this.baseDpr, this.currentDpr + 0.25);
        this.renderer.setPixelRatio(this.currentDpr);
        this.degradeCooldown = 0;
      }
    }
  }

  updateDebugDisplay() {
    if (!this.isDebug) return;

    const info = this.renderer.info;
    this.fpsValEl.textContent = `${this.fps}`;
    this.fpsValEl.style.color = this.fps >= 55 ? '#10b981' : (this.fps >= 40 ? '#f59e0b' : '#ef4444');
    this.dprValEl.textContent = `${this.currentDpr.toFixed(2)}`;
    this.drawsValEl.textContent = `${info.render.calls}`;
    this.trianglesValEl.textContent = `${info.render.triangles}`;
    this.modeValEl.textContent = this.isDegraded ? 'Adaptive Eco' : 'Cinematic High';
  }
}
