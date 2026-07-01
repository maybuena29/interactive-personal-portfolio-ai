import gsap from 'gsap';

export type LoadingCategory = 'config' | 'models' | 'hdr' | 'audio' | 'textures';

export class LoadingScreen {
  private overlay: HTMLDivElement;
  private bar: HTMLDivElement;
  private label: HTMLDivElement;
  private subtitle: HTMLDivElement;
  private categories: Record<LoadingCategory, { loaded: number; total: number }> = {
    config: { loaded: 0, total: 0 },
    models: { loaded: 0, total: 0 },
    hdr: { loaded: 0, total: 0 },
    audio: { loaded: 0, total: 0 },
    textures: { loaded: 0, total: 0 },
  };
  private complete = false;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-screen';
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #0a0a0f; z-index: 9999; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
      font-family: 'Courier New', monospace; color: #33ff33;
    `;

    this.subtitle = document.createElement('div');
    this.subtitle.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 24px;';
    this.subtitle.textContent = 'Loading environment...';

    this.overlay.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 8px;">ZXC Dev's Workspace</div>
    `;
    this.overlay.appendChild(this.subtitle);

    const barOuter = document.createElement('div');
    barOuter.style.cssText = `
      width: 280px; height: 4px; background: #1a1a2e;
      border-radius: 2px; overflow: hidden;
    `;
    this.bar = document.createElement('div');
    this.bar.style.cssText = `
      width: 0%; height: 100%; background: #33ff33;
      border-radius: 2px; transition: width 0.3s ease;
    `;
    barOuter.appendChild(this.bar);
    this.overlay.appendChild(barOuter);

    this.label = document.createElement('div');
    this.label.style.cssText = 'font-size: 11px; color: #888; margin-top: 12px;';
    this.label.textContent = 'Initializing...';
    this.overlay.appendChild(this.label);

    document.body.appendChild(this.overlay);
  }

  setCategoryTotal(category: LoadingCategory, total: number): void {
    this.categories[category].total = Math.max(this.categories[category].total, total);
  }

  reportProgress(category: LoadingCategory, loaded: number, label: string): void {
    this.categories[category].loaded = loaded;
    this.label.textContent = label;
    this.updateBar();
  }

  reportBatchProgress(category: LoadingCategory, loaded: number, total: number, label: string): void {
    this.categories[category].total = Math.max(this.categories[category].total, total);
    this.categories[category].loaded = loaded;
    this.label.textContent = label;
    this.updateBar();
  }

  setSubtitle(text: string): void {
    this.subtitle.textContent = text;
  }

  markComplete(): void {
    const cats = Object.keys(this.categories) as LoadingCategory[];
    for (const cat of cats) {
      this.categories[cat].loaded = this.categories[cat].total;
    }
    this.updateBar();

    gsap.to(this.bar, {
      width: '100%',
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        this.label.textContent = 'Ready';
        gsap.delayedCall(0.3, () => {
          this.complete = true;
          gsap.to(this.overlay, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              this.overlay.remove();
            },
          });
        });
      },
    });
  }

  private updateBar(): void {
    const catList = Object.values(this.categories);
    const totalNum = catList.reduce((s, c) => s + Math.max(c.total, 1), 0);
    const loadedNum = catList.reduce((s, c) => s + c.loaded, 0);
    const pct = Math.min(100, Math.round((loadedNum / totalNum) * 100));
    this.bar.style.width = `${pct}%`;

    if (pct >= 100 && !this.complete) {
      this.label.textContent = 'Ready';
    }
  }
}
