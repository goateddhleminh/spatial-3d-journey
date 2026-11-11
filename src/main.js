import Lenis from 'lenis';
import gsap from 'gsap';
import { World } from './webgl/World.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { CustomCursor } from './ui/Cursor.js';
import { Loader } from './ui/Loader.js';
import { Hud } from './ui/Hud.js';
import { Modal } from './ui/Modal.js';
import { chapters } from './data/portfolioData.js';

// Signal to fallback bootstrapper that native/bundled ES module executed
window.__SPATIAL_APP_BOOTED__ = true;

class App {
  constructor() {
    this.lastChapterIdx = 0;
    this.scrollHintEl = document.getElementById('scroll-cue-hint');
    this.initLenis();
    this.initEngines();
    this.initUI();
    this.initTickLoop();
    this.initShortcuts();
  }

  initLenis() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lenis = new Lenis({
      duration: reducedMotion ? 0.2 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !reducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    this.lenis.on('scroll', (e) => {
      const scroll = e.scroll;
      const limit = e.limit || Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, scroll / limit));

      if (this.scrollHintEl && scroll > 60) {
        this.scrollHintEl.style.opacity = '0';
      } else if (this.scrollHintEl) {
        this.scrollHintEl.style.opacity = '1';
      }

      if (this.world) {
        this.world.setScrollProgress(progress);
      }

      if (this.soundEngine) {
        this.soundEngine.setSpeed(e.velocity);
      }

      const chapterIdx = Math.min(chapters.length - 1, Math.floor(progress * chapters.length + 0.12));
      if (chapterIdx !== this.lastChapterIdx) {
        this.lastChapterIdx = chapterIdx;
        if (this.soundEngine) {
          this.soundEngine.setChapterMood(chapterIdx);
        }
      }
      if (this.hud) {
        this.hud.updateChapter(chapterIdx, progress);
      }
    });
  }

  initEngines() {
    const canvasContainer = document.getElementById('canvas-container');
    this.world = new World(canvasContainer);
    this.soundEngine = new SoundEngine();
  }

  initUI() {
    this.cursor = new CustomCursor();

    this.modal = new Modal(() => {
      if (this.world) {
        this.world.exitInspection();
      }
    });

    this.hud = new Hud(
      this.soundEngine,
      this.world.quality,
      (targetChapterIndex) => this.scrollToChapter(targetChapterIndex)
    );

    this.world.onHoverAchievement = (data) => {
      this.hud.showHoverCard(data);
      if (data) {
        this.cursor.setState('hover', 'INSPECT');
        this.soundEngine.playHoverChime();
      } else {
        this.cursor.setState('default');
      }
    };

    this.world.onInspectAchievement = (data) => {
      this.soundEngine.playDiscoveryChime();
      this.world.inspectAchievement(data);
      this.modal.open(data);
      this.cursor.setState('default');
    };

    this.world.onConstellationChange = (count) => {
      this.hud.updateConstellation(count);
      this.soundEngine.playDiscoveryChime();
    };

    const copyBtn = document.getElementById('copy-email-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    if (copyBtn && copyBtnText) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('kai.vance.dev@gmail.com').then(() => {
          const original = copyBtnText.textContent;
          copyBtnText.textContent = 'COPIED TO CLIPBOARD!';
          copyBtn.style.borderColor = '#10b981';
          copyBtn.style.color = '#10b981';
          this.soundEngine.playHoverChime();

          setTimeout(() => {
            copyBtnText.textContent = original;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
          }, 2500);
        });
      });
    }

    this.loader = new Loader(() => {
      this.lenis.start();
      const skipIntro = new URLSearchParams(window.location.search).get('skip') === '1';
      if (!skipIntro) {
        gsap.from('#chapter-0 .chapter-content-card', {
          y: 22,
          opacity: 0.15,
          duration: 0.55,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        });
      }
    });

    this.lenis.stop();
  }

  scrollToChapter(index) {
    const targetSection = document.getElementById(`chapter-${index}`);
    if (targetSection) {
      this.lenis.scrollTo(targetSection, { duration: 1.6 });
    }
  }

  initTickLoop() {
    let clockTime = 0;

    gsap.ticker.add((time, deltaTime) => {
      const delta = Math.min(deltaTime / 1000, 0.1);
      clockTime += delta;
      const now = performance.now();

      this.lenis.raf(now);

      if (this.world) {
        this.world.render(delta, clockTime, now);
      }

      if (this.cursor) {
        this.cursor.update();
      }

      if (this.hud) {
        this.hud.update();
      }
    });
  }

  initShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (this.modal && this.modal.isOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        const nextIdx = Math.min(chapters.length - 1, this.world.currentChapterIndex + 1);
        this.scrollToChapter(nextIdx);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        const prevIdx = Math.max(0, this.world.currentChapterIndex - 1);
        this.scrollToChapter(prevIdx);
      }
    });
  }
}

function boot() {
  if (window.__SPATIAL_APP_INSTANCE__) return;
  window.__SPATIAL_APP_INSTANCE__ = new App();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
