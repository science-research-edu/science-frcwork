console.log("Super-Patch.js: GitHub Redirect Active.");

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    // FORCE REDIRECT: If looking for engine data at the root, point to webapp/
    if (url === "index_stripped.data" || url === "index_stripped.wasm") {
        url = "webapp/" + url;
        console.log("Patch: Redirecting engine data to: " + url);
    }
    
    // Fix for the game data itself
    if (url.includes("6208082864562F76.data")) {
        url = "./6208082864562F76.data";
    }

    this._url = url;
    return originalOpen.apply(this, arguments);
};

// Data Downloader
window.downloadLinkedGame = function(guid) {
    console.log("Patch: Manually fetching " + guid);
    fetch("./" + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};