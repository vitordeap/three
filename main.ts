import * as THREE from 'three';

// Configuration Values
let render_sizes: [number, number] = [window.innerWidth, window.innerHeight];

// Creating the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(render_sizes[0], render_sizes[1]);
