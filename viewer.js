// Defining Consts
const canvas = document.getElementById("canvas");
const followDiv = document.getElementById("followDiv");
const followInput = document.getElementById("followInput");
const coverDiv = document.getElementById("coverDiv");

// Query
const queryParams = new URLSearchParams(window.location.search);
const room = queryParams.get("name")
const hostKey = queryParams.get("hostkey");

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
const lightUp = new BABYLON.HemisphericLight("lightUp", new BABYLON.Vector3(0, 5, 0));
const lightDown = new BABYLON.HemisphericLight("lightDown", new BABYLON.Vector3(0, -5, 0));

// Loading Scene
BABYLON.SceneLoader.Append(`https://3d-model-extension-backend.theultimatekeva.repl.co/s/models/${queryParams.get("model")}/`, "scene.gltf", scene, (scene) => {
    scene._activeCamera.zoomOn(scene.meshes); // Zooming to show the whole mesh
});

// Rendering and Canvas Sizing
window.addEventListener("resize", resizer);
engine.runRenderLoop(() => scene.render());
resizer();

function resizer() {
    document.body.style.height = window.innerHeight + "px";
    engine.resize();
}

// Establish connection with WebSocket Server
const ws = new WebSocket("wss://3d-model-extension-backend.theultimatekeva.repl.co/");
window.targetPos = camera.position;
window.targetRadius = camera.radius;

if(hostKey) {
    ws.onmessage = res => {
        let message = JSON.parse(res.data);
        console.log(message);
        
        // Authorization
        if(message[0] == "auth") ws.send(JSON.stringify(["auth", "host", room, hostKey]));
        
        // On successful authorization
        if(message[0] == "authR") {
            let pos = camera.position;
            setInterval(() => ws.send(JSON.stringify(["a", room, hostKey, pos._x, pos._y, pos._z, camera.radius])), 16);
        }
    }
} else {
    // Adding follow / unfollow host
    window.follow = true;
    followDiv.style.display = "block";
    coverDiv.style.display = "block";
    followInput.checked = true;
    followInput.addEventListener("click", e => {
        window.follow = e.target.checked;
        coverDiv.style.display = e.target.checked ? "block" : "none";
    });
    
    ws.onmessage = res => {
        let message = JSON.parse(res.data);
        console.log(message);
        
        // Authorization
        if(message[0] == "auth") ws.send(JSON.stringify(["auth", "clnt", room, queryParams.get("pass")]));

        // On successful authorization
        if(message[0] == "authR") {
            scene.registerBeforeRender(() => {
                if(!window.follow) return;
                camera.position = BABYLON.Vector3.Lerp(camera.position, window.targetPos, 0.1);
                camera.radius = targetRadius;
            });
        }

        // Handling movement
        if(message[0] == "a") {
            targetPos = new BABYLON.Vector3(message[1], message[2], message[3]);
            targetRadius = message[4];
        }
    }
}