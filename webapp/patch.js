console.log("Super-Patch.js: Handling GitHub Data Routes...");

// Ghost Server for GitHub
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url; 
    return originalOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    if (this._url && (this._url.includes(":5006") || this._url.includes("/ledger") || this._url.includes("/user"))) {
        console.log("Ghost-answering API -> " + this._url);
        Object.defineProperty(this, 'status', { writable: false, value: 200 });
        Object.defineProperty(this, 'readyState', { writable: false, value: 4 });
        Object.defineProperty(this, 'responseText', { writable: false, value: '{"success":true}' });
        this.dispatchEvent(new Event('load'));
        return; 
    }
    return originalSend.apply(this, arguments);
};

// Data Fetcher
window.downloadLinkedGame = function(guid) {
    console.log("Fetching local .data: " + guid);
    fetch("./" + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};