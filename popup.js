// Declare consts
const viewer = chrome.runtime.getURL("./viewer.html");

// Launch a new Window for the 3D viewer
document.getElementById("launcher").addEventListener("click", () => {
    chrome.windows.create({ height: 400, width: 500, focused: true, type: "popup", url: viewer });
});