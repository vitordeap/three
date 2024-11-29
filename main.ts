import * as THREE from 'three';

// Configuration Values (later they must be loaded at start of a session)
let render_sizes: [number, number] = [window.innerWidth, window.innerHeight];

// Creating the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(render_sizes[0], render_sizes[1]);
document.body.appendChild(renderer.domElement);

// Creating a scene
const scene = new THREE.Scene();

// Creating a camera
const camera = new THREE.PerspectiveCamera(
    90,
    render_sizes[0] / render_sizes[1],
);

// Render!
renderer.render(scene, camera);
