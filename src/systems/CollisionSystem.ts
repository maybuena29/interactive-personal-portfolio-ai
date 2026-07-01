import * as THREE from 'three';

export interface Collider {
  mesh: THREE.Object3D;
  box: THREE.Box3;
}

export class CollisionSystem {
  private colliders: Collider[] = [];
  private initialized = false;

  init(scene: THREE.Scene): void {
    this.colliders = [];

    scene.traverse((child) => {
      if (child.userData?.collidable) {
        const box = new THREE.Box3();
        child.updateWorldMatrix(true, false);
        box.setFromObject(child);
        if (box.min.x === Infinity) return;
        this.colliders.push({ mesh: child, box });
      }
    });

    this.initialized = true;
  }

  updateColliderBoxes(): void {
    for (const c of this.colliders) {
      c.mesh.updateWorldMatrix(true, false);
      c.box.setFromObject(c.mesh);
    }
  }

  checkCollision(
    position: THREE.Vector3,
    radius: number,
    height: number
  ): { collided: boolean; pushX: number; pushZ: number } {
    let pushX = 0;
    let pushZ = 0;
    let collided = false;

    const playerMin = new THREE.Vector3(
      position.x - radius,
      position.y,
      position.z - radius
    );
    const playerMax = new THREE.Vector3(
      position.x + radius,
      position.y + height,
      position.z + radius
    );

    for (const c of this.colliders) {
      if (playerMin.x > c.box.max.x || playerMax.x < c.box.min.x) continue;
      if (playerMin.z > c.box.max.z || playerMax.z < c.box.min.z) continue;
      if (playerMin.y > c.box.max.y || playerMax.y < c.box.min.y) continue;

      collided = true;

      const overlapX = Math.min(playerMax.x - c.box.min.x, c.box.max.x - playerMin.x);
      const overlapZ = Math.min(playerMax.z - c.box.min.z, c.box.max.z - playerMin.z);

      if (overlapX < overlapZ) {
        const centerX = (playerMin.x + playerMax.x) / 2;
        const boxCenterX = (c.box.min.x + c.box.max.x) / 2;
        pushX = centerX > boxCenterX ? overlapX : -overlapX;
      } else {
        const centerZ = (playerMin.z + playerMax.z) / 2;
        const boxCenterZ = (c.box.min.z + c.box.max.z) / 2;
        pushZ = centerZ > boxCenterZ ? overlapZ : -overlapZ;
      }
    }

    return { collided, pushX, pushZ };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getColliders(): Collider[] {
    return this.colliders;
  }
}
