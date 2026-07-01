import * as THREE from 'three';
import { ConfigLoader } from '../loaders/ConfigLoader';
import { ModelLoader } from '../loaders/ModelLoader';
import { ObjectFactory } from './ObjectFactory';
import type { WorldMap, WorldObject } from '../types';

export class SceneManager {
  private scene: THREE.Scene;
  private configLoader: ConfigLoader;
  private modelLoader: ModelLoader;
  private objectFactory: ObjectFactory;
  private loadedObjects: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene, configLoader: ConfigLoader, modelLoader: ModelLoader) {
    this.scene = scene;
    this.configLoader = configLoader;
    this.modelLoader = modelLoader;
    this.objectFactory = new ObjectFactory(modelLoader);
  }

  async buildScene(worldMap: WorldMap): Promise<void> {
    const objects = await this.configLoader.loadObjects();
    const objectsById = new Map(objects.map(o => [o.id, o]));

    const modelPaths = objects
      .filter(o => o.model)
      .map(o => o.model);
    this.modelLoader.queueAll(modelPaths);

    for (const area of worldMap.areas) {
      for (const objId of area.objects) {
        const objDef = objectsById.get(objId);
        if (!objDef) {
          console.warn(`Object "${objId}" referenced in area "${area.id}" not found in objects.json`);
          continue;
        }
        await this.placeObject(objDef);
      }
    }

    this.objectFactory.buildEnvironment(this.scene);
  }

  private async placeObject(objDef: WorldObject): Promise<void> {
    const obj = await this.objectFactory.createObject(objDef);
    this.scene.add(obj);
    this.loadedObjects.set(objDef.id, obj);
  }

  getObjectById(id: string): THREE.Object3D | undefined {
    return this.loadedObjects.get(id);
  }

  getAllInteractables(): THREE.Object3D[] {
    const result: THREE.Object3D[] = [];
    for (const obj of this.loadedObjects.values()) {
      if (obj.userData.interactable) result.push(obj);
    }
    return result;
  }
}
