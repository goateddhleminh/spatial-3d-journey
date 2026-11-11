import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { SkyShader, FilmGrainShader } from './Shaders.js';
import { CameraPath } from './CameraPath.js';
import { MorphParticles } from './MorphParticles.js';
import { Artifacts } from './Artifacts.js';
import { Constellation } from './Constellation.js';
import { Environment } from './Environment.js';
import { QualityManager } from './QualityManager.js';
import { chapters } from '../data/portfolioData.js';

export class World {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.mouse = { x: 0, y: 0, ndcX: 0, ndcY: 0 };
    this.scrollProgress = 0;
    this.currentChapterIndex = 0;
    this.lastDiscoveredCount = 0;

    // Pooled reusable math objects (zero loop allocations)
    this._pointerVec = new THREE.Vector3();
    this._pointerDir = new THREE.Vector3();
    this._pointerTarget = new THREE.Vector3();
    this._morphAnchor = new THREE.Vector3();
    this._localMouse = new THREE.Vector3();

    this.onHoverAchievement = null;
    this.onInspectAchievement = null;
    this.onConstellationChange = null;

    this.initScene();
    this.initSky();
    this.initLights();
    this.initSystems();
    this.initPostprocessing();
    this.initEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060810, 0.008);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 300);
    this.camera.position.set(0, 2, 12);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      alpha: false,
      stencil: false,
      depth: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.info.autoReset = false;

    this.container.appendChild(this.renderer.domElement);
  }

  initSky() {
    const skyGeo = new THREE.SphereGeometry(180, 32, 24);
    this.skyMaterial = new THREE.ShaderMaterial({
      vertexShader: SkyShader.vertexShader,
      fragmentShader: SkyShader.fragmentShader,
      uniforms: {
        uSkyTop: { value: new THREE.Vector3(...chapters[0].skyColors.top) },
        uSkyBottom: { value: new THREE.Vector3(...chapters[0].skyColors.bottom) },
        uSkyAccent: { value: new THREE.Vector3(...chapters[0].skyColors.accent) },
        uTime: { value: 0 }
      },
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.scene.add(this.skyMesh);
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(10, 20, 15);
    this.scene.add(this.dirLight);

    this.mouseLight = new THREE.PointLight(0x00f0ff, 2.2, 18, 1.5);
    this.mouseLight.position.set(0, 2, 8);
    this.scene.add(this.mouseLight);
  }

  initSystems() {
    this.cameraPath = new CameraPath(this.camera, this.reducedMotion);

    // Responsive particle density (24k desktop, 12k mobile)
    const particleCount = this.isMobile ? 12000 : 24000;
    this.particles = new MorphParticles(particleCount);
    this.scene.add(this.particles.mesh);

    this.environment = new Environment(this.scene, this.cameraPath.cameraSpline, this.isMobile);
    this.artifacts = new Artifacts(this.scene);
    this.constellation = new Constellation(this.scene);
  }

  initPostprocessing() {
    const renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.38,
      0.42,
      0.65
    );

    this.grainPass = new ShaderPass(FilmGrainShader);
    this.grainPass.uniforms.uAmount.value = this.reducedMotion ? 0.008 : 0.018;
    this.grainPass.uniforms.uVignette.value = 0.52;

    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.grainPass);
    this.composer.addPass(outputPass);

    this.quality = new QualityManager(this.renderer, { bloomPass: this.bloomPass });
  }

  initEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.bloomPass.setSize(this.width, this.height);

    if (this.particles) {
      this.particles.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    }
  }

  onPointerMove(e) {
    this.mouse.ndcX = (e.clientX / this.width) * 2 - 1;
    this.mouse.ndcY = -(e.clientY / this.height) * 2 + 1;

    this.cameraPath.setMouseParallax(this.mouse.ndcX, this.mouse.ndcY);
    this.artifacts.setMouse(this.mouse.ndcX, this.mouse.ndcY);

    // Zero-allocation unprojection for cursor light & particle repulsion
    this._pointerVec.set(this.mouse.ndcX, this.mouse.ndcY, 0.5).unproject(this.camera);
    this._pointerDir.copy(this._pointerVec).sub(this.camera.position).normalize();
    this._pointerTarget.copy(this.camera.position).addScaledVector(this._pointerDir, 8.5);

    this.mouseLight.position.lerp(this._pointerTarget, 0.2);

    // Convert world pointer into particles' local coordinate frame
    this._localMouse.copy(this._pointerTarget).sub(this.particles.mesh.position);
    this.particles.setMouse(this._localMouse.x, this._localMouse.y, this._localMouse.z);
  }

  onClick() {
    if (this.artifacts.hoveredItem && this.onInspectAchievement) {
      this.onInspectAchievement(this.artifacts.hoveredItem.data);
    }
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
    this.cameraPath.setScrollProgress(progress);

    const totalChapters = chapters.length;
    const scaledProg = progress * (totalChapters - 1);
    const fromIndex = Math.floor(scaledProg);
    const toIndex = Math.min(totalChapters - 1, fromIndex + 1);
    const localProgress = scaledProg - fromIndex;

    this.currentChapterIndex = fromIndex;
    const currentChapter = chapters[fromIndex];
    const nextChapter = chapters[toIndex];

    this.particles.setChapterTransition(fromIndex, toIndex, localProgress);
    this.particles.setAccentColor(currentChapter.color);

    const curTop = currentChapter.skyColors.top;
    const nextTop = nextChapter.skyColors.top;
    const curBot = currentChapter.skyColors.bottom;
    const nextBot = nextChapter.skyColors.bottom;
    const curAcc = currentChapter.skyColors.accent;
    const nextAcc = nextChapter.skyColors.accent;

    this.skyMaterial.uniforms.uSkyTop.value.set(
      THREE.MathUtils.lerp(curTop[0], nextTop[0], localProgress),
      THREE.MathUtils.lerp(curTop[1], nextTop[1], localProgress),
      THREE.MathUtils.lerp(curTop[2], nextTop[2], localProgress)
    );
    this.skyMaterial.uniforms.uSkyBottom.value.set(
      THREE.MathUtils.lerp(curBot[0], nextBot[0], localProgress),
      THREE.MathUtils.lerp(curBot[1], nextBot[1], localProgress),
      THREE.MathUtils.lerp(curBot[2], nextBot[2], localProgress)
    );
    this.skyMaterial.uniforms.uSkyAccent.value.set(
      THREE.MathUtils.lerp(curAcc[0], nextAcc[0], localProgress),
      THREE.MathUtils.lerp(curAcc[1], nextAcc[1], localProgress),
      THREE.MathUtils.lerp(curAcc[2], nextAcc[2], localProgress)
    );

    this.mouseLight.color.set(currentChapter.color);
  }

  inspectAchievement(achievementData) {
    const item = this.artifacts.items.find(i => i.data.id === achievementData.id);
    if (item) {
      item.group.userData.discovered = true;
      this.cameraPath.startInspection(item.group.position);
      this.syncConstellationState();
    }
  }

  exitInspection() {
    this.cameraPath.endInspection();
  }

  syncConstellationState() {
    const count = this.artifacts.getDiscoveredCount();
    if (count !== this.lastDiscoveredCount) {
      this.lastDiscoveredCount = count;
      this.constellation.updateDiscovery(count);
      if (this.onConstellationChange) {
        this.onConstellationChange(count);
      }
    }
  }

  checkProximityDiscovery() {
    // Auto-discover achievements when camera flies past them along the spline
    for (let i = 0; i < this.artifacts.items.length; i++) {
      const item = this.artifacts.items[i];
      if (!item.group.userData.discovered) {
        const dist = this.camera.position.distanceTo(item.group.position);
        if (dist < 18.0) {
          item.group.userData.discovered = true;
          this.syncConstellationState();
        }
      }
    }
  }

  render(delta, elapsed, now) {
    this.cameraPath.update(delta);

    // Keep sky dome centered on camera so horizon & stars surround infinitely
    this.skyMesh.position.copy(this.camera.position);

    // Anchor morphing particle sculpture asymmetrically away from text cards on desktop
    const clampedProg = Math.max(0.0001, Math.min(0.9999, this.cameraPath.progress));
    this.cameraPath.lookAtSpline.getPointAt(clampedProg, this._morphAnchor);
    if (!this.isMobile && this.currentChapterIndex < chapters.length - 1) {
      const offsetX = this.currentChapterIndex % 2 === 0 ? 2.4 : -2.4;
      this._morphAnchor.x += offsetX;
    }
    this.particles.mesh.position.lerp(this._morphAnchor, 0.08);

    this.particles.update(delta, elapsed, this.reducedMotion);
    this.environment.update(delta, elapsed, this.reducedMotion);
    this.artifacts.update(delta, elapsed);
    this.constellation.update(delta, elapsed);

    this.checkProximityDiscovery();

    // Raycast hover check
    this.artifacts.checkRaycast(this.camera, (hoveredData) => {
      if (this.onHoverAchievement) {
        this.onHoverAchievement(hoveredData);
      }
      this.syncConstellationState();
    });

    this.skyMaterial.uniforms.uTime.value = elapsed;
    this.grainPass.uniforms.uTime.value = elapsed;

    this.renderer.info.reset();
    this.composer.render();
    this.quality.recordFrame(now);
  }
}
