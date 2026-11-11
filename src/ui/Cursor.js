import gsap from 'gsap';

export class CustomCursor {
  constructor() {
    this.cursorEl = document.getElementById('custom-cursor');
    this.dotEl = document.getElementById('cursor-dot');
    this.ringEl = document.getElementById('cursor-ring');
    this.labelEl = document.getElementById('cursor-label');

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.pos = { x: this.mouse.x, y: this.mouse.y };
    this.ringPos = { x: this.mouse.x, y: this.mouse.y };

    this.activeMagnet = null;
    this.state = 'default';

    this.initEvents();
    this.initMagnetic();
  }

  initEvents() {
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('pointerdown', () => {
      if (this.ringEl) this.ringEl.classList.add('cursor-pressed');
    });

    document.addEventListener('pointerup', () => {
      if (this.ringEl) this.ringEl.classList.remove('cursor-pressed');
    });
  }

  initMagnetic() {
    const magnetics = document.querySelectorAll('[data-magnetic]');
    magnetics.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        this.activeMagnet = el;
        this.setState('hover', el.getAttribute('data-cursor-label') || '');
      });

      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        gsap.to(el, { x: deltaX, y: deltaY, duration: 0.3, ease: 'power2.out' });
      });

      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        this.activeMagnet = null;
        this.setState('default');
      });
    });
  }

  setState(state, label = '') {
    this.state = state;
    if (!this.ringEl) return;

    this.ringEl.className = 'cursor-ring';
    if (state !== 'default') {
      this.ringEl.classList.add(`cursor-${state}`);
    }

    if (this.labelEl) {
      this.labelEl.textContent = label;
      this.labelEl.style.opacity = label ? '1' : '0';
    }
  }

  update() {
    // Smooth lerp for outer ring
    this.pos.x += (this.mouse.x - this.pos.x) * 0.9;
    this.pos.y += (this.mouse.y - this.pos.y) * 0.9;

    this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.22;
    this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.22;

    if (this.dotEl) {
      this.dotEl.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    }
    if (this.ringEl) {
      this.ringEl.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;
    }
  }
}
