import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 4);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xeadbcb, 10);
light.position.set(3, 25, 0);
light.castShadow = true;
light.shadow.bias = -0.0001;
scene.add(light);

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

const loader = new GLTFLoader().setPath("commodore_64/");
loader.load("scene.gltf", (gltf) => {
  const mesh = gltf.scene;
  mesh.rotation.y = Math.PI / 8;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(mesh);
});

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const filmPass = new FilmPass(100);
composer.addPass(filmPass);

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

function animate() {
  composer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
