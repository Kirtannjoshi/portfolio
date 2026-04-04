import './style.css';
import * as THREE from 'three';

// === THREE.JS 3D BACKGROUND ===
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
// Scene background is NULL to let CSS gradient show through

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 35;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// --- MOUNTAINS & GROUND (EARTH) ---
const mountainGroup = new THREE.Group();
const mountainMat = new THREE.MeshStandardMaterial({
  color: 0x020617, 
  roughness: 1,
  flatShading: true,
});
const wireMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x60a5fa,
  wireframe: true,
  transparent: true,
  opacity: 0.1 
});

// Solid Ground Base 
const groundGeo = new THREE.PlaneGeometry(1000, 1000);
const groundMesh = new THREE.Mesh(groundGeo, mountainMat);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -115; // The "Earth" surface
mountainGroup.add(groundMesh);

function createProperMountains() {
  const segs = 64; 
  for (let m = 0; m < 5; m++) {
    const geo = new THREE.PlaneGeometry(200, 80, segs, 30);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Rugged noise displacement (Height above ground)
        const h = Math.abs(Math.sin(x * 0.05) * Math.cos(y * 0.1)) * 30 + 
                  Math.abs(Math.sin(x * 0.15) * Math.sin(y * 0.15)) * 10;
        pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mountainMat);
    const wire = new THREE.Mesh(geo, wireMaterial);
    mesh.add(wire);
    mesh.rotation.x = -Math.PI / 2;
    // Positioned slightly below groundMesh to blend upward
    mesh.position.set((m - 2) * 150, -115.1, -60);
    mountainGroup.add(mesh);
  }
}
createProperMountains();
scene.add(mountainGroup);

// --- STAR FIELD ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 400;
  starPos[i * 3 + 1] = (Math.random() - 1.8) * 150; 
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- CLOUDS ---
const clouds = [];
function createTexture(path, callback) {
  const img = new Image();
  img.src = path;
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 30 && d[i+1] < 30 && d[i+2] < 30) d[i+3] = 0;
    }
    ctx.putImageData(data, 0, 0);
    callback(new THREE.CanvasTexture(c));
  };
}

createTexture('/cloud.png', (tex) => {
  for (let i = 0; i < 20; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7 }));
    sprite.position.set((Math.random() - 0.5) * 180, (Math.random() - 0.5) * 60 + 25, (Math.random() - 0.5) * 60);
    const s = 10 + Math.random() * 25;
    sprite.scale.set(s, s * 0.5, 1);
    sprite.userData = { drift: 0.01 + Math.random() * 0.04 };
    scene.add(sprite);
    clouds.push(sprite);
  }
});

// Tracking
let mouseX = 0, mouseY = 0, scrollY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const scrollPercent = Math.min(scrollY / maxScroll, 1);

  // === CINEMATIC SKY SYNC ===
  const skyColor = new THREE.Color(0x1e3a8a);
  if (scrollPercent < 0.45) {
    skyColor.lerp(new THREE.Color(0xfb923c), scrollPercent / 0.45);
  } else {
    const midnightT = Math.min(1, (scrollPercent - 0.45) / 0.4);
    skyColor.set(0xfb923c).lerp(new THREE.Color(0x020617), midnightT);
  }
  scene.background = skyColor;
  document.body.style.backgroundColor = skyColor.getStyle();

  ambientLight.intensity = 1.4 - scrollPercent * 1.2;
  dirLight.intensity = 2.0 - scrollPercent * 1.8;
  dirLight.color.copy(skyColor);
  starMaterial.opacity = Math.max(0, (scrollPercent - 0.5) * 2);

  // Camera Landing Path
  camera.position.x += (mouseX * 6 - camera.position.x) * 0.03;
  camera.position.y += (-mouseY * 6 + 5 - (scrollPercent * 25) - camera.position.y) * 0.03;
  camera.rotation.x = -scrollPercent * 0.25; 
  
  clouds.forEach(c => {
    c.position.x += c.userData.drift;
    // Add subtle vertical swaying to clouds
    c.position.y += Math.sin(time * 0.6 + c.position.x * 0.1) * 0.015;
    if (c.position.x > 100) c.position.x = -100;
  });

  camera.lookAt(0, -scrollPercent * 55, 0); 
  renderer.render(scene, camera);
}
animate();

// === HTML INTERACTIONS ===

// Character parallax
const heroChar = document.getElementById('hero-char');

// Remove white background from character image
function removeWhiteBG(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2];
    // If pixel is near-white, make transparent
    if (r > 220 && g > 220 && b > 220) {
      d[i+3] = 0;
    }
    // Soften light-gray edges
    else if (r > 200 && g > 200 && b > 200) {
      d[i+3] = Math.floor(255 * (1 - (r + g + b - 600) / 165));
    }
  }
  ctx.putImageData(data, 0, 0);
  img.src = c.toDataURL();
}

if (heroChar) {
  if (heroChar.complete) removeWhiteBG(heroChar);
  else heroChar.addEventListener('load', () => removeWhiteBG(heroChar));
}

document.addEventListener('mousemove', (e) => {
  if (!heroChar) return;
  const mx = (e.clientX / window.innerWidth - 0.5) * 20;
  const my = (e.clientY / window.innerHeight - 0.5) * 20;
  heroChar.style.transform = `translate(${mx}px, ${my}px)`;
});

// Intersection Observer for fade-in
const fadeEls = document.querySelectorAll('.bento-item, .skill-tag, .section-label, .hero-content, .hero-character, .contact-inner');
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Nav background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(15, 23, 42, 0.95)';
  } else {
    nav.style.background = 'rgba(15, 23, 42, 0.7)';
  }
});

console.log("%c[SYS] Portfolio v3.0 Initialized", "color: #00f3ff; background: #050505; padding: 4px 8px;");
