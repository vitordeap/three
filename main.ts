import * as THREE from 'three';
import { setup_scene } from './scene_creation';

// Configuration Values (later they must be loaded at start of a session)
export const env = {
    production: false,
    render_sizes: [window.innerWidth, window.innerHeight],
};

console.log(`Is production? ${env.production}`);
// Creating the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(env.render_sizes[0], env.render_sizes[1]);
document.body.appendChild(renderer.domElement);

// Creating a scene
const scene = new THREE.Scene();

// Creating a camera
const camera = new THREE.PerspectiveCamera(
    100,
    env.render_sizes[0] / env.render_sizes[1],
);

// Setup the Scene
setup_scene(renderer, scene, camera);
