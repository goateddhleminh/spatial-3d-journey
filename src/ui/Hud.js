import gsap from 'gsap';
import { chapters, achievements } from '../data/portfolioData.js';

export class Hud {
  constructor(soundEngine, qualityManager, onChapterSelect) {
    this.soundEngine = soundEngine;
    this.qualityManager = qualityManager;
    this.onChapterSelect = onChapterSelect;

    this.soundBtn = document.getElementById('hud-sound-btn');
    this.soundBars = document.querySelectorAll('.sound-wave-bar');
    this.debugBtn = document.getElementById('hud-debug-btn');
    this.motionBtn = document.getElementById('hud-motion-btn');
    this.constellationCountEl = document.getElementById('constellation-count');
    this.constellationBarEl = document.getElementById('constellation-progress');

    this.hoverCard = document.getElementById('achievement-hover-card');
    this.hoverTitle = document.getElementById('hover-card-title');
    this.hoverCategory = document.getElementById('hover-card-category');
    this.hoverScore = document.getElementById('hover-card-score');
    this.hoverDesc = document.getElementById('hover-card-desc');

    this.chapterNavDots = document.querySelectorAll('.chapter-nav-dot');
    this.chapterActiveName = document.getElementById('hud-chapter-active-name');
    this.chapterActiveEra = document.getElementById('hud-chapter-active-era');

    this.freqData = new Uint8Array(16);

    this.initEvents();
  }

  initEvents() {
    // Sound Toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isSoundOn = this.soundEngine.toggleSound();
        this.soundBtn.classList.toggle('active', isSoundOn);
        const label = this.soundBtn.querySelector('.hud-btn-label');
        if (label) label.textContent = isSoundOn ? 'AUDIO ON' : 'AUDIO OFF';
      });
    }

    // Debug FPS Toggle
    if (this.debugBtn) {
      this.debugBtn.addEventListener('click', () => {
        this.qualityManager.toggleDebug();
        this.debugBtn.classList.toggle('active', this.qualityManager.isDebug);
      });
    }

    // Chapter nav dot clicks
    this.chapterNavDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-chapter-index'), 10);
        if (this.onChapterSelect) {
          this.onChapterSelect(targetIndex);
        }
      });
    });
  }

  updateChapter(index, progress) {
    const chapter = chapters[index] || chapters[0];

    if (this.chapterActiveName) this.chapterActiveName.textContent = chapter.title;
    if (this.chapterActiveEra) this.chapterActiveEra.textContent = `${chapter.year} — ${chapter.era}`;

    this.chapterNavDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  updateConstellation(discoveredCount) {
    if (this.constellationCountEl) {
      this.constellationCountEl.textContent = `${discoveredCount} / ${achievements.length}`;
    }
    if (this.constellationBarEl) {
      const pct = (discoveredCount / achievements.length) * 100;
      this.constellationBarEl.style.width = `${pct}%`;
    }
  }

  showHoverCard(data) {
    if (!this.hoverCard) return;

    if (!data) {
      gsap.to(this.hoverCard, { opacity: 0, y: 15, duration: 0.25, pointerEvents: 'none' });
      return;
    }

    if (this.hoverTitle) this.hoverTitle.textContent = data.title;
    if (this.hoverCategory) this.hoverCategory.textContent = `${data.category} • ${data.year}`;
    if (this.hoverScore) {
      this.hoverScore.textContent = data.score;
      this.hoverScore.style.borderColor = data.color;
      this.hoverScore.style.color = data.color;
    }
    if (this.hoverDesc) this.hoverDesc.textContent = data.preview;

    gsap.to(this.hoverCard, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power3.out',
      pointerEvents: 'auto'
    });
  }

  update() {
    // Animate audio equalizer bars from live web audio frequencies
    if (this.soundEngine && !this.soundEngine.isMuted) {
      this.soundEngine.getFrequencyData(this.freqData);
      this.soundBars.forEach((bar, idx) => {
        const val = this.freqData[idx * 3] || 10;
        const scaleY = Math.max(0.2, (val / 255) * 1.6);
        bar.style.transform = `scaleY(${scaleY.toFixed(2)})`;
      });
    } else {
      this.soundBars.forEach((bar) => {
        bar.style.transform = 'scaleY(0.25)';
      });
    }
  }
}
