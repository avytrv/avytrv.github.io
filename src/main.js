import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BloomPass } from "three/addons/postprocessing/BloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x444444);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 4);

// LIGHT
const light = new THREE.DirectionalLight(0xeadbcb, 10);
light.position.set(5, 20, 0);
light.castShadow = true;
scene.add(light);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// GROUND
const groundGeometry = new THREE.PlaneGeometry(32, 20, 32, 32);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// MODEL
const loader = new GLTFLoader().setPath("commodore_64/");
loader.load("scene.gltf", (gltf) => {
  const mesh = gltf.scene;
  mesh.rotation.y = Math.PI / 8;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = false;
    }
  });

  scene.add(mesh);
});

// POST-PROCESSING
const vignetteShader = VignetteShader;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new BloomPass(0.8);
const filmPass = new FilmPass(1);
const vignetteEffect = new ShaderPass(vignetteShader);
const outputPass = new OutputPass();

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(filmPass);
composer.addPass(vignetteEffect);
composer.addPass(outputPass);

// EVENT LISTENERS
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// ANIMATION LOOP
let then = 0;
function animate(now) {
  now *= 0.001;
  const deltaTime = now - then;
  then = now;
  controls.update();
  renderer.clear();
  composer.render(deltaTime);
}

renderer.setAnimationLoop(animate);
