import * as THREE from 'three';
import { achievements } from '../data/portfolioData.js';

export class Constellation {
  constructor(scene) {
    this.scene = scene;
    this.lines = [];
    this.points = [];
    this.discoveryState = new Array(achievements.length).fill(false);

    this.initConstellation();
  }

  initConstellation() {
    const points = achievements.map(a => new THREE.Vector3(a.position.x, a.position.y, a.position.z));
    this.points = points;

    // Line segments connecting consecutive achievement stars
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color('#38bdf8'),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });

      const line = new THREE.Line(geometry, material);
      line.userData = {
        targetOpacity: 0.15,
        currentOpacity: 0.15,
        index: i
      };

      this.scene.add(line);
      this.lines.push(line);
    }

    // Interactive Star Nodes at each point
    const starGeo = new THREE.SphereGeometry(0.12, 16, 16);
    this.starMeshes = points.map((p, idx) => {
      const starMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(achievements[idx].color),
        transparent: true,
        opacity: 0.6
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.copy(p);
      this.scene.add(star);
      return star;
    });
  }

  updateDiscovery(discoveredCount) {
    // If user has discovered K achievements, light up K-1 connection lines
    for (let i = 0; i < this.lines.length; i++) {
      if (i < discoveredCount - 1) {
        this.lines[i].userData.targetOpacity = 0.85;
      } else {
        this.lines[i].userData.targetOpacity = 0.15;
      }
    }

    for (let i = 0; i < this.starMeshes.length; i++) {
      if (i < discoveredCount) {
        this.starMeshes[i].material.opacity = 1.0;
        this.starMeshes[i].scale.setScalar(1.5);
      } else {
        this.starMeshes[i].material.opacity = 0.5;
        this.starMeshes[i].scale.setScalar(1.0);
      }
    }
  }

  update(delta, elapsed) {
    this.lines.forEach((line, idx) => {
      const ud = line.userData;
      ud.currentOpacity += (ud.targetOpacity - ud.currentOpacity) * 0.1;
      // Pulse if active
      const pulse = ud.targetOpacity > 0.5 ? Math.sin(elapsed * 4.0 + idx) * 0.15 : 0;
      line.material.opacity = Math.max(0.1, ud.currentOpacity + pulse);
    });

    this.starMeshes.forEach((star, idx) => {
      const pulse = 1.0 + Math.sin(elapsed * 3.0 + idx * 1.5) * 0.2;
      if (star.material.opacity > 0.8) {
        star.scale.setScalar(1.4 * pulse);
      }
    });
  }
}
