import * as THREE from 'three';
import { achievements } from '../data/portfolioData.js';
import { FresnelShader } from './Shaders.js';

export class Artifacts {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.hoveredItem = null;
    this.raycaster = new THREE.Raycaster();
    this.mouseNDC = new THREE.Vector2(-999, -999);

    this.initArtifacts();
  }

  initArtifacts() {
    achievements.forEach((data, index) => {
      const group = new THREE.Group();
      group.position.set(data.position.x, data.position.y, data.position.z);
      group.userData = {
        id: data.id,
        index,
        data,
        baseScale: 1.0,
        currentScale: 1.0,
        targetScale: 1.0,
        hoverGlow: 0.0,
        targetHoverGlow: 0.0,
        baseY: data.position.y,
        floatSeed: index * 1.618,
        discovered: false
      };

      // Create distinctive procedural geometry per achievement
      const accentColor = new THREE.Color(data.color);
      const baseColor = new THREE.Color('#0a0c14');

      const material = new THREE.ShaderMaterial({
        vertexShader: FresnelShader.vertexShader,
        fragmentShader: FresnelShader.fragmentShader,
        uniforms: {
          uBaseColor: { value: baseColor },
          uRimColor: { value: accentColor },
          uFresnelPower: { value: 2.8 },
          uHoverGlow: { value: 0.0 },
          uTime: { value: 0.0 }
        },
        transparent: true,
        side: THREE.DoubleSide
      });

      let mainMesh;
      let auraMesh;

      if (index === 0) {
        // 1. Golden Monolith (Awwwards)
        const geo = new THREE.BoxGeometry(0.8, 1.8, 0.3, 4, 8, 4);
        mainMesh = new THREE.Mesh(geo, material);
        mainMesh.rotation.set(0.3, 0.4, 0.2);

        // Orbital halo
        const ringGeo = new THREE.TorusGeometry(1.3, 0.02, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.6 });
        auraMesh = new THREE.Mesh(ringGeo, ringMat);
        auraMesh.rotation.x = Math.PI / 2;
        group.add(auraMesh);
      } else if (index === 1) {
        // 2. Prismatic Octahedron (IELTS)
        const geo = new THREE.OctahedronGeometry(1.1, 1);
        mainMesh = new THREE.Mesh(geo, material);

        const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.5 });
        auraMesh = new THREE.Mesh(ringGeo, ringMat);
        group.add(auraMesh);
      } else if (index === 2) {
        // 3. Hypercube Tesseract (GitHub Stars)
        const geo = new THREE.IcosahedronGeometry(1.0, 1);
        mainMesh = new THREE.Mesh(geo, material);

        // Outer wireframe cage
        const wireGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const wireMat = new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: 0.35 });
        auraMesh = new THREE.Mesh(wireGeo, wireMat);
        group.add(auraMesh);
      } else if (index === 3) {
        // 4. Kinetic Accelerator (Hackathon Champion)
        const geo = new THREE.DodecahedronGeometry(1.0);
        mainMesh = new THREE.Mesh(geo, material);

        // Double gyroscope rings
        const ring1 = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.025, 16, 64),
          new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.7 })
        );
        const ring2 = ring1.clone();
        ring2.rotation.x = Math.PI / 2;
        auraMesh = ring1;
        group.add(ring1);
        group.add(ring2);
      } else {
        // 5. Crystalline Shard (Graphics Architect)
        const geo = new THREE.ConeGeometry(0.9, 2.2, 5);
        mainMesh = new THREE.Mesh(geo, material);
        mainMesh.rotation.x = Math.PI;

        const ringGeo = new THREE.TorusGeometry(1.3, 0.02, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.5 });
        auraMesh = new THREE.Mesh(ringGeo, ringMat);
        auraMesh.rotation.x = Math.PI / 3;
        group.add(auraMesh);
      }

      // Hitbox for raycasting
      const hitGeo = new THREE.SphereGeometry(1.8, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { parentGroup: group };

      group.add(mainMesh);
      group.add(hitMesh);
      this.scene.add(group);

      this.items.push({
        group,
        mainMesh,
        auraMesh,
        hitMesh,
        material,
        data
      });
    });
  }

  setMouse(ndcX, ndcY) {
    this.mouseNDC.set(ndcX, ndcY);
  }

  checkRaycast(camera, onHoverChange) {
    this.raycaster.setFromCamera(this.mouseNDC, camera);
    const hitMeshes = this.items.map(item => item.hitMesh);
    const intersects = this.raycaster.intersectObjects(hitMeshes, false);

    let newlyHovered = null;

    if (intersects.length > 0) {
      const hit = intersects[0];
      const parentGroup = hit.object.userData.parentGroup;
      const item = this.items.find(i => i.group === parentGroup);
      if (item) {
        newlyHovered = item;
      }
    }

    if (newlyHovered !== this.hoveredItem) {
      if (this.hoveredItem) {
        // Unhover previous
        this.hoveredItem.group.userData.targetScale = 1.0;
        this.hoveredItem.group.userData.targetHoverGlow = 0.0;
      }
      if (newlyHovered) {
        // Hover current
        newlyHovered.group.userData.targetScale = 1.15;
        newlyHovered.group.userData.targetHoverGlow = 1.0;
        newlyHovered.group.userData.discovered = true;
      }

      this.hoveredItem = newlyHovered;
      if (onHoverChange) {
        onHoverChange(newlyHovered ? newlyHovered.data : null);
      }
    }
  }

  getDiscoveredCount() {
    return this.items.filter(i => i.group.userData.discovered).length;
  }

  markAllDiscovered() {
    this.items.forEach(i => { i.group.userData.discovered = true; });
  }

  update(delta, elapsed) {
    this.items.forEach((item, idx) => {
      const ud = item.group.userData;

      // Smooth scale interpolation
      ud.currentScale += (ud.targetScale - ud.currentScale) * 0.12;
      item.group.scale.setScalar(ud.currentScale);

      // Smooth hover glow
      ud.hoverGlow += (ud.targetHoverGlow - ud.hoverGlow) * 0.15;
      item.material.uniforms.uHoverGlow.value = ud.hoverGlow;
      item.material.uniforms.uTime.value = elapsed;

      // Levitation floating
      const floatY = Math.sin(elapsed * 1.5 + ud.floatSeed) * 0.18;
      item.group.position.y = ud.baseY + floatY;

      // Continuous subtle rotation
      item.mainMesh.rotation.y = elapsed * 0.4 + ud.floatSeed;
      item.mainMesh.rotation.x = Math.sin(elapsed * 0.3 + ud.floatSeed) * 0.2;

      if (item.auraMesh) {
        item.auraMesh.rotation.z = -elapsed * 0.6;
      }
    });
  }
}
