import './style.css';
import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.05,
  smoothWheel: true,
  lerp: 0.08,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0xd9e7ff, 0.4));

const glowA = new THREE.PointLight(0x6eb6ff, 5, 40, 2);
glowA.position.set(-6, 2, 8);
scene.add(glowA);

const glowB = new THREE.PointLight(0x92f5d7, 5, 40, 2);
glowB.position.set(6, -2, 8);
scene.add(glowB);

const plasmaGeometry = new THREE.PlaneGeometry(26, 18, 120, 90);
const plasmaMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xc8ddff,
  transparent: true,
  opacity: 0.16,
  metalness: 0,
  roughness: 0.12,
  transmission: 0.92,
  thickness: 1.6,
  side: THREE.DoubleSide,
});

const plasmaMesh = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
plasmaMesh.position.z = -8;
scene.add(plasmaMesh);

const auraMaterialA = new THREE.MeshBasicMaterial({
  color: 0x6eb6ff,
  transparent: true,
  opacity: 0.18,
  blending: THREE.AdditiveBlending,
});

const auraMaterialB = new THREE.MeshBasicMaterial({
  color: 0x92f5d7,
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
});

const auraA = new THREE.Mesh(new THREE.SphereGeometry(2.8, 48, 48), auraMaterialA);
auraA.position.set(-4.5, 1.5, -6);
scene.add(auraA);

const auraB = new THREE.Mesh(new THREE.SphereGeometry(3.2, 48, 48), auraMaterialB);
auraB.position.set(4.8, -1.8, -7);
scene.add(auraB);

const pointer = { x: 0, y: 0 };
const basePositions = Float32Array.from(plasmaGeometry.attributes.position.array);

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
});

const clock = new THREE.Clock();

function updatePlasma(elapsed) {
  const positionAttribute = plasmaGeometry.attributes.position;

  for (let index = 0; index < positionAttribute.count; index += 1) {
    const stride = index * 3;
    const baseX = basePositions[stride];
    const baseY = basePositions[stride + 1];

    const waveA = Math.sin(baseX * 0.45 + elapsed * 0.9);
    const waveB = Math.cos(baseY * 0.5 - elapsed * 0.8);
    const waveC = Math.sin((baseX + baseY) * 0.24 + elapsed * 0.65);

    positionAttribute.array[stride + 2] = waveA * 0.38 + waveB * 0.3 + waveC * 0.45;
  }

  positionAttribute.needsUpdate = true;
  plasmaGeometry.computeVertexNormals();
}

function renderScene() {
  const elapsed = clock.getElapsedTime();

  updatePlasma(elapsed);

  auraA.position.x = -4.5 + Math.sin(elapsed * 0.55) * 1.3 + pointer.x * 0.6;
  auraA.position.y = 1.5 + Math.cos(elapsed * 0.7) * 0.9 + pointer.y * 0.3;

  auraB.position.x = 4.8 + Math.cos(elapsed * 0.45) * 1.4 + pointer.x * 0.5;
  auraB.position.y = -1.8 + Math.sin(elapsed * 0.6) * 1 + pointer.y * 0.3;

  plasmaMesh.rotation.z = Math.sin(elapsed * 0.18) * 0.08;
  plasmaMesh.rotation.x = Math.cos(elapsed * 0.16) * 0.06;
  plasmaMesh.position.x = pointer.x * 0.55;
  plasmaMesh.position.y = pointer.y * 0.28;

  camera.position.x += ((pointer.x * 1.2) - camera.position.x) * 0.03;
  camera.position.y += ((pointer.y * 0.75) - camera.position.y) * 0.03;
  camera.lookAt(0, 0, -5);

  renderer.render(scene, camera);
  requestAnimationFrame(renderScene);
}

renderScene();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
});

const header = document.getElementById('site-header');
ScrollTrigger.create({
  start: 20,
  end: 99999,
  onUpdate: (self) => {
    header.classList.toggle('is-compact', self.scroll() > 32);
  },
});

const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileLinks = mobileNav.querySelectorAll('a');

function toggleMobileNav(forceOpen) {
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !mobileNav.classList.contains('is-open');
  mobileNav.classList.toggle('is-open', shouldOpen);
  mobileNav.setAttribute('aria-hidden', String(!shouldOpen));
  navToggle.classList.toggle('is-active', shouldOpen);
  navToggle.setAttribute('aria-expanded', String(shouldOpen));
}

navToggle.addEventListener('click', () => {
  toggleMobileNav();
});

mobileLinks.forEach((link) => {
  link.addEventListener('click', () => {
    toggleMobileNav(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggleMobileNav(false);
  }
});

document.querySelectorAll('.reveal').forEach((element) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
      },
    },
  );
});

document.querySelectorAll('.magnetic').forEach((element) => {
  element.addEventListener('mousemove', (event) => {
    if (window.innerWidth < 820) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const moveX = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const moveY = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

    gsap.to(element, {
      x: moveX,
      y: moveY,
      duration: 0.25,
      ease: 'power2.out',
    });
  });

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
    });
  });
});

const typedName = document.getElementById('typed-name');

if (typedName) {
  const fullName = typedName.dataset.name ?? 'Kirtan Joshi';
  let currentIndex = 0;

  const typeNextCharacter = () => {
    typedName.textContent = fullName.slice(0, currentIndex);
    currentIndex += 1;

    if (currentIndex <= fullName.length) {
      window.setTimeout(typeNextCharacter, currentIndex < fullName.length ? 110 : 220);
    }
  };

  window.setTimeout(typeNextCharacter, 350);
}
