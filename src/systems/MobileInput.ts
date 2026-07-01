export interface MobileInputState {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  interacting: boolean;
}

export class MobileInput {
  private joystickContainer: HTMLDivElement | null = null;
  private joystickKnob: HTMLDivElement | null = null;
  private active = false;
  private touchId: number | null = null;
  private joystickX = 0;
  private joystickY = 0;
  private lookTouchId: number | null = null;
  private prevLookX = 0;
  private prevLookY = 0;
  private lookDeltaX = 0;
  private lookDeltaY = 0;
  private attached = false;

  private state: MobileInputState = { moveX: 0, moveY: 0, lookX: 0, lookY: 0, interacting: false };

  init(): void {
    this.createJoystick();
  }

  attach(_container: HTMLElement): void {
    if (this.attached) return;
    this.attached = true;
    document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
  }

  detach(): void {
    this.attached = false;
  }

  getState(): MobileInputState {
    return this.state;
  }

  private createJoystick(): void {
    this.joystickContainer = document.createElement('div');
    this.joystickContainer.id = 'joystick-container';
    this.joystickContainer.style.cssText = `
      position: fixed; bottom: 40px; left: 40px; width: 120px; height: 120px;
      border-radius: 50%; background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3); display: none;
      touch-action: none; z-index: 1000;
    `;
    this.joystickKnob = document.createElement('div');
    this.joystickKnob.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 50px; height: 50px; border-radius: 50%;
      background: rgba(255,255,255,0.4); pointer-events: none;
    `;
    this.joystickContainer.appendChild(this.joystickKnob);
    document.body.appendChild(this.joystickContainer);
  }

  show(): void {
    if (this.joystickContainer) this.joystickContainer.style.display = 'block';
  }

  hide(): void {
    if (this.joystickContainer) this.joystickContainer.style.display = 'none';
  }

  resetLookDelta(): void {
    this.state.lookX = 0;
    this.state.lookY = 0;
  }

  private onTouchStart(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (this.touchId === null && this.joystickContainer) {
        const rect = this.joystickContainer.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          this.active = true;
          this.touchId = touch.identifier;
          this.updateJoystick(touch.clientX, touch.clientY);
          continue;
        }
      }

      if (this.lookTouchId === null) {
        this.lookTouchId = touch.identifier;
        this.prevLookX = touch.clientX;
        this.prevLookY = touch.clientY;
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
      }
    }
  }

  private onTouchMove(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.touchId && this.active) {
        this.updateJoystick(touch.clientX, touch.clientY);
      }

      if (touch.identifier === this.lookTouchId) {
        this.lookDeltaX = touch.clientX - this.prevLookX;
        this.lookDeltaY = touch.clientY - this.prevLookY;
        this.prevLookX = touch.clientX;
        this.prevLookY = touch.clientY;
        this.state.lookX = this.lookDeltaX * 0.004;
        this.state.lookY = this.lookDeltaY * 0.004;
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.active = false;
        this.touchId = null;
        this.joystickX = 0;
        this.joystickY = 0;
        if (this.joystickKnob) {
          this.joystickKnob.style.transform = 'translate(-50%,-50%)';
        }
      }
      if (e.changedTouches[i].identifier === this.lookTouchId) {
        this.lookTouchId = null;
        this.state.lookX = 0;
        this.state.lookY = 0;
      }
    }
  }

  private updateJoystick(clientX: number, clientY: number): void {
    if (!this.joystickContainer) return;
    const rect = this.joystickContainer.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxDist = rect.width / 2 - 25;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    this.joystickX = dx / maxDist;
    this.joystickY = -dy / maxDist;
    this.state.moveX = this.joystickX;
    this.state.moveY = this.joystickY;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  }

  getAxis(): { x: number; y: number } {
    return { x: this.joystickX, y: this.joystickY };
  }
}
