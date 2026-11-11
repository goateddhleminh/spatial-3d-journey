import gsap from 'gsap';

export class Modal {
  constructor(onClose) {
    this.onClose = onClose;
    this.modalEl = document.getElementById('achievement-modal');
    this.backdropEl = document.getElementById('modal-backdrop');
    this.closeBtn = document.getElementById('modal-close-btn');

    this.titleEl = document.getElementById('modal-title');
    this.categoryEl = document.getElementById('modal-category');
    this.scoreEl = document.getElementById('modal-score');
    this.descEl = document.getElementById('modal-desc');
    this.metricsEl = document.getElementById('modal-metrics-container');
    this.tagsEl = document.getElementById('modal-tags-container');

    this.isOpen = false;
    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(data) {
    this.isOpen = true;
    if (!this.modalEl) return;

    if (this.titleEl) this.titleEl.textContent = data.title;
    if (this.categoryEl) this.categoryEl.textContent = `${data.category} • ${data.year}`;
    if (this.scoreEl) {
      this.scoreEl.textContent = data.score;
      this.scoreEl.style.borderColor = data.color;
      this.scoreEl.style.color = data.color;
    }
    if (this.descEl) this.descEl.textContent = data.description;

    // Render metrics
    if (this.metricsEl) {
      this.metricsEl.innerHTML = data.metrics.map(m => `
        <div class="metric-box">
          <div class="metric-val" style="color: ${data.color}">${m.value}</div>
          <div class="metric-lbl">${m.label}</div>
        </div>
      `).join('');
    }

    // Render tags
    if (this.tagsEl) {
      this.tagsEl.innerHTML = data.tags.map(t => `
        <span class="modal-tag">${t}</span>
      `).join('');
    }

    this.modalEl.style.display = 'flex';
    gsap.fromTo(this.modalEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo('.modal-content-card',
      { y: 40, scale: 0.95 },
      { y: 0, scale: 1.0, duration: 0.5, ease: 'power3.out' }
    );
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    gsap.to(this.modalEl, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (this.modalEl) this.modalEl.style.display = 'none';
        if (this.onClose) this.onClose();
      }
    });
  }
}
