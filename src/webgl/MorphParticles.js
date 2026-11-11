import * as THREE from 'three';
import { MorphParticleShader } from './Shaders.js';

export class MorphParticles {
  constructor(count = 24000) {
    this.count = count;
    this.shapes = [];
    this.currentShapeIndex = 0;
    this.targetShapeIndex = 1;
    this.localProgress = 0;

    this.initShapes();
    this.initMesh();
  }

  // Pre-generate mathematical shape topologies
  initShapes() {
    const N = this.count;

    // 1. SEED / BLOSSOM (Hollow Fibonacci Phyllotaxis Shell)
    const seed = new Float32Array(N * 3);
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < N; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / N);
      const petalWave = Math.sin(theta * 5.0) * Math.sin(phi * 3.0) * 0.45;
      const r = 2.8 + petalWave + (Math.random() - 0.5) * 0.22;
      seed[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      seed[i * 3 + 1] = r * Math.cos(phi) * 1.15;
      seed[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    this.shapes.push(seed);

    // 2. OPEN CRYSTALLINE BOOK (Mathematical pages + binding)
    const book = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const side = (i % 2 === 0 ? 1 : -1);
      const u = (i / N);
      const pageDist = Math.pow(Math.random(), 0.5) * 2.8;
      const angle = (Math.PI / 4) * (1 - Math.exp(-pageDist * 0.8)) * side;
      const height = (Math.random() - 0.5) * 3.6;
      const thickness = (Math.random() - 0.5) * 0.3;

      book[i * 3 + 0] = Math.sin(angle) * pageDist + thickness;
      book[i * 3 + 1] = height;
      book[i * 3 + 2] = -Math.cos(angle) * pageDist * 0.8;
    }
    this.shapes.push(book);

    // 3. CODE / NEURAL LATTICE (Matrix cube with flowing circuitry)
    const code = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const layer = Math.floor(Math.random() * 8) - 3.5;
      const x = (Math.random() - 0.5) * 5.0;
      const z = (Math.random() - 0.5) * 5.0;
      // Quantized stepped grid with cybernetic pulses
      code[i * 3 + 0] = Math.round(x * 4) / 4;
      code[i * 3 + 1] = layer * 0.5 + Math.sin(x * 3.0 + z * 3.0) * 0.25;
      code[i * 3 + 2] = Math.round(z * 4) / 4;
    }
    this.shapes.push(code);

    // 4. ACCELERATOR / DOUBLE TORUS (Competition orbital ring)
    const engine = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const ring = (i % 2 === 0 ? 0 : 1);
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 2.6; // Major radius
      const r = 0.65 + Math.sin(u * 6) * 0.15; // Minor radius with orbital ripples

      if (ring === 0) {
        engine[i * 3 + 0] = (R + r * Math.cos(v)) * Math.cos(u);
        engine[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
        engine[i * 3 + 2] = r * Math.sin(v);
      } else {
        // Interlocking orthogonal ring
        engine[i * 3 + 0] = (R + r * Math.cos(v)) * Math.cos(u);
        engine[i * 3 + 1] = r * Math.sin(v);
        engine[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
      }
    }
    this.shapes.push(engine);

    // 5. TROPHY / STELLATED ICOSAHEDRON (Masterwork)
    const trophy = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Golden spiral spike distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / N);
      const theta = 2 * Math.PI * i / goldenRatio;
      // 12 stellated spikes
      const spikeFactor = Math.pow(Math.abs(Math.sin(theta * 5) * Math.sin(phi * 4)), 3.0) * 2.5;
      const rad = 1.6 + spikeFactor;

      trophy[i * 3 + 0] = rad * Math.sin(phi) * Math.cos(theta);
      trophy[i * 3 + 1] = rad * Math.cos(phi) * 1.1;
      trophy[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
    }
    this.shapes.push(trophy);

    // 6. INFINITE PORTAL / NEBULA VORTEX (Future)
    const portal = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const turns = 8.0;
      const progress = i / N;
      const angle = progress * Math.PI * 2 * turns;
      const radius = 0.3 + Math.pow(progress, 0.7) * 4.2;
      const depth = (progress - 0.5) * 8.0;
      const jitter = (Math.random() - 0.5) * 0.4;

      portal[i * 3 + 0] = Math.cos(angle) * radius + jitter;
      portal[i * 3 + 1] = Math.sin(angle) * radius + jitter;
      portal[i * 3 + 2] = depth + jitter;
    }
    this.shapes.push(portal);
  }

  initMesh() {
    const N = this.count;
    this.geometry = new THREE.BufferGeometry();

    // Attributes
    const currentPositions = new Float32Array(this.shapes[0]);
    const targetPositions = new Float32Array(this.shapes[1]);
    const seeds = new Float32Array(N);
    const sizes = new Float32Array(N);
    const colors = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      seeds[i] = Math.random();
      sizes[i] = 0.8 + Math.random() * 1.8;

      // Base iridescent gradient colors
      const hue = (i / N) * 0.6 + 0.55; // Cyan to violet range
      const col = new THREE.Color().setHSL(hue % 1.0, 0.85, 0.65);
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    // Material
    this.material = new THREE.ShaderMaterial({
      vertexShader: MorphParticleShader.vertexShader,
      fragmentShader: MorphParticleShader.fragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector3(999, 999, 999) },
        uAccentColor: { value: new THREE.Color('#ff7a30') },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.frustumCulled = false;
  }

  // Update shape buffers when moving between chapter intervals
  setChapterTransition(fromIndex, toIndex, localProgress) {
    fromIndex = Math.max(0, Math.min(this.shapes.length - 1, fromIndex));
    toIndex = Math.max(0, Math.min(this.shapes.length - 1, toIndex));

    if (this.currentShapeIndex !== fromIndex || this.targetShapeIndex !== toIndex) {
      this.currentShapeIndex = fromIndex;
      this.targetShapeIndex = toIndex;

      const posAttr = this.geometry.attributes.position;
      const targetAttr = this.geometry.attributes.targetPosition;

      posAttr.copyArray(this.shapes[fromIndex]);
      targetAttr.copyArray(this.shapes[toIndex]);

      posAttr.needsUpdate = true;
      targetAttr.needsUpdate = true;
    }

    this.material.uniforms.uProgress.value = localProgress;
  }

  setAccentColor(colorHex) {
    this.material.uniforms.uAccentColor.value.set(colorHex);
  }

  setMouse(x, y, z) {
    this.material.uniforms.uMouse.value.set(x, y, z);
  }

  setPixelRatio(dpr) {
    this.material.uniforms.uPixelRatio.value = dpr;
  }

  update(delta, elapsed, reducedMotion = false) {
    this.material.uniforms.uTime.value = reducedMotion ? elapsed * 0.2 : elapsed;
    // Gentle spatial rotation
    const rotMult = reducedMotion ? 0.15 : 1.0;
    this.mesh.rotation.y = elapsed * 0.05 * rotMult;
    this.mesh.rotation.z = Math.sin(elapsed * 0.03 * rotMult) * 0.05;
  }
}
