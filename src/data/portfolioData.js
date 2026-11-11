/**
 * Portfolio Data Architecture
 * Award-winning story-driven interactive 3D portfolio data.
 * Easily customize these values to match your own personal milestones!
 */

export const personalData = {
  name: "KAI VANCE",
  role: "Creative Developer & WebGL Architect",
  tagline: "Bridging mathematical precision, real-time shaders, and kinetic digital storytelling.",
  location: "San Francisco / Remote",
  status: "Available for Q1 2027 select projects",
  personality: [
    { title: "Curious", desc: "Obsessed with reverse-engineering physical phenomena into mathematical shaders." },
    { title: "Meticulous", desc: "Obsessing over frame timings, sub-pixel alignment, and 60fps thermal stability." },
    { title: "Ambitious", desc: "Pushing browser boundaries with WebGPU, instanced simulations, and spatial UI." },
    { title: "Harmonic", desc: "Balancing dark luxury aesthetics with whisper-quiet, intuitive ergonomics." }
  ],
  contacts: {
    email: "kai.vance.dev@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    readcv: "https://read.cv"
  }
};

export const chapters = [
  {
    id: "genesis",
    index: 0,
    year: "2014",
    era: "The Genesis Spark",
    title: "Taking Apart The Machine",
    subtitle: "Childhood curiosity & first terminal lines",
    story: "In a dimly lit bedroom surrounded by disassembled CRT monitors and circuit boards, I wrote my first lines of QBasic and raw HTML. What started as curiosity turned into an enduring obsession: breathing life into motionless pixels.",
    emotion: "Pure Wonder",
    color: "#ff7a30", // Warm Amber Spark
    skyColors: {
      top: [0.03, 0.04, 0.08],
      bottom: [0.12, 0.05, 0.02],
      accent: [1.0, 0.48, 0.19]
    },
    cameraPoint: { x: 0, y: 2, z: 12 },
    lookAtPoint: { x: 0, y: 1.5, z: 0 },
    particleShape: "seed"
  },
  {
    id: "foundations",
    index: 1,
    year: "2017",
    era: "Algorithmic Foundations",
    title: "Mathematics Meets Motion",
    subtitle: "High school olympiads & procedural geometry",
    story: "Competing in national mathematical olympiads unlocked the hidden beauty of linear algebra, calculus, and vector geometry. I began writing generative flow fields and parametric spirals, discovering that math is the ultimate visual paintbrush.",
    emotion: "Deep Focus",
    color: "#00f0ff", // Electric Cyan
    skyColors: {
      top: [0.02, 0.06, 0.12],
      bottom: [0.01, 0.02, 0.06],
      accent: [0.0, 0.94, 1.0]
    },
    cameraPoint: { x: 4, y: 3.5, z: -8 },
    lookAtPoint: { x: 0, y: 2.0, z: -15 },
    particleShape: "book"
  },
  {
    id: "turning-point",
    index: 2,
    year: "2020",
    era: "The Quantum Leap",
    title: "Entering The Shader Realm",
    subtitle: "University Computer Science & GLSL Mastery",
    story: "During university CS, I stepped beyond traditional CPU rendering into the parallel paradise of GPU computing. Writing custom raymarching shaders, Signed Distance Fields (SDFs), and compute kernels transformed how I perceived space and interactive performance.",
    emotion: "Epiphany",
    color: "#a855f7", // Quantum Violet
    skyColors: {
      top: [0.05, 0.02, 0.12],
      bottom: [0.02, 0.01, 0.05],
      accent: [0.66, 0.33, 0.97]
    },
    cameraPoint: { x: -5, y: 1.8, z: -28 },
    lookAtPoint: { x: 0, y: 2.5, z: -35 },
    particleShape: "code"
  },
  {
    id: "velocity",
    index: 3,
    year: "2022",
    era: "Forging The Edge",
    title: "Global Arenas & High Velocity",
    subtitle: "International hackathons & immersive studio lead",
    story: "Led an international hackathon squad to 1st place among 4,000 developers, then joined an elite creative technology studio. We engineered interactive 3D brand experiences for global clients, shipping micro-optimized WebGL runs locked at 60fps.",
    emotion: "Unstoppable Velocity",
    color: "#10b981", // Electric Emerald
    skyColors: {
      top: [0.01, 0.08, 0.06],
      bottom: [0.01, 0.02, 0.04],
      accent: [0.06, 0.72, 0.51]
    },
    cameraPoint: { x: 6, y: 4.5, z: -48 },
    lookAtPoint: { x: 0, y: 3.0, z: -55 },
    particleShape: "engine"
  },
  {
    id: "masterwork",
    index: 4,
    year: "2024",
    era: "The Masterwork",
    title: "Sculpting Light & Prestige",
    subtitle: "Awwwards Site of the Year Nominee & Open Source",
    story: "Released an open-source WebGL spatial audio engine that gained 10,000+ GitHub stars, followed by an interactive showcase nominated for Awwwards Site of the Year. Mastery isn't about complexity; it's about making impossibly complex graphics feel effortless.",
    emotion: "Sublime Mastery",
    color: "#eab308", // Auric Gold
    skyColors: {
      top: [0.08, 0.06, 0.02],
      bottom: [0.02, 0.01, 0.01],
      accent: [0.92, 0.70, 0.03]
    },
    cameraPoint: { x: -3, y: 5.2, z: -68 },
    lookAtPoint: { x: 0, y: 3.8, z: -76 },
    particleShape: "trophy"
  },
  {
    id: "horizon",
    index: 5,
    year: "2026+",
    era: "The Infinite Horizon",
    title: "Spatial Universes & Beyond",
    subtitle: "WebGPU, neural rendering & future frontiers",
    story: "Standing at the threshold of spatial computing, WebGPU compute pipelines, and procedural multi-agent worlds. The next decade belongs to digital environments that adapt organically to human intent, presence, and emotion.",
    emotion: "Transcendence",
    color: "#38bdf8", // Celestial Sky Blue
    skyColors: {
      top: [0.04, 0.04, 0.10],
      bottom: [0.01, 0.01, 0.03],
      accent: [0.22, 0.74, 0.97]
    },
    cameraPoint: { x: 0, y: 3.0, z: -92 },
    lookAtPoint: { x: 0, y: 3.0, z: -108 },
    particleShape: "portal"
  }
];

export const achievements = [
  {
    id: "awwwards-nominee",
    title: "Awwwards SOTY Nominee",
    category: "Design & Creative Tech",
    year: "2024",
    score: "9.2/10 Score",
    preview: "Nominated for Site of the Year alongside top international creative agencies.",
    description: "Honored with Site of the Day, Developer Award, and an annual Site of the Year nomination for engineering a bespoke WebGL physics journey with zero external 3D libraries.",
    metrics: [
      { label: "Frame Rate", value: "60 FPS rock-solid" },
      { label: "Assets Loaded", value: "340 KB gzipped" },
      { label: "Global Ranking", value: "Top 0.1%" }
    ],
    position: { x: -2.8, y: 3.2, z: -18 },
    color: "#eab308",
    icon: "award",
    tags: ["WebGL", "Three.js", "Shaders", "GLSL"]
  },
  {
    id: "ielts-mastery",
    title: "IELTS Band 8.5 Distinction",
    category: "Academic & Communication",
    year: "2021",
    score: "Band 8.5 / 9.0",
    preview: "Expert multilingual articulation, technical authorship, and global leadership.",
    description: "Demonstrated near-native command of technical prose, international architecture documentation, and live stage presentations with a rare top-tier score.",
    metrics: [
      { label: "Listening", value: "9.0 / 9.0" },
      { label: "Reading", value: "9.0 / 9.0" },
      { label: "Speaking", value: "8.5 / 9.0" }
    ],
    position: { x: 3.2, y: 2.8, z: -36 },
    color: "#00f0ff",
    icon: "book-open",
    tags: ["Leadership", "Global Comms", "Academic"]
  },
  {
    id: "github-star-forge",
    title: "10,000+ GitHub Stars Tool",
    category: "Open Source Systems",
    year: "2023",
    score: "10.4k ★",
    preview: "Creator of an open-source real-time shader visualizer used by 25,000+ developers.",
    description: "Architected a zero-overhead WebGL/WebGPU shader compiler and hot-reloader that cut asset iteration loops from minutes to milliseconds.",
    metrics: [
      { label: "Stars", value: "10,400+" },
      { label: "NPM Downloads", value: "350k / mo" },
      { label: "Contributors", value: "48 engineers" }
    ],
    position: { x: -3.4, y: 2.4, z: -58 },
    color: "#a855f7",
    icon: "terminal",
    tags: ["Open Source", "Compilers", "WebGPU", "Community"]
  },
  {
    id: "hackathon-gold",
    title: "Global Hackathon Grand Champion",
    category: "Competitive Engineering",
    year: "2022",
    score: "1st of 4,200",
    preview: "First Place out of 4,200 international participants at MIT Grand Hack.",
    description: "Built an offline-first generative 3D medical visualizer in 36 sleepless hours, winning overall Grand Champion and the Best Engineering Innovation award.",
    metrics: [
      { label: "Teams Defeated", value: "840 teams" },
      { label: "Judges Vote", value: "Unanimous 1st" },
      { label: "Time Limit", value: "36 hours" }
    ],
    position: { x: 3.5, y: 4.0, z: -78 },
    color: "#10b981",
    icon: "zap",
    tags: ["Hackathon", "Architecture", "Rapid Prototyping"]
  },
  {
    id: "graphics-fellow",
    title: "Senior Graphics Architect",
    category: "Industry Leadership",
    year: "2025",
    score: "Production Tier",
    preview: "Directing next-generation WebGL and spatial pipelines for high-traffic products.",
    description: "Spearheaded the WebGL rendering core serving 12M+ monthly users, reducing GPU draw calls by 74% and eliminating memory leaks on mobile Safari.",
    metrics: [
      { label: "Memory Reduction", value: "-68% VRAM" },
      { label: "Draw Calls", value: "Under 15 / frame" },
      { label: "User Base", value: "12M+ active" }
    ],
    position: { x: 0.0, y: 4.8, z: -94 },
    color: "#ff7a30",
    icon: "cpu",
    tags: ["Performance", "Optimization", "Architecture"]
  }
];
