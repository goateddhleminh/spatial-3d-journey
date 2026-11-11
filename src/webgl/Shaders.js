/**
 * Custom GLSL Shaders Collection
 * Optimized for high performance, zero allocations, and cinema-grade aesthetics.
 */

// =========================================================================
// 1. SKY / COSMIC NEBULA SHADER
// =========================================================================
export const SkyShader = {
  vertexShader: /* glsl */ `
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uSkyTop;
    uniform vec3 uSkyBottom;
    uniform vec3 uSkyAccent;
    uniform float uTime;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    // Fast 3D Simplex noise hash
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float elevation = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

      // Gradient horizon mix
      vec3 baseSky = mix(uSkyBottom, uSkyTop, elevation);

      // Flowing celestial nebulae using 3D noise
      float t = uTime * 0.04;
      vec3 noisePos = dir * 1.8 + vec3(0.0, t * 0.2, t * 0.1);
      float n1 = snoise(noisePos);
      float n2 = snoise(noisePos * 2.4 - vec3(t * 0.3));
      float nebula = smoothstep(0.15, 0.85, n1 * 0.6 + n2 * 0.4);

      // Subtle star specks
      vec3 starCoord = dir * 140.0;
      float starNoise = snoise(starCoord);
      float stars = pow(clamp(starNoise, 0.0, 1.0), 18.0) * 1.5;
      float twinkle = sin(uTime * 3.0 + starNoise * 40.0) * 0.5 + 0.5;

      // Final celestial composition
      vec3 color = baseSky + (uSkyAccent * nebula * 0.35) + vec3(stars * twinkle);
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// =========================================================================
// 2. MORPHING GPU PARTICLES SHADER (20k+ Points)
// =========================================================================
export const MorphParticleShader = {
  vertexShader: /* glsl */ `
    attribute vec3 targetPosition;
    attribute float aSeed;
    attribute float aSize;
    attribute vec3 aColor;

    uniform float uProgress;      // 0.0 to 1.0 morph factor
    uniform float uTime;
    uniform vec3 uMouse;
    uniform vec3 uAccentColor;
    uniform float uPixelRatio;

    varying vec3 vColor;
    varying float vAlpha;

    // Cubic smooth step ease
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      // Eased morphing with per-particle latency based on aSeed
      float staggeredProgress = clamp((uProgress - aSeed * 0.2) / 0.8, 0.0, 1.0);
      float easeT = easeInOutCubic(staggeredProgress);

      // Morph between start and target positions
      vec3 pos = mix(position, targetPosition, easeT);

      // Add gentle floating harmonic wave
      float wave = sin(uTime * 1.2 + aSeed * 6.28) * 0.15;
      float cosWave = cos(uTime * 0.9 + aSeed * 4.15) * 0.12;
      pos.x += wave;
      pos.y += cosWave;
      pos.z += wave * 0.5;

      // Cursor magnetic proximity repulsion
      vec3 toMouse = pos - uMouse;
      float mouseDist = length(toMouse);
      if (mouseDist < 4.0 && mouseDist > 0.001) {
        float force = (1.0 - mouseDist / 4.0) * 0.6;
        pos += normalize(toMouse) * force;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation based on distance (crisp micro-particles)
      float pointSize = aSize * (34.0 / max(1.0, -mvPosition.z)) * uPixelRatio;
      gl_PointSize = clamp(pointSize, 1.2, 6.5);

      // Color blending between particle natural hue and chapter accent
      vColor = mix(aColor, uAccentColor, 0.45 + sin(uTime + aSeed * 3.14) * 0.15);
      vAlpha = clamp(1.0 - (-mvPosition.z / 120.0), 0.15, 0.85);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Soft radial glowing particle point
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Crisp luminous core with controlled additive falloff
      float glow = exp(-dist * 9.0);
      float core = smoothstep(0.18, 0.0, dist);

      vec3 finalCol = vColor * 0.85 + vec3(core * 0.35);
      float alpha = (glow * 0.28 + core * 0.22) * vAlpha;

      gl_FragColor = vec4(finalCol, alpha);
    }
  `
};

// =========================================================================
// 3. FRESNEL IRIDESCENT MONOLITH SHADER
// =========================================================================
export const FresnelShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uBaseColor;
    uniform vec3 uRimColor;
    uniform float uFresnelPower;
    uniform float uHoverGlow;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel rim calculation
      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, uFresnelPower);

      // Holographic contour lines
      float grid = sin(vWorldPosition.y * 12.0 + uTime * 2.0) * 0.5 + 0.5;
      float scanline = smoothstep(0.4, 0.6, grid) * 0.15;

      // Subtle chromatic iridescent tint
      vec3 iridescence = vec3(
        sin(fresnel * 3.14 + 0.0) * 0.5 + 0.5,
        sin(fresnel * 3.14 + 2.0) * 0.5 + 0.5,
        sin(fresnel * 3.14 + 4.0) * 0.5 + 0.5
      ) * 0.25;

      vec3 rim = mix(uRimColor, uRimColor + iridescence, 0.4) * fresnel * (1.2 + uHoverGlow * 1.5);
      vec3 ambient = uBaseColor + scanline * uRimColor * 0.5;

      vec3 finalColor = ambient + rim;
      float alpha = clamp(0.4 + fresnel * 0.6 + uHoverGlow * 0.3, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// =========================================================================
// 4. FILM GRAIN & VIGNETTE PASS
// =========================================================================
export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAmount: { value: 0.045 },
    uVignette: { value: 0.5 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    uniform float uVignette;
    varying vec2 vUv;

    // Fast pseudo-random hash
    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);

      // Fine dynamic grain
      float noise = (rand(vUv + fract(uTime)) - 0.5) * uAmount;
      base.rgb += noise;

      // Cinematic radial vignette
      vec2 uv = (vUv - 0.5) * 2.0;
      float vig = clamp(1.0 - dot(uv, uv) * (uVignette * 0.4), 0.0, 1.0);
      base.rgb *= vig;

      gl_FragColor = base;
    }
  `
};
