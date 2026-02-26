console.log("Super-Patch.js: GitHub Pathing Active.");

// FORCE ENGINE PATHS
// This intercepts every request the game makes and adds the folder name
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    let finalUrl = url;

    // If it's looking for engine files, force them into the webapp folder
    if (url === "index_stripped.data" || url === "index_stripped.wasm") {
        finalUrl = "webapp/" + url;
    }

    // If it's looking for the game data file
    if (url.includes("6208082864562F76.data")) {
        finalUrl = "./6208082864562F76.data";
    }

    // Ghost Server for API calls
    if (url.includes(":5006") || url.includes("/ledger") || url.includes("/user")) {
        this._isGhost = true;
    }

    return originalOpen.apply(this, [method, finalUrl]);
};

const originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
    if (this._isGhost) {
        Object.defineProperty(this, 'status', { writable: false, value: 200 });
        Object.defineProperty(this, 'readyState', { writable: false, value: 4 });
        Object.defineProperty(this, 'responseText', { writable: false, value: '{"success":true}' });
        this.dispatchEvent(new Event('load'));
        return;
    }
    return originalSend.apply(this, arguments);
};

// Data Downloader
window.downloadLinkedGame = function(guid) {
    console.log("Patch: Fetching " + guid);
    fetch("./" + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};