// Declare consts
const api = "https://3d-model-extension-backend.theultimatekeva.repl.co/api/";
const nameInput = document.getElementById("name");
const passInput = document.getElementById("pass");
const selectInput = document.getElementById("model");
const joinBtn = document.getElementById("joinBtn");
const hostBtn = document.getElementById("hostBtn");
const viewer = chrome.runtime.getURL("./viewer.html");
let models = [];

// Load models
getJSON(api + "models").then(data => {
    models = data;
    selectInput.innerHTML += models.map(d => `<option>${d[1]["name"]}</option>`).join("\n");
});

// Button Events
joinBtn.addEventListener("click", joinRoom);
hostBtn.addEventListener("click", hostRoom);

// Join Room Handler
async function joinRoom() {
    let name = nameInput.value;
    let pass = passInput.value;
    if(!(name && pass)) return alert("Please enter a room name and password");

    let res = await postData(api + "joinroom", { name, pass });
    if(res.status == 404) return alert("Couldn't find room!");
    if(res.status == 401) return alert("Invalid Password!");
    if(res.status != 200) return alert("An unknown error occured!");
    
    let room = await res.json();
    console.log(room);
}

async function hostRoom() {
    let name = nameInput.value;
    let pass = passInput.value;
    let modelName = selectInput.value;

    if(!(name && pass)) return alert("Please enter a room name and password");
    if(modelName == "Select Model") return alert("Please select a valid model");
    let model = models.find(d => d[1].name == modelName)[0];

    let res = await postData(api + "createroom", { name, pass, model });
    if(res.status == 406) return alert(`Room with name "${name}" already exists!`);
    if(res.status == 404) return alert("There was an error resolving the model!");
    if(res.status != 201) return alert("An unknown error occured!");

    let room = await res.json();
    console.log(room);
}

// HTTP Functions
async function getJSON(url) {
    return await (await fetch(url)).json();
}

async function postData(url, data) {
    return await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}