import * as THREE from 'three';

export interface PlayerConfig {
  height: number;
  speed: number;
  sprintSpeed: number;
  acceleration: number;
  deceleration: number;
  jumpEnabled: boolean;
  jumpForce: number;
  sensitivity: number;
}

const DEFAULT_CONFIG: PlayerConfig = {
  height: 1.72,
  speed: 3.5,
  sprintSpeed: 5.5,
  acceleration: 12,
  deceleration: 10,
  jumpEnabled: false,
  jumpForce: 5,
  sensitivity: 0.002,
};

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private config: PlayerConfig;
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private keys = { forward: false, backward: false, left: false, right: false, sprint: false, jump: false };
  private isLocked = false;
  private active = false;
  private verticalVelocity = 0;
  private onGround = true;
  private lockJustReleased = false;

  constructor(camera: THREE.PerspectiveCamera, config?: Partial<PlayerConfig>) {
    this.camera = camera;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.euler.setFromQuaternion(this.camera.quaternion);
  }

  activate(): void {
    this.active = true;
    this.euler.setFromQuaternion(this.camera.quaternion);
  }

  deactivate(): void {
    this.active = false;
    this.velocity.set(0, 0, 0);
  }

  isActive(): boolean {
    return this.active;
  }

  isPointerLocked(): boolean {
    return this.isLocked;
  }

  requestPointerLock(element: HTMLElement): void {
    if (!this.active || this.isLocked || this.lockJustReleased) return;
    element.requestPointerLock();
  }

  onPointerLockChange(locked: boolean): void {
    this.isLocked = locked;
    if (locked) {
      this.euler.setFromQuaternion(this.camera.quaternion);
    } else {
      this.lockJustReleased = true;
      setTimeout(() => { this.lockJustReleased = false; }, 150);
    }
  }

  onMouseMove(dx: number, dy: number): void {
    if (!this.isLocked || !this.active) return;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= dx * this.config.sensitivity;
    this.euler.x -= dy * this.config.sensitivity;
    this.euler.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  setKey(key: string, pressed: boolean): void {
    switch (key) {
      case 'KeyW': this.keys.forward = pressed; break;
      case 'KeyS': this.keys.backward = pressed; break;
      case 'KeyA': this.keys.left = pressed; break;
      case 'KeyD': this.keys.right = pressed; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = pressed; break;
      case 'Space': this.keys.jump = pressed; break;
    }
  }

  resetVelocity(): void {
    this.velocity.set(0, 0, 0);
  }

  resetKeys(): void {
    this.keys = { forward: false, backward: false, left: false, right: false, sprint: false, jump: false };
  }

  getMovementVector(): THREE.Vector3 {
    return this.direction.clone();
  }

  getPosition(): THREE.Vector3 {
    return this.camera.position;
  }

  setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  getSensitivity(): number {
    return this.config.sensitivity;
  }

  setSensitivity(s: number): void {
    this.config.sensitivity = s;
  }

  update(delta: number): void {
    if (!this.active) return;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.add(forward);
    if (this.keys.backward) moveDir.sub(forward);
    if (this.keys.left) moveDir.sub(right);
    if (this.keys.right) moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    const targetSpeed = this.keys.sprint ? this.config.sprintSpeed : this.config.speed;
    const targetVel = moveDir.multiplyScalar(targetSpeed);

    const accel = targetVel.lengthSq() > 0 ? this.config.acceleration : this.config.deceleration;
    this.velocity.x += (targetVel.x - this.velocity.x) * Math.min(1, accel * delta);
    this.velocity.z += (targetVel.z - this.velocity.z) * Math.min(1, accel * delta);

    if (this.config.jumpEnabled && this.keys.jump && this.onGround) {
      this.verticalVelocity = this.config.jumpForce;
      this.onGround = false;
    }

    if (this.config.jumpEnabled) {
      this.verticalVelocity -= 9.8 * delta;
      this.velocity.y = this.verticalVelocity;
      if (this.camera.position.y <= this.config.height) {
        this.camera.position.y = this.config.height;
        this.verticalVelocity = 0;
        this.onGround = true;
      }
    }

    const dx = this.velocity.x * delta;
    const dz = this.velocity.z * delta;
    const dy = this.velocity.y * delta;

    this.camera.position.x += dx;
    this.camera.position.y += dy;
    this.camera.position.z += dz;

    this.direction.copy(moveDir);
  }
}
