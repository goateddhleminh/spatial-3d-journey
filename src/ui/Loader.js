import gsap from 'gsap';

export class Loader {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.loaderEl = document.getElementById('cinematic-loader');
    this.counterEl = document.getElementById('loader-counter');
    this.barEl = document.getElementById('loader-progress-bar');
    this.enterBtn = document.getElementById('loader-enter-btn');
    this.titleLines = document.querySelectorAll('.loader-reveal-text');

    this.progress = 0;
    this.isReady = false;
    this.isDismissed = false;
    this.startLoading();
  }

  startLoading() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('skip') === '1') {
      if (this.loaderEl) this.loaderEl.style.display = 'none';
      if (this.onComplete) this.onComplete();
      return;
    }

    const counterObj = { val: 0 };

    gsap.to(counterObj, {
      val: 100,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        const p = Math.round(counterObj.val);
        this.progress = p;
        if (this.counterEl) this.counterEl.textContent = `${p}%`;
        if (this.barEl) this.barEl.style.width = `${p}%`;
      },
      onComplete: () => {
        this.isReady = true;
        this.revealEnterButton();
      }
    });
  }

  revealEnterButton() {
    if (!this.enterBtn) {
      this.dismiss();
      return;
    }

    gsap.to(this.enterBtn, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      pointerEvents: 'auto'
    });

    this.enterBtn.addEventListener('click', () => this.dismiss());
    this._onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.isReady && !this.isDismissed) {
        e.preventDefault();
        this.dismiss();
      }
    };
    window.addEventListener('keydown', this._onKey);
  }

  dismiss() {
    if (this.isDismissed) return;
    this.isDismissed = true;
    if (this._onKey) window.removeEventListener('keydown', this._onKey);

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.loaderEl) this.loaderEl.style.display = 'none';
        if (this.onComplete) this.onComplete();
      }
    });

    tl.to(this.titleLines, {
      y: -60,
      opacity: 0,
      stagger: 0.08,
      duration: 0.55,
      ease: 'power3.in'
    })
    .to(this.loaderEl, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut'
    }, '-=0.2');
  }
}
