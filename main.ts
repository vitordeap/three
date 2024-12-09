import { primitives, colors, booleans } from '@jscad/modeling';

let scale_var: number = 1; // the heart of rendering, as themes, controls, etc change
let updateView = true;

document.getElementById('scaleup')?.addEventListener('click', scaleup);
document.getElementById('scaledown')?.addEventListener('click', scaledown);

function scaleup(): void {
    console.log('scaling up');
    scale_var = scale_var + 1;
    entities = generate_entities({ scale: scale_var });
    generate_render_options(entities);
    updateView = true;
}

function scaledown(): void {
    console.log('scaling down');
    scale_var = scale_var - 1;
    updateView = true;
}
// ********************
// The design to render.
// ********************

const { intersect, subtract } = booleans;
const { colorize } = colors;
const { cube, cuboid, line, sphere, star } = primitives;

const demo = (parameters) => {
    const logo = [
        colorize(
            [1.0, 0.4, 1.0],
            subtract(
                cube({ size: 300 * parameters.scale }),
                sphere({ radius: 200 * parameters.scale, segments: 100 }),
            ),
        ),
        colorize(
            [1.0, 1.0, 0],
            intersect(
                sphere({ radius: 130 * parameters.scale, segments: 100 }),
                cube({ size: 210 * parameters.scale }),
            ),
        ),
    ];

    const transpCube = colorize(
        [1, 0, 0, 0.75],
        cuboid({
            size: [
                100 * parameters.scale,
                100 * parameters.scale,
                210 + 200 * parameters.scale,
            ],
        }),
    );
    const star2D = star({
        vertices: 8,
        innerRadius: 300 * parameters.scale,
        outerRadius: 400 * parameters.scale,
    });
    const line2D = colorize(
        [1.0, 0, 0],
        line([
            [260, 260],
            [-260, 260],
            [-260, -260],
            [260, -260],
            [260, 260],
        ]),
    );
    // some colors are intentionally without alpfa channel to test geom2ToGeometries will add alpha channel
    const colorChange = [
        [1, 0, 0, 1],
        [1, 0.5, 0],
        [1, 0, 1],
        [0, 1, 0],
        [0, 0, 0.7],
    ];
    star2D.sides.forEach((side, i) => {
        if (i >= 2) side.color = colorChange[i % colorChange.length];
    });

    return [transpCube, star2D, line2D, ...logo];
};

// ********************
// Renderer configuration and initiation.
// ********************
import {
    prepareRender,
    drawCommands,
    cameras,
    controls,
    entitiesFromSolids,
} from '@jscad/regl-renderer';
import { Entity } from '@jscad/regl-renderer/types/geometry-utils-V2/entity';

const perspectiveCamera = cameras.perspective;
const orbitControls = controls.orbit;

const containerElement = document.getElementById('jscad')!;

const width = containerElement.clientWidth;
const height = containerElement.clientHeight;

const state = {};

// prepare the camera
state.camera = Object.assign({}, perspectiveCamera.defaults);
perspectiveCamera.setProjection(state.camera, state.camera, { width, height });
perspectiveCamera.update(state.camera, state.camera);

// prepare the controls
state.controls = orbitControls.defaults;

// prepare the renderer
const setupOptions = {
    glOptions: { container: containerElement },
};
const renderer = prepareRender(setupOptions);

const gridOptions = {
    visuals: {
        drawCmd: 'drawGrid',
        show: true,
    },
    size: [500, 500],
    ticks: [25, 5],
    // color: [0, 0, 1, 1],
    // subColor: [0, 0, 1, 0.5]
};

const axisOptions = {
    visuals: {
        drawCmd: 'drawAxis',
        show: true,
    },
    size: 300,
    // alwaysVisible: false,
    // xColor: [0, 0, 1, 1],
    // yColor: [1, 0, 1, 1],
    // zColor: [0, 0, 0, 1]
};

const doRotatePanZoom = () => {
    if (rotateDelta[0] || rotateDelta[1]) {
        const updated = orbitControls.rotate(
            {
                controls: state.controls,
                camera: state.camera,
                speed: rotateSpeed,
            },
            rotateDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        updateView = true;
        rotateDelta = [0, 0];
    }

    if (panDelta[0] || panDelta[1]) {
        const updated = orbitControls.pan(
            { controls: state.controls, camera: state.camera, speed: panSpeed },
            panDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        panDelta = [0, 0];
        state.camera.position = updated.camera.position;
        state.camera.target = updated.camera.target;
        updateView = true;
    }

    if (zoomDelta) {
        const updated = orbitControls.zoom(
            {
                controls: state.controls,
                camera: state.camera,
                speed: zoomSpeed,
            },
            zoomDelta,
        );
        state.controls = { ...state.controls, ...updated.controls };
        zoomDelta = 0;
        updateView = true;
    }
};

function generate_entities(params) {
    return entitiesFromSolids({}, demo(params));
}
let entities = generate_entities({ scale: scale_var });

// assemble the options for rendering
function generate_render_options(entities) {
    return {
        camera: state.camera,
        drawCommands: {
            drawAxis: drawCommands.drawAxis,
            drawGrid: drawCommands.drawGrid,
            drawLines: drawCommands.drawLines,
            drawMesh: drawCommands.drawMesh,
        },
        // define the visual content
        entities: [gridOptions, axisOptions, ...entities],
    };
}
let renderOptions = generate_render_options(entities);

const updateAndRender = () => {
    console.log(`updateView is: ${updateView}`);
    doRotatePanZoom();

    if (updateView) {
        const updates = orbitControls.update({
            controls: state.controls,
            camera: state.camera,
        });
        state.controls = { ...state.controls, ...updates.controls };
        updateView = state.controls.changed; // for elasticity in rotate / zoom

        state.camera.position = updates.camera.position;
        perspectiveCamera.update(state.camera);
        const updated_entities = generate_entities({ scale: scale_var });
        const updated_renderOptions = generate_render_options(updated_entities);
        renderer(updated_renderOptions);
    }
    window.requestAnimationFrame(updateAndRender);
};
window.requestAnimationFrame(updateAndRender);

// convert HTML events (mouse movement) to viewer changes
let lastX = 0;
let lastY = 0;

const rotateSpeed = 0.002;
const panSpeed = 1;
const zoomSpeed = 0.08;
let rotateDelta = [0, 0];
let panDelta = [0, 0];
let zoomDelta = 0;
let pointerDown = false;

const moveHandler = (ev) => {
    if (!pointerDown) return;
    const dx = lastX - ev.pageX;
    const dy = ev.pageY - lastY;

    const shiftKey =
        ev.shiftKey === true || (ev.touches && ev.touches.length > 2);
    if (shiftKey) {
        panDelta[0] += dx;
        panDelta[1] += dy;
    } else {
        rotateDelta[0] -= dx;
        rotateDelta[1] -= dy;
    }

    lastX = ev.pageX;
    lastY = ev.pageY;

    ev.preventDefault();
};
const downHandler = (ev) => {
    pointerDown = true;
    lastX = ev.pageX;
    lastY = ev.pageY;
    containerElement.setPointerCapture(ev.pointerId);
};

const upHandler = (ev) => {
    pointerDown = false;
    containerElement.releasePointerCapture(ev.pointerId);
};

const wheelHandler = (ev) => {
    zoomDelta += ev.deltaY;
    ev.preventDefault();
};

containerElement.onpointermove = moveHandler;
containerElement.onpointerdown = downHandler;
containerElement.onpointerup = upHandler;
containerElement.onwheel = wheelHandler;
