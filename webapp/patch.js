console.log("Super-Patch.js: GitHub Force-Path Mode Active.");

// 1. THE HIJACKER: This fixes the 404 by forcing the correct GitHub path
const repoName = "/science-frcwork/"; // The name of your GitHub repo

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    let finalUrl = url;

    // If the engine asks for data/wasm, force it into the webapp folder
    if (url === "index_stripped.data" || url === "index_stripped.wasm") {
        finalUrl = repoName + "webapp/" + url;
    }
    
    // If it's looking for the specific game level data
    if (url.includes("6208082864562F76.data")) {
        finalUrl = repoName + "6208082864562F76.data";
    }

    // Ghost Server for API calls (User/Ledger)
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

// 2. Local Game Data Downloader
window.downloadLinkedGame = function(guid) {
    console.log("Patch: Manually fetching " + guid);
    fetch(repoName + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};