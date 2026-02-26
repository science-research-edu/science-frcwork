console.log("Super-Patch.js: GitHub Mode Active.");

// 1. URL Hijacker: Forces the browser to look in /webapp/ for the engine data
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    // If the game asks for index_stripped.data without the folder name
    if (url === "index_stripped.data" || url === "index_stripped.wasm") {
        url = "webapp/" + url;
        console.log("Patch: Redirecting engine request to -> " + url);
    }
    
    // Ghost Server logic for API calls
    if (url.includes(":5006") || url.includes("/ledger") || url.includes("/user")) {
        this._isGhost = true;
    }

    this._url = url;
    return originalOpen.apply(this, arguments);
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
    console.log("Patch: Fetching local game .data -> " + guid);
    fetch("./" + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};