// Defining Consts
const canvas = document.getElementById("canvas");
const queryParams = new URLSearchParams(window.location.search);

// Initiating scene
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
scene.animationsEnabled = false;

// Add a camera to the scene
const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
camera.attachControl(canvas, true);
camera.zoomOnFactor = 1.2;

// Configure Inputs for the ArcRotateCamera
const inputsManager = new BABYLON.ArcRotateCameraInputsManager(camera);
inputsManager.addMouseWheel();
camera.inputs.attached.mousewheel.wheelDeltaPercentage = 0.01;

// Adding ambient lighting from up and down
const lightUp = new BABYLON.HemisphericLight("lightUp", new BABYLON.Vector3(0, 1, 0));
const lightDown = new BABYLON.HemisphericLight("lightDown", new BABYLON.Vector3(0, -1, 0));

// Loading Scene
BABYLON.SceneLoader.Append(`https://3d-model-extension-backend.theultimatekeva.repl.co/s/models/${queryParams.get("model")}/`, "scene.gltf", scene, (scene) => {
    scene._activeCamera.zoomOn(scene.meshes); // Zooming to show the whole mesh
});

// Resizing Canvas
window.addEventListener("resize", resizer);
engine.runRenderLoop(() => scene.render());
resizer();

function resizer() {
    document.body.style.height = window.innerHeight + "px";
    engine.resize();
}