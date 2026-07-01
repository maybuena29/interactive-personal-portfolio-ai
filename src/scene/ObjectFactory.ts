import * as THREE from 'three';
import type { WorldObject } from '../types';
import { ModelLoader } from '../loaders/ModelLoader';
import '../voxel';
import { getVoxelBuilder, hasVoxelBuilder } from '../voxel/VoxelBuilder';
import { buildRoom } from '../voxel/RoomBuilder';

const COLORS: Record<string, number> = {
  environment: 0x666666,
  information: 0x4488ff,
  monitor: 0x222233,
  prop: 0x886644,
  furniture: 0x8B7355,
  timeline: 0x44aa88,
  skills: 0xaa66cc,
  architecture: 0x66aaff,
  terminal: 0x33ff33,
  education: 0xffcc44,
  achievement: 0xffaa00,
  future: 0x88ddff,
  assistant: 0x66ffcc,
};

const SHAPES: Record<string, 'box' | 'sphere' | 'cylinder' | 'torus'> = {
  environment: 'box',
  information: 'cylinder',
  monitor: 'box',
  prop: 'sphere',
  furniture: 'box',
  timeline: 'box',
  skills: 'box',
  architecture: 'torus',
  terminal: 'box',
  education: 'cylinder',
  achievement: 'cylinder',
  future: 'sphere',
  assistant: 'torus',
};

export class ObjectFactory {
  private areaOffsets: Record<string, { x: number; z: number }> = {
    entrance: { x: 0, z: 0 },
    workspace: { x: 3, z: 0 },
    library: { x: -3, z: 2 },
    'architecture-zone': { x: 3, z: -2 },
    'certificate-wall': { x: -3, z: -2 },
    'window-area': { x: 0, z: -3 },
    'secret-lab': { x: 0, z: 4 },
  };
  private modelLoader: ModelLoader;

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  buildRoomScene(): THREE.Group {
    return buildRoom();
  }

  async createObject(objDef: WorldObject): Promise<THREE.Object3D> {
    let group: THREE.Object3D | null = null;

    if (hasVoxelBuilder(objDef.id)) {
      const builder = getVoxelBuilder(objDef.id)!;
      group = builder(objDef);
    } else {
      const modelPath = objDef.model;
      if (modelPath) {
        const loaded = await this.modelLoader.loadModel(modelPath);
        if (loaded) {
          group = loaded;
        }
      }
    }

    if (!group) {
      group = this.createPlaceholderMesh(objDef);
    }

    this.applyTransform(objDef, group);
    this.applyMetadata(objDef, group);

    return group;
  }

  private applyTransform(objDef: WorldObject, obj: THREE.Object3D): void {
    if (objDef.position) {
      obj.position.set(objDef.position.x, objDef.position.y, objDef.position.z);
      if (objDef.rotation) {
        obj.rotation.set(
          objDef.rotation.x * Math.PI / 180,
          objDef.rotation.y * Math.PI / 180,
          objDef.rotation.z * Math.PI / 180
        );
      }
      if (objDef.scale) obj.scale.setScalar(objDef.scale);
    } else {
      const offset = this.areaOffsets[objDef.area] || { x: 0, z: 0 };
      obj.position.set(
        offset.x + (Math.random() - 0.5) * 2,
        0.5,
        offset.z + (Math.random() - 0.5) * 2
      );
    }
  }

  private applyMetadata(objDef: WorldObject, obj: THREE.Object3D): void {
    obj.name = objDef.id;
    obj.userData.interactable = objDef.interactable;
    obj.userData.objectId = objDef.id;
    obj.userData.objectName = objDef.name || objDef.id;
    obj.userData.interaction = objDef.interaction || null;
    if (objDef.collidable !== undefined) {
      obj.userData.collidable = objDef.collidable;
    }
    if (objDef.cameraFocus) {
      obj.userData.cameraFocus = objDef.cameraFocus;
    }

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  private createPlaceholderMesh(objDef: WorldObject): THREE.Mesh {
    const color = COLORS[objDef.category] || 0x999999;
    const shape = SHAPES[objDef.category] || 'box';
    const size = objDef.category === 'monitor' ? 0.8 : 0.5;

    let geometry: THREE.BufferGeometry;
    switch (shape) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(size * 0.5, 8, 6);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 0.8, 8);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(size * 0.3, size * 0.15, 8, 12);
        break;
      default:
        geometry = new THREE.BoxGeometry(size, size * 0.8, size * 0.6);
    }

    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  buildEnvironment(scene: THREE.Scene): THREE.Group {
    const room = this.buildRoomScene();
    scene.add(room);
    return room;
  }
}
