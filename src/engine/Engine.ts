import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConfigLoader } from '../loaders/ConfigLoader';
import { ModelLoader } from '../loaders/ModelLoader';
import { EnvironmentLoader } from '../loaders/EnvironmentLoader';
import { SceneManager } from '../scene/SceneManager';
import { LightingSystem } from '../systems/LightingSystem';
import { EnvironmentManager } from '../systems/EnvironmentManager';
import { InteractionSystem } from '../systems/InteractionSystem';
import { DataLoader } from '../loaders/DataLoader';
import { AIEngine } from '../systems/AIEngine';
import { UIManager } from '../ui/UIManager';
import { AudioManager } from '../audio/AudioManager';
import { MobileInput } from '../systems/MobileInput';
import { AnimationManager } from '../animations';
import { PostProcessingSystem } from '../systems/PostProcessingSystem';
import { LoadingScreen } from '../ui/LoadingScreen';
import { PlayerController } from '../systems/PlayerController';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { AreaSystem } from '../systems/AreaSystem';
import { UnlockSystem } from '../systems/UnlockSystem';
import { InteractionPhase } from '../interactions/InteractionStateMachine';
import type { Settings, SceneConfig } from '../types';

type ControlMode = 'orbit' | 'fps';

enum CameraOwner {
  PLAYER = 'player',
  ORBIT = 'orbit',
  INTERACTION = 'interaction',
}

export class Engine {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  public configLoader: ConfigLoader;
  public dataLoader: DataLoader;
  public modelLoader: ModelLoader;
  public envLoader: EnvironmentLoader;
  public sceneManager: SceneManager;
  public lightingSystem: LightingSystem;
  public environmentManager: EnvironmentManager;
  public interactionSystem: InteractionSystem;
  public aiEngine: AIEngine;
  public uiManager: UIManager;
  public audioManager: AudioManager;
  public mobileInput: MobileInput;
  public animationManager: AnimationManager;
  public postProcessing: PostProcessingSystem;
  public loadingScreen: LoadingScreen;
  public playerController: PlayerController;
  public collisionSystem: CollisionSystem;
  public spawnSystem: SpawnSystem;
  public areaSystem: AreaSystem;
  public unlockSystem: UnlockSystem;

  public settings!: Settings;
  public sceneConfig!: SceneConfig;
  public isMobile = false;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Clock();
  private controlMode: ControlMode = 'orbit';
  private cameraOwner: CameraOwner = CameraOwner.ORBIT;
  private interactionPointer = new THREE.Vector2();

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.72, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2.1;

    this.configLoader = new ConfigLoader();
    this.dataLoader = new DataLoader(this.configLoader);
    this.modelLoader = new ModelLoader();
    this.envLoader = new EnvironmentLoader(this.renderer);
    this.sceneManager = new SceneManager(this.scene, this.configLoader, this.modelLoader);
    this.lightingSystem = new LightingSystem(this.scene, this.configLoader);
    this.environmentManager = new EnvironmentManager(this.scene, this.lightingSystem, this.configLoader);
    this.interactionSystem = new InteractionSystem(this.scene, this.camera, this.raycaster, this.interactionPointer);
    this.aiEngine = new AIEngine(this.dataLoader, this.configLoader);
    this.animationManager = new AnimationManager();
    this.playerController = new PlayerController(this.camera);
    this.collisionSystem = new CollisionSystem();
    this.spawnSystem = new SpawnSystem();
    this.audioManager = new AudioManager(this.configLoader);
    this.unlockSystem = new UnlockSystem();
    this.areaSystem = new AreaSystem(this.configLoader, this.lightingSystem, this.audioManager, this.unlockSystem);
    this.uiManager = new UIManager(this.aiEngine, this.interactionSystem, this.configLoader, this.animationManager);
    this.mobileInput = new MobileInput();
    this.postProcessing = new PostProcessingSystem();
    this.loadingScreen = new LoadingScreen();
  }

  async init(): Promise<void> {
    try {
      await this.initInternal();
    } catch (err) {
      console.error('Engine.init: uncaught error, completing loading screen anyway', err);
    }
    this.loadingScreen.markComplete();
    this.animate();
  }

  private async initInternal(): Promise<void> {
    this.loadingScreen.reportProgress('config', 0, 'Loading settings...');
    this.settings = await this.configLoader.loadSettings();
    this.sceneConfig = await this.configLoader.loadSceneConfig();
    this.loadingScreen.setCategoryTotal('config', 4);
    this.loadingScreen.reportProgress('config', 1, 'Loading world map...');

    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.camera.fov = this.sceneConfig.camera.defaultFov;
    this.camera.near = this.sceneConfig.camera.near;
    this.camera.far = this.sceneConfig.camera.far;
    this.camera.updateProjectionMatrix();
    this.renderer.toneMappingExposure = 1.0;

    this.loadingScreen.reportProgress('config', 2, 'Initializing lighting...');
    await this.lightingSystem.init();

    this.loadingScreen.reportProgress('config', 3, 'Loading environment config...');
    await this.environmentManager.init(this.settings.environment.weather as any,
      this.sceneConfig.environment.timeRanges);

    const worldMap = await this.configLoader.loadWorldMap();
    this.loadingScreen.reportProgress('config', 4, 'Building scene...');
    await this.sceneManager.buildScene(worldMap);

    this.loadingScreen.reportProgress('config', 4, 'Applying lighting...');
    this.lightingSystem.applyPreset(worldMap.areas[0]?.lighting);
    this.environmentManager.startTimeUpdate(this.settings.environment.weather as any);
    this.environmentManager.onWeatherChange = (weather) => {
      if (weather === 'rain') {
        this.audioManager.playAmbient('ambient-rain');
      } else {
        this.audioManager.stopAllAmbient();
      }
    };

    this.loadingScreen.reportProgress('hdr', 0, 'Loading environment map...');
    const activePresetName = this.environmentManager.getCurrentPreset();
    const preset = this.sceneConfig.environment.presets[activePresetName];
    if (preset && preset.skybox) {
      this.loadingScreen.setCategoryTotal('hdr', 1);
      try {
        await this.envLoader.applyEnvironment(this.scene, preset.skybox);
      } catch (err) {
        console.warn('Engine: HDR load failed (non-fatal)', err);
      }
      this.loadingScreen.reportProgress('hdr', 1, 'Environment map loaded');
    } else {
      this.loadingScreen.setCategoryTotal('hdr', 1);
      this.loadingScreen.reportProgress('hdr', 1, 'No HDR configured');
    }

    this.modelLoader.setProgressCallback((loaded, total, label) => {
      this.loadingScreen.setCategoryTotal('models', total);
      this.loadingScreen.reportProgress('models', loaded, label);
    });

    this.loadingScreen.reportProgress('config', 4, 'Initializing systems...');
    await this.interactionSystem.init(worldMap);

    this.interactionSystem.setObjectAccessCheck((objectId: string) => {
      return this.areaSystem.isObjectAccessible(objectId);
    });

    this.interactionSystem.onUnlock((condition: string) => {
      this.unlockSystem.fulfillCondition(condition);
      const area = this.areaSystem.getAreas().find(a => a.unlockCondition === condition);
      const areaName = area?.name || condition;
      this.uiManager.showToast(`🔓 ${areaName} unlocked!`, 'unlock');
    });

    this.collisionSystem.init(this.scene);

    this.spawnSystem.init(worldMap.spawnPoints);
    this.spawnSystem.teleportToSpawn(this.camera, worldMap.spawnPoint);

    await this.areaSystem.init();
    this.areaSystem.getStartingAreaId();

    this.dataLoader.preloadAll();
    this.uiManager.init();
    this.interactionSystem.onInteractionEnd(() => {
      this.playerController.resetVelocity();
      this.playerController.resetKeys();
    });
    await this.audioManager.init();
    await this.audioManager.preload();
    if (this.settings.environment.weather === 'rain') {
      this.audioManager.playAmbient('ambient-rain');
    }

    const audioTracks = [...this.audioManager.getConfig()?.ambient ?? [], ...this.audioManager.getConfig()?.effects ?? []];
    this.loadingScreen.setCategoryTotal('audio', audioTracks.length);

    this.mobileInput.init();

    this.setControlMode();

    if (this.isMobile) {
      this.mobileInput.attach(this.renderer.domElement);
    }

    this.loadingScreen.reportProgress('config', 4, 'Setting up post-processing...');
    this.postProcessing.init(
      this.renderer,
      this.scene,
      this.camera,
      this.sceneConfig.postProcessing
    );

    const resumeAudio = () => {
      this.audioManager.resume();
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
    window.addEventListener('pointerdown', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true });

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });

    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private setControlMode(): void {
    if (this.isMobile) {
      this.controlMode = 'fps';
      this.cameraOwner = CameraOwner.PLAYER;
      this.controls.enabled = false;
      this.playerController.activate();
      this.uiManager.showCrosshair();
      this.mobileInput.show();
    } else {
      const desktopMode = this.settings.controls?.desktop || 'fps';
      this.controlMode = desktopMode === 'fps' ? 'fps' : 'orbit';

      if (this.controlMode === 'fps') {
        this.cameraOwner = CameraOwner.PLAYER;
        this.controls.enabled = false;
        this.playerController.activate();
        this.uiManager.showCrosshair();
      } else {
        this.cameraOwner = CameraOwner.ORBIT;
        this.controls.enabled = true;
        this.playerController.deactivate();
        this.uiManager.hideCrosshair();
      }
    }
  }

  private onPointerLockChange(): void {
    const locked = document.pointerLockElement === this.renderer.domElement;
    this.playerController.onPointerLockChange(locked);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.controlMode === 'fps' && this.playerController.isActive()) {
      this.playerController.setKey(e.code, true);
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (this.controlMode === 'fps' && this.playerController.isActive()) {
      this.playerController.setKey(e.code, false);
    }
  }

  private onMouseDown(_e: MouseEvent): void {
    if (this.controlMode !== 'fps') return;
    if (this.interactionSystem.stateMachine.getPhase() !== 'idle') return;
    if (!this.playerController.isPointerLocked()) {
      this.playerController.requestPointerLock(this.renderer.domElement);
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (!this.isMobile) return;
    if (e.touches.length === 1 && this.interactionSystem.stateMachine.getPhase() === 'idle') {
      this.interactionPointer.x = 0;
      this.interactionPointer.y = 0;
      setTimeout(() => {
        if (this.interactionSystem.hoveredObjectId) {
          this.interactionSystem.handleMobileTap();
        }
      }, 10);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    if (!this.settings || !this.sceneConfig) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.isMobile && this.controlMode === 'fps') {
      const mobileState = this.mobileInput.getState();
      if (this.playerController.isActive()) {
        const lookX = mobileState.lookX;
        const lookY = mobileState.lookY;
        if (lookX !== 0 || lookY !== 0) {
          const sensitivity = this.playerController.getSensitivity();
          this.playerController.onMouseMove(
            lookX / sensitivity,
            lookY / sensitivity
          );
        }

        const moveVec = new THREE.Vector3(mobileState.moveX, 0, mobileState.moveY);
        if (moveVec.lengthSq() > 0.1) {
          this.playerController.setKey('KeyW', moveVec.z > 0);
          this.playerController.setKey('KeyS', moveVec.z < 0);
          this.playerController.setKey('KeyA', moveVec.x < 0);
          this.playerController.setKey('KeyD', moveVec.x > 0);
        } else {
          this.playerController.setKey('KeyW', false);
          this.playerController.setKey('KeyS', false);
          this.playerController.setKey('KeyA', false);
          this.playerController.setKey('KeyD', false);
        }
      }
    }

    if (this.controlMode === 'orbit') {
      this.cameraOwner = CameraOwner.ORBIT;
    } else {
      const phase = this.interactionSystem.stateMachine.getPhase();
      this.cameraOwner = phase === InteractionPhase.IDLE || phase === InteractionPhase.HOVER
        ? CameraOwner.PLAYER
        : CameraOwner.INTERACTION;
    }

    switch (this.cameraOwner) {
      case CameraOwner.PLAYER: {
        const phase = this.interactionSystem.stateMachine.getPhase();
        if (phase === InteractionPhase.IDLE && this.playerController.isActive()) {
          this.playerController.update(delta);
          const pos = this.playerController.getPosition();
          const radius = 0.3;
          const height = this.sceneConfig.player?.height || 1.72;
          const result = this.collisionSystem.checkCollision(pos, radius, height);
          if (result.collided) {
            pos.x += result.pushX;
            pos.z += result.pushZ;
            this.playerController.setPosition(pos.x, pos.y, pos.z);
          }
        }
        this.uiManager.showCrosshair();
        if (phase === InteractionPhase.IDLE) {
          this.interactionPointer.set(0, 0);
        }
        this.controls.enabled = false;
        this.interactionSystem.update(delta);
        break;
      }
      case CameraOwner.ORBIT: {
        const controlsTarget = this.interactionSystem.getControlsTarget();
        this.controls.target.lerp(controlsTarget, 0.08);
        this.controls.enabled = this.interactionSystem.stateMachine.isOrbitEnabled();
        this.controls.update();
        this.interactionSystem.update(delta);
        break;
      }
      case CameraOwner.INTERACTION: {
        this.controls.enabled = false;
        this.interactionSystem.update(delta);
        break;
      }
    }

    this.areaSystem.update(this.camera.position, delta);
    this.lightingSystem.update(delta);
    this.environmentManager.update(delta);
    this.uiManager.update(delta);
    this.audioManager.update(this.camera.position, delta);

    if (this.postProcessing.isActive()) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.postProcessing.setSize(w, h);
  }

  private onPointerMove(e: PointerEvent): void {
    if (this.controlMode === 'fps' && this.playerController.isPointerLocked()) {
      this.playerController.onMouseMove(e.movementX, e.movementY);
      return;
    }
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (this.controlMode === 'orbit') {
      this.interactionPointer.x = this.pointer.x;
      this.interactionPointer.y = this.pointer.y;
    }
  }

  private onClick(e: PointerEvent): void {
    if (this.controlMode === 'fps') {
      if (this.playerController.isPointerLocked()) {
        this.interactionSystem.handleClick();
      }
      return;
    }

    if (this.isMobile) return;
    this.interactionPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.interactionPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.interactionSystem.handleClick();
  }
}
