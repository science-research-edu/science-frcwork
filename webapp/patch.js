console.log("Super-Patch.js: Initializing full local bypass...");

window.firebase = window.firebase || {};

// 1. Mock Analytics
window.firebase.analytics = () => ({ logEvent: () => {}, setCurrentScreen: () => {}, setUserId: () => {} });

// 2. Mock RemoteConfig
window.firebase.remoteConfig = () => ({
    fetchAndActivate: () => Promise.resolve(true),
    getValue: () => ({ asString: () => "", asNumber: () => 0, asBoolean: () => false }),
    getString: () => "", getNumber: () => 0, getAll: () => ({})
});

// 3. Mock Auth
window.firebase.auth = () => {
    let dummyUser = { isAnonymous: true, uid: "local-player-123", getIdToken: () => Promise.resolve("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-x9") };
    return { onAuthStateChanged: (cb) => setTimeout(() => cb(dummyUser), 10), currentUser: dummyUser, signInAnonymously: () => Promise.resolve({ user: dummyUser }) };
};

// 4. THE GHOST SERVER (Fixes "Showing long time loading message")
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url; 
    return originalOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    // If the game asks for User, Ledger, or Games data from the fake server
    if (this._url && (this._url.includes(":5006") || this._url.includes("/ledger") || this._url.includes("/user") || this._url.includes("/games2"))) {
        console.log("Super-Patch.js: Ghost-answering API request -> " + this._url);
        
        // We manually trigger a 'Success' response so the game doesn't wait
        Object.defineProperty(this, 'status', { writable: false, value: 200 });
        Object.defineProperty(this, 'readyState', { writable: false, value: 4 });
        Object.defineProperty(this, 'responseText', { writable: false, value: '{"success":true, "g":[], "v":[]}' });
        
        this.dispatchEvent(new Event('load'));
        return; 
    }
    return originalSend.apply(this, arguments);
};

// 5. Local Downloader
window.downloadLinkedGame = function(guid) {
    console.log("Super-Patch.js: Fetching local game data -> " + guid);
    fetch("./" + guid + ".data")
        .then(r => r.blob())
        .then(blob => {
            window.singleGameBlob = blob;
            window.gameDownloadProgressFrac = 1;
            if (typeof updateLoadProgress === "function") updateLoadProgress();
        });
};

window.initPokiSdk = () => { window.pokiInited = true; };
window.adInterstitialShow = () => { if(typeof setGameFocus === "function") setGameFocus(true); };

console.log("Super-Patch.js: Bypass Complete.");