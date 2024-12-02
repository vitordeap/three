import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DevPanel } from './panel_control.ts';
import { FBXLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';

export function setup_scene(
    renderer: THREE.Renderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
) {
    // Cria um cubo
    const cube = create_cube();
    scene.add(cube);

    // Cria um plano
    const plane = create_plane();
    scene.add(plane);

    // Cria uma esfera
    const sphere = create_sphere();
    scene.add(sphere);

    // Posiciona a camera
    update_camera_position([2, 2, 2], camera);

    // Adiciona um orbital
    const controls = add_orbital_control(camera, renderer);

    // Adiciona luz
    const light = create_light();
    scene.add(light);

    // Adiciona modelo 3D importado (format gltf)
    const model = import_3dmodel(scene);

    // Adiciona DevPanel
    if (!import.meta.env.PROD) {
        add_dev_panel(sphere);
    }

    // // Animação
    const animate = () => {
        const frame = requestAnimationFrame(animate);
        sphere.position.y = 0.75 + 0.5 * Math.sin(frame / 20);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    };

    // Add Helpers for Dev environment
    if (!import.meta.env.PROD) {
        const axes = new THREE.AxesHelper(3);
        scene.add(axes);
        const grid = new THREE.GridHelper(5, 20);
        scene.add(grid);
        const lightHelper = new THREE.DirectionalLightHelper(light);
        scene.add(lightHelper);
        const lightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
        scene.add(lightShadowHelper);
    }

    animate();
}

function add_orbital_control(
    camera: THREE.Camera,
    renderer: THREE.Renderer,
): OrbitControls {
    const controls = new OrbitControls(camera, renderer.domElement);
    return controls;
}

function update_camera_position(
    new_position: [number, number, number],
    camera: THREE.Camera,
    orbit: OrbitControls | null = null,
) {
    camera.position.set(...new_position);
    orbit ? orbit.update() : void 0;
}

function create_cube() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(-1, 0.5, 1.5);
    cube.castShadow = true;
    return cube;
}

function create_sphere() {
    const geometry = new THREE.SphereGeometry(0.5, 50, 50); // the number of segments is the number of "edges", impacting the resolution
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        wireframe: false, // wireframe show only the points + edges, not surfaces
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(-1, 1, 0);
    sphere.castShadow = true;
    return sphere;
}

function create_plane() {
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;
    return plane;
}

function create_light() {
    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(-30, 30, 0);
    light.castShadow = true;
    light.shadow.camera.far = 50;

    //shadow resolution
    light.shadow.mapSize.width = 2048; // Default is 512
    light.shadow.mapSize.height = 2048;

    return light;
}

function import_3dmodel(scene) {
    const url = new URL(
        'assets/cube/PartDesignExample-Body.gltf',
        import.meta.url,
    );
    const loader = new GLTFLoader();
    loader.load(url.href, (gltf) => {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.position.set(0, 0.5, -1);
        gltf.scene.rotateY(-Math.PI / 4);

        gltf.scene.children[0].children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
                console.log('A CHILD!');
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xe61919,
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(gltf.scene);
    });
}

function add_dev_panel(sphere: THREE.Mesh) {
    const panel = new DevPanel();

    const sphere_folder = panel.addFolder({ title: 'Sphere', expanded: true });

    const PARAMS = {
        sphere_size: 1,
        sphere_color: '#ff0055',
        sphere_x: -1,
        sphere_y: 1,
        sphere_z: 0,
    };
    sphere_folder.addBinding(PARAMS, 'sphere_size', {
        min: 0,
        max: 5,
        step: 0.1,
        tag: 'size',
    });
    sphere_folder.addBinding(PARAMS, 'sphere_color', { tag: 'color' });
    sphere_folder.addBinding(PARAMS, 'sphere_x', {
        min: -5,
        max: 5,
        step: 0.1,
        tag: 'sphere_x',
    });
    sphere_folder.addBinding(PARAMS, 'sphere_y', {
        min: -5,
        max: 5,
        step: 0.1,
        tag: 'sphere_y',
    });
    sphere_folder.addBinding(PARAMS, 'sphere_z', {
        min: -5,
        max: 5,
        step: 0.1,
        tag: 'sphere_z',
    });

    sphere_folder.on('change', (ev) => update_scene(ev, sphere));
}

function update_scene(e, sphere: THREE.Mesh) {
    function update_size(e) {
        sphere.scale.set(e.value, e.value, e.value);
    }
    function update_color(e) {
        sphere.material.color.set(e.value);
    }
    function update_x(e) {
        sphere.position.x = e.value;
    }
    function update_y(e) {
        sphere.position.y = e.value;
    }
    function update_z(e) {
        sphere.position.z = e.value;
    }

    const functions_by_tag: Map<string, CallableFunction> = {
        color: update_color,
        size: update_size,
        sphere_x: update_x,
        sphere_y: update_y,
        sphere_z: update_z,
    };

    functions_by_tag[e.target.controller.tag](e);
}
