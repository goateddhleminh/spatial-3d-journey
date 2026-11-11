import * as THREE from 'three';
import { chapters } from '../data/portfolioData.js';

export class CameraPath {
  constructor(camera, reducedMotion = false) {
    this.camera = camera;
    this.reducedMotion = reducedMotion;

    // Build CatmullRom splines from chapters data
    const camPoints = chapters.map(c => new THREE.Vector3(c.cameraPoint.x, c.cameraPoint.y, c.cameraPoint.z));
    const lookPoints = chapters.map(c => new THREE.Vector3(c.lookAtPoint.x, c.lookAtPoint.y, c.lookAtPoint.z));

    this.cameraSpline = new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.5);
    this.lookAtSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5);

    // Reusable pooled vectors (NO allocations in render loop)
    this.targetPos = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3(0, 1.5, 0);
    this.tangent = new THREE.Vector3();

    // Inspection mode override
    this.isInspecting = false;
    this.inspectCamPos = new THREE.Vector3();
    this.inspectLookAt = new THREE.Vector3();

    // State tracking
    this.progress = 0;
    this.targetProgress = 0;
    this.velocity = 0;
    this.dampedVelocity = 0;
    this.mouseParallax = { x: 0, y: 0 };
    this.targetMouseParallax = { x: 0, y: 0 };
  }

  setScrollProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }

  setMouseParallax(x, y) {
    this.targetMouseParallax.x = x;
    this.targetMouseParallax.y = y;
  }

  startInspection(targetPosition) {
    this.isInspecting = true;
    this.inspectLookAt.copy(targetPosition);
    this.inspectCamPos.set(
      targetPosition.x + 0.8,
      targetPosition.y + 0.6,
      targetPosition.z + 4.5
    );
  }

  endInspection() {
    this.isInspecting = false;
  }

  update(delta) {
    // Frame-rate independent exponential smoothing
    const smoothFactor = 1 - Math.exp(-delta * 6.5);
    const parallaxFactor = 1 - Math.exp(-delta * 4.5);

    this.velocity = this.targetProgress - this.progress;
    this.dampedVelocity += (this.velocity - this.dampedVelocity) * smoothFactor;
    this.progress += (this.targetProgress - this.progress) * (this.reducedMotion ? 0.35 : smoothFactor);

    this.mouseParallax.x += (this.targetMouseParallax.x - this.mouseParallax.x) * parallaxFactor;
    this.mouseParallax.y += (this.targetMouseParallax.y - this.mouseParallax.y) * parallaxFactor;

    if (this.isInspecting) {
      this.camera.position.lerp(this.inspectCamPos, smoothFactor);
      this.currentLookAt.lerp(this.inspectLookAt, smoothFactor);
      this.camera.lookAt(this.currentLookAt);
      return;
    }

    const clampedProg = Math.max(0.0001, Math.min(0.9999, this.progress));
    this.cameraSpline.getPointAt(clampedProg, this.targetPos);
    this.lookAtSpline.getPointAt(clampedProg, this.targetLookAt);
    this.cameraSpline.getTangentAt(clampedProg, this.tangent);

    const parallaxStrength = this.reducedMotion ? 0.0 : 0.65;
    const px = this.mouseParallax.x * parallaxStrength;
    const py = this.mouseParallax.y * (parallaxStrength * 0.5);

    // Subtle micro-shake only on rapid scroll velocity (disabled if reducedMotion)
    const absVel = Math.abs(this.dampedVelocity);
    const shake = (!this.reducedMotion && absVel > 0.004)
      ? (Math.random() - 0.5) * Math.min(absVel * 0.8, 0.035)
      : 0;

    this.camera.position.set(
      this.targetPos.x + px + shake,
      this.targetPos.y + py + shake,
      this.targetPos.z
    );

    this.currentLookAt.lerp(this.targetLookAt, smoothFactor * 1.2);
    this.camera.lookAt(
      this.currentLookAt.x + px * 0.3,
      this.currentLookAt.y + py * 0.3,
      this.currentLookAt.z
    );

    // Camera banking / roll into spline turns
    const rollAngle = this.reducedMotion ? 0 : (-this.tangent.x * 0.32 - this.dampedVelocity * 5.0);
    this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, rollAngle, smoothFactor);
  }
}
