import * as THREE from 'three';
import { chapters } from '../data/portfolioData.js';
import { FresnelShader } from './Shaders.js';

export class Environment {
  constructor(scene, cameraSpline, isMobile = false) {
    this.scene = scene;
    this.cameraSpline = cameraSpline;
    this.isMobile = isMobile;

    this.landmarks = [];
    this.portalRings = [];

    this.initInstancedStarfield();
    this.initChapterLandmarks();
    this.initFuturePortal();
  }

  initInstancedStarfield() {
    const count = this.isMobile ? 1200 : 2500;
    const geo = new THREE.OctahedronGeometry(0.06, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });

    this.starInstanced = new THREE.InstancedMesh(geo, mat, count);
    this.starInstanced.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Sample along spline and offset radially to create a 3D cosmic tunnel
      const t = Math.random();
      const pt = this.cameraSpline.getPointAt(t);

      const angle = Math.random() * Math.PI * 2;
      const radius = 5.5 + Math.random() * 26.0;
      const zJitter = (Math.random() - 0.5) * 35.0;

      dummy.position.set(
        pt.x + Math.cos(angle) * radius,
        pt.y + Math.sin(angle) * radius,
        pt.z + zJitter
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const scale = 0.4 + Math.random() * 1.8;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      this.starInstanced.setMatrixAt(i, dummy.matrix);

      // Tint near corresponding chapter color
      const chapIdx = Math.min(chapters.length - 1, Math.floor(t * chapters.length));
      color.set(chapters[chapIdx].color).lerp(new THREE.Color('#ffffff'), 0.45);
      this.starInstanced.setColorAt(i, color);
    }

    this.starInstanced.instanceMatrix.needsUpdate = true;
    if (this.starInstanced.instanceColor) {
      this.starInstanced.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.starInstanced);
  }

  initChapterLandmarks() {
    // Subtle orbital framing rings at each chapter lookAt waypoint
    chapters.forEach((chapter, idx) => {
      if (idx === chapters.length - 1) return; // Last chapter uses the Future Portal

      const group = new THREE.Group();
      group.position.set(chapter.lookAtPoint.x, chapter.lookAtPoint.y, chapter.lookAtPoint.z);

      const accent = new THREE.Color(chapter.color);

      // Outer structural ring
      const outerGeo = new THREE.TorusGeometry(4.2, 0.018, 12, 96);
      const outerMat = new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const outerRing = new THREE.Mesh(outerGeo, outerMat);
      outerRing.rotation.x = Math.PI * 0.42;

      // Inner tilted ring
      const innerGeo = new THREE.TorusGeometry(3.5, 0.012, 12, 72);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending
      });
      const innerRing = new THREE.Mesh(innerGeo, innerMat);
      innerRing.rotation.y = Math.PI * 0.25;

      group.add(outerRing);
      group.add(innerRing);
      this.scene.add(group);

      this.landmarks.push({ group, outerRing, innerRing, seed: idx * 1.3 });
    });
  }

  initFuturePortal() {
    const finalChap = chapters[chapters.length - 1];
    const portalGroup = new THREE.Group();
    portalGroup.position.set(
      finalChap.lookAtPoint.x,
      finalChap.lookAtPoint.y,
      finalChap.lookAtPoint.z
    );

    const accent = new THREE.Color(finalChap.color);

    // 3 Counter-rotating portal rings
    const radii = [5.2, 4.1, 3.0];
    radii.forEach((r, i) => {
      const geo = new THREE.TorusGeometry(r, 0.035 - i * 0.005, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xffffff : accent,
        transparent: true,
        opacity: 0.55 - i * 0.1,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = i * 0.35;
      ring.rotation.y = i * 0.5;
      portalGroup.add(ring);
      this.portalRings.push(ring);
    });

    // Iridescent Fresnel singularity core inside the portal
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 3);
    this.portalCoreMat = new THREE.ShaderMaterial({
      vertexShader: FresnelShader.vertexShader,
      fragmentShader: FresnelShader.fragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Color('#040814') },
        uRimColor: { value: accent },
        uFresnelPower: { value: 2.2 },
        uHoverGlow: { value: 0.6 },
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    this.portalCore = new THREE.Mesh(coreGeo, this.portalCoreMat);
    portalGroup.add(this.portalCore);

    this.scene.add(portalGroup);
  }

  update(delta, elapsed, reducedMotion = false) {
    const speedMult = reducedMotion ? 0.15 : 1.0;

    this.landmarks.forEach((lm) => {
      lm.outerRing.rotation.z = elapsed * 0.15 * speedMult + lm.seed;
      lm.innerRing.rotation.x = elapsed * 0.22 * speedMult + lm.seed;
    });

    this.portalRings.forEach((ring, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      ring.rotation.z += delta * (0.25 + idx * 0.1) * dir * speedMult;
      ring.rotation.x += delta * 0.12 * dir * speedMult;
    });

    if (this.portalCore && this.portalCoreMat) {
      this.portalCoreMat.uniforms.uTime.value = elapsed;
      this.portalCore.rotation.y = elapsed * 0.3 * speedMult;
    }
  }
}
