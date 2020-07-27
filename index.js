function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

addStyle(`
    #player-container {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: black;
        user-select: none;
    }

    #player-toggle {
        position: absolute;
        top: 0;
        width: 100%;
        height: 33%;
        user-select: none;
    }

    #player-container.twitch {
        display: none;
    }

    #toggle {
        display: none;
        position: absolute;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        height: 18px;
        line-height: 10px;
        font-size: 10px;
        padding: 4px 10px;
        top: 20px;
        right: 20px;
        border-radius: 9px;
    }

    #player-toggle:hover #toggle {
        display: block;
    }

    #control-hover {
        position: absolute;
        height: 40%;
        width: 100%;
        bottom: 0;
    }

    #control-hover:hover #controls {
        display: block;
    }

    video {
        position: absolute;
    }

    #fullscreen, #play, #pause, #volume-container, #seek-outer {
        bottom: 20px;
        height: 20px;
    }

    .control {
        position: absolute;
        cursor: pointer;
    }

    #live {
        height: 8px;
        width: 8px;
        border-radius: 4px;
        bottom: 26px;
        right: 130px;
    }

    #live.live, #live.vod:hover {
        background-color: red;
        box-shadow: 0 0 4px red;
    }

    #live.vod {
        background-color: #555;
        box-shadow: 0 0 4px #555;
    }

    #live.vod:hover #go-live {
        display: flex;
        left: -26px;
        bottom: 14px;
    }

    #controls {
        display: none;
        position: absolute;
        bottom: 0;
        height: 60px;
        width: 100%;
        background-image: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1));
        font-size: 10px;
        line-height: 10px;
        font-weight: 600;
        font-family: sans-serif;
    }

    #volume {
        bottom: 21px;
    }

    #volume-container {
        width: 115px;
        overflow: hidden;
        left: 80px;
    }

    #seek-outer {
        width: calc(100% - 450px);
        left: 230px;
    }

    #seek-container {
        overflow: hidden;
        width: 100%;
        height: 20px;
    }

    #seek-outer:hover #seek-tooltip {
        display: flex;
    }

    .tooltip {
        display: none;
        width: 60px;
        flex-direction: column;
        align-items: center;
        left: -30px;
        bottom: 18px;
        height: 26px;
    }

    .tooltip-text {
        width: 100%;
        border-radius: 4px;
        height: 18px;
        box-sizing: border-box;
        padding: 4px 6px;
        text-align: center;
    }

    #tooltip-text {
        background-color: white;
    }

    .triangle {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
    }

    #tooltip-triangle {
        border-top: 10px solid white;
    }

    #go-live-text {
        background-color: red;
        color: white;
    }

    #go-live-triangle {
        border-top: 10px solid red;
    }

    .slider-empty, .slider, .slider-filled, .slider-handle {
        pointer-events: none;
    }

    .slider-empty {
        height: 2px;
        border: 1px solid rgba(0, 0, 0, .2);
        background-color: rgba(255, 255, 255, .2);
        width: 100%;
        left: 0;
        top: 8px;
    }

    .slider-filled {
        top: 9px;
        height: 2px;
        width: calc(100% - 4px);
        background-color: white;
    }

    .slider-handle {
        background-color: white;
        border-radius: 7px;
        border: 0.5px solid rgba(0, 0, 0, .2);
        right: 0.5px;
        top: 2.5px;
        width: 14px;
        height: 14px;
    }

    #fullscreen {
        right: 20px;
    }

    #play, #pause {
        left: 20px;
    }

    #play {
        display: none;
    }

    #volume {
        left: 60px;
    }

    #quality {
        bottom: 20px;
        height: 20px;
        right: 60px;
        box-sizing: border-box;
        padding: 4px 6px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 9px;
    }

    #timer {
        bottom: 19.5px;
        height: 20px;
        left: calc(100% - 210px);
        box-sizing: border-box;
        padding: 4px 6px;
        color: white;
    }

    #quality-picker {
        bottom: 42px;
        right: 60px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 0;
        border-radius: 2px;
    }

    .picker {
        text-align: right;
        padding: 4px 7.5px;
    }

    .picker:hover {
        background-color: rgba(255, 255, 255, .2);
    }
`);


let mediaSrc = new MediaSource();
let arrayOfBlobs = [];
let player = null;
let volume = null;
let seekTooltip = null;
let seekTooltipText = null;
let seekContainer = null;
let seekSlider = null;
let generation = 0;
let vodOffset = 0;
let videoMode = 'live';
let playerType = localStorage.getItem("twitch-dvr:player-type") ? localStorage.getItem("twitch-dvr:player-type") : "dvr";

const bufferLimit = 200;
const handleRadius = 7.25;
const vodDeadzone = 15;
const vodDeadzoneBuffer = 15;

function hideCursor() {
    if (paused) return;
    if (document.getElementById("player-container")) {
        document.getElementById("player-container").style.cursor = 'none';
        document.getElementById("controls").style.display = 'none';
    }
}

let cursorTimer = null;
function showCursor() {
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = null;
    if (document.getElementById("player-container")) {
        document.getElementById("player-container").style.cursor = '';
        document.getElementById("controls").style.display = 'block';
    }
}

function showCursorForAWhile() {
    showCursor();
    cursorTimer = setTimeout(hideCursor, 2000);
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    } else {
        const element = document.getElementById("player-container");
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.removeEventListener('mousemove', showCursorForAWhile);
        showCursor();
        if (document.getElementById("controls")) {
            document.getElementById("controls").style.display = '';
        }
    } else {
        showCursorForAWhile();
        document.addEventListener('mousemove', showCursorForAWhile);
    }
});

async function getVODUrl(channel, clientId) {
    let resp = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        headers: {
            'client-id': clientId,
        },
        body: JSON.stringify([{
            operationName: "HomeOfflineCarousel",
            variables: {
                channelLogin: channel,
                includeTrailerUpsell: false,
                trailerUpsellVideoID: ""
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: "0c97fdcb4e0366b25ae35eb89cc932ecbbb056f663f92735d53776602e4e94c5",
                }
            },
        }]),
    });
    let json = await resp.json();
    const vodId = json[0].data.user.archiveVideos.edges[0].node.id;

    resp = await fetch(`https://api.twitch.tv/api/vods/${vodId}/access_token`, {
        headers: {
            'client-id': clientId,
        },
    });

    json = await resp.json();
    const token = json.token;
    const sig = json.sig;

    resp = await fetch(`https://usher.ttvnw.net/vod/${vodId}.m3u8?allow_source=true&playlist_include_framerate=true&reassignments_supported=true&sig=${sig}&token=${encodeURI(token)}`);
    const text = await resp.text();
    return parseMasterManifest(text);
}

async function bufferVOD(url, time, first) {
    const vodSegmentLen = 10;
    const startGeneration = generation;

    const idx = Math.floor(time / vodSegmentLen);
    const baseURL = vodURLs[variantIdx];
    totalElapsed = time;
    vodOffset = time % vodSegmentLen;

    if (!sourceBuffer.buffered.length || sourceBuffer.buffered.end(0) - player.currentTime < 0) {
        first = true;
    }
    const bufferAmount = Math.max(0, Math.min(bufferLimit / 2, maxTime - time - vodDeadzone));
    const toBuffer = first ? Math.floor(bufferAmount / vodSegmentLen) : Math.max(0, Math.floor((bufferAmount - sourceBuffer.buffered.end(0) + player.currentTime) / vodSegmentLen));
    const toDownload = [];
    for (let i = idx; i < idx + toBuffer; i++) {
        toDownload.push(`${baseURL}${i}.ts`);
    }
    const count = await downloadSegments(startGeneration, Promise.resolve(), toDownload);
    if (generation !== startGeneration) return;
    vodTimer = setTimeout(() => bufferVOD(url, time + vodSegmentLen * count, false), getRemainingBudget(vodSegmentLen * 1000));
}

let lastFetched = new Set();
let paused = true;
let firstTime = true;
let totalElapsed = 0;
let timestampOffset = 0;

async function bufferLive(url) {
    const resp = await fetch(url);
    const m3u8 = await resp.text();
    const segments = [];
    const fetched = new Set();

    const lines = m3u8.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let segment = null;
        if (line.substring(0, 8) === "#EXTINF:") {
            segment = lines[i+1];
        } else if (line.substring(0, 23) === "#EXT-X-TWITCH-PREFETCH:") {
            segment = line.substring(23);
        } else if (line.substring(0, 25) === "#EXT-X-TWITCH-TOTAL-SECS:") {
            totalElapsed = parseFloat(line.substring(25));
        }

        if (segment) {
            fetched.add(segment);

            if (!lastFetched.has(segment)) {
                totalElapsed -= (budget / 1000);
                segments.push(segment);
            }
        }
    }

    lastFetched = fetched;

    if (segments.length > 3) return segments.slice(segments.length - 3);

    return segments;
}

function parseMasterManifest(m3u8) {
    const lines = m3u8.split("\n");
    const variants = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.substring(0, 18) === "#EXT-X-STREAM-INF:") {
            const parts = line.substring(18).split(",");
            const variant = {};
            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                const vals = part.split('=');
                switch (vals[0]) {
                    case "BANDWIDTH":
                        variant.bandwidth = parseInt(vals[1]);
                        break;
                    case "RESOLUTION":
                        variant.resolution = `${vals[1].split('x')[1]}p`;
                        break;
                    case "CODECS":
                        variant.codecs = `${vals[1]},${parts[j+1]}`;
                        break;
                    case "VIDEO":
                        variant.name = vals[1];
                        break;
                    case "FRAME-RATE":
                        variant.framerate = Math.ceil(parseFloat(vals[1]));
                        break;
                }
            }
            if (variant.framerate !== 30) {
                variant.resolution += variant.framerate;
            }
            variant.url = lines[i+1];
            variants.push(variant);
        }
    }

    return variants;
}

async function getLiveM3U8(channel, clientId) {
    let resp = await fetch(`https://api.twitch.tv/api/channels/${channel}/access_token`, {
        headers: {
            'client-id': clientId,
        },
    });

    const json = await resp.json();
    const token = json.token;
    const sig = json.sig;

    resp = await fetch(`https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?allow_source=true&fast_bread=true&playlist_include_framerate=true&reassignments_supported=true&sig=${sig}&token=${encodeURI(token)}`);
    const text = await resp.text();

    const parsed = parseMasterManifest(text);
    return parsed;
}

async function appendToSourceBuffer() {
    if (!sourceBuffer) return;

    await Promise.resolve();

    if (mediaSrc.readyState === "open" && sourceBuffer && sourceBuffer.updating === false && arrayOfBlobs.length > 0) {
        const blob = arrayOfBlobs.shift();
        sourceBuffer.appendBuffer(blob);
    }
}

let lastPlayerTime = -1;
let lastRealTime = -1;

function afterBufferUpdate() {
    if (!sourceBuffer) return;

    const numBuffers = sourceBuffer.buffered.length;
    if (numBuffers > 1) {
        if (lastRealTime > 0) {
            const realDiff = Date.now() - lastRealTime;
            const playerDiff = player.currentTime - lastPlayerTime;

            if (realDiff - playerDiff * 1000 > 200) {
                pause();
                play();
                return;
            }
        }
    }
    lastPlayerTime = player.currentTime;
    lastRealTime = Date.now();

    if (firstTime && numBuffers) {
        const startTime = sourceBuffer.buffered.start(0) + (videoMode === "vod" ? vodOffset : 0);

        timestampOffset = totalElapsed - startTime;
        player.currentTime = startTime;
        if (videoMode === "live") {
            timeOrigin = Date.now();
            timeOriginPlayerTime = startTime;
        }
        if (!paused) setTimeout(() => player.play(), 0);
        firstTime = false;
    } else if (numBuffers && player.currentTime < sourceBuffer.buffered.start(0)) {
        player.currentTime = sourceBuffer.buffered.start(0);
    }

    if (sourceBuffer.updating === false && numBuffers && player.buffered.end(0) - player.buffered.start(0) > bufferLimit) {
        sourceBuffer.remove(player.buffered.start(0), player.buffered.end(0) - bufferLimit);
    }
}

let rebufferTimer = null;
let vodTimer = null;
let variantIdx = 0;
const budget = 2000;
let budgetEnd = 0;
let variants = [];
let vodVariants = [];
let vodURLs = [];
let maxTime = 1;
let timeOrigin = 0;
let timeOriginPlayerTime = 0;

function clearTimers() {
    if (sourceBuffer) {
        sourceBuffer.abort();
        let maxBuffered = 0;
        for (let i = 0; i < sourceBuffer.buffered.length; i++) {
            if (sourceBuffer.buffered.end(i) > maxBuffered) {
                maxBuffered = sourceBuffer.buffered.end(i);
            }
        }
        
        if (maxBuffered > 0) {
            sourceBuffer.remove(0, maxBuffered);
        }
    }
    generation++;
    if (rebufferTimer) {
        clearTimeout(rebufferTimer);
        rebufferTimer = null;
    }
    if (vodTimer) {
        clearTimeout(vodTimer);
        vodTimer = null;
    }
    arrayOfBlobs = [];
}

function pause() {
    if (!document.getElementById("pause")) return;

    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "block";

    if (videoMode === "vod") {
        player.pause();
        paused = true;
        return;
    }

    lastFetched = new Set();
    clearTimers();
    paused = true;
    document.getElementById("controls").style.display = "block";
}

function play() {
    document.getElementById("play").style.display = "none";
    document.getElementById("pause").style.display = "block";
    if (videoMode === "vod") {
        player.play();
        paused = false;
        return;
    }

    if (paused) {
        rebuffer();
        paused = false;
        firstTime = true;
    }
    if (document.fullscreenElement) {
        showCursorForAWhile();
    } else {
        document.getElementById("controls").style.display = "";
    }
}

function getSeekWidth() {
    const container = document.getElementById("player-container");
    if (!container) return 0;
    return container.getBoundingClientRect().width - 450;
}

function getTimeAtOffset(offsetX) {
    const width = getSeekWidth();
    if (offsetX < handleRadius) return 0;
    else if (width - offsetX < handleRadius) return maxTime;
    else return (offsetX - handleRadius) / (width - 2*handleRadius) * maxTime;
}

function seek(ev) {
    const seekTime = getTimeAtOffset(ev.offsetX);
    seekToTime(seekTime);
}

function seekToTime(seekTime) {
    if (maxTime - seekTime < vodDeadzoneBuffer + vodDeadzoneBuffer) {
        golive();
        return;
    }

    const width = getSeekWidth();
    seekSlider.style.width = `${(width - 2*handleRadius) * seekTime / maxTime + 2*handleRadius}px`;
    const timer = document.getElementById("timer");
    if (timer) timer.innerHTML = formatTime(seekTime);

    const buffered = sourceBuffer.buffered;
    const videoTime = seekTime - timestampOffset;
    if (videoMode === "vod" && buffered.length && buffered.start(0) <= videoTime && buffered.end(0) >= videoTime) {
        player.currentTime = videoTime;
        return;
    }
    clearTimers();

    switchMode('vod');
    firstTime = true;
    bufferVOD(vodVariants[variantIdx], seekTime, true);
}

function golive() {
    if (videoMode === "live") return;

    clearTimers();
    switchMode('live');
    paused = true;
    play();
}

function togglePicker() {
    const picker = document.getElementById("quality-picker");
    const pickerOpen = picker.style.display === "block";
    if (pickerOpen) {
        document.removeEventListener("click", togglePicker);
    } else {
        setTimeout(() => document.addEventListener("click", togglePicker), 1);
    }
    picker.style.display = pickerOpen ? "none" : "block";
}

function togglePlayer() {
    let typeName = 'Twitch';
    if (playerType === 'dvr') {
        typeName = 'DVR';
        playerType = 'twitch';
        pause();
        for (const video of document.querySelectorAll(".video-player__container video")) {
            if (video.id !== "player") {
                video.play();
                break;
            }
        }
    } else {
        playerType = 'dvr';
        switchChannel();
    }
    
    localStorage.setItem("twitch-dvr:player-type", playerType);
    document.querySelector("#player-toggle #toggle").innerText = `Switch to ${typeName} player`;
    document.getElementById("player-container").className = playerType;
}

let bufferPromise = null;

async function downloadSegments(startGeneration, lastPromise, segments) {
    let count = 0;
    for (const segment of segments) {
        if (startGeneration !== generation) break;
        try {
            const resp = await fetch(segment);
            if (startGeneration !== generation) break;

            const bytes = await resp.arrayBuffer();
            if (startGeneration !== generation) break;
            await lastPromise;
            if (startGeneration !== generation) break;
            arrayOfBlobs.push(bytes);
            appendToSourceBuffer();
            count++;
        } catch(e) {
            console.log(`Warning: failed to fetch: ${e}, stopping download early`)
            break;
        }
    }
    return count;
}

function getRemainingBudget(incr) {
    budgetEnd += incr;
    const remaining = Math.max(0, budgetEnd - Date.now());
    if (remaining === 0) budgetEnd = Date.now();
    return remaining;
}

const rebuffer = async function() {
    const startGeneration = generation;

    const segments = await bufferLive(variants[variantIdx].url);
    bufferPromise = downloadSegments(startGeneration, bufferPromise, segments);

    if (generation === startGeneration) {
        rebufferTimer = setTimeout(rebuffer, getRemainingBudget(budget));
    }
};

function setVolume(vol) {
    vol = Math.min(1, Math.max(0, vol));
    localStorage.setItem('twitch-dvr:vol', vol);
    player.volume = vol;
    volume.style.width = `${vol * 100 + handleRadius * 2}px`;
}

function setVariant(idx) {
    if (!document.getElementById("quality-picker")) return;
    idx = Math.max(0, Math.min(idx, variants.length - 1));
    localStorage.setItem("twitch-dvr:variant", idx);
    document.getElementById("quality-picker").style.display = "none";  
    variantIdx = idx

    if (!variants[idx]) return;
    document.getElementById("quality").innerText = variants[idx].resolution;

    if (videoMode === "live") {
        const variant = variants[idx];
        lastFetched = new Set();
        if (sourceBuffer) {
            if (!paused) pause();
            budgetEnd = Date.now();
            play();
        } else {
            mediaSrc.addEventListener("sourceopen", function() {
                sourceBuffer = mediaSrc.addSourceBuffer(`video/mp2t; codecs=${variant.codecs}`);
                sourceBuffer.addEventListener("updateend", () => {
                    afterBufferUpdate();
                    appendToSourceBuffer();
                });
                sourceBuffer.addEventListener("error", (buffer, ev) => {
                    console.warn("Failed to append to buffer");
                });
                budgetEnd = Date.now();
                play();
            });
        }
    } else {
        const variant = vodVariants[idx];
        const currTime = player.currentTime + timestampOffset;
        clearTimers();
        bufferVOD(variant, currTime, true);
    }
}

function switchMode(mode) {
    videoMode = mode;
    budgetEnd = Date.now();
    document.getElementById("live").className = "control " + mode;
    if (mode === 'live') seekSlider.style.width = '100%';
}

function formatTime(secs) {
    secs = Math.floor(secs);
    const hours = Math.floor(secs / 3600);
    let mins = Math.floor(secs / 60) % 60;
    secs = secs % 60;
    if (secs < 10) secs = `0${secs}`;
    if (hours > 0 && mins < 10) mins = `0${mins}`;
    return hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
}

async function switchChannel() {
    if (playerType === 'twitch') return;

    mediaSrc = new MediaSource();
    const url = URL.createObjectURL(mediaSrc);
    sourceBuffer = null;
    switchMode('live');
    
    const channel = document.location.pathname.split('/')[1];
    const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
    document.getElementById("quality-picker").innerHTML = "";
    variants = await getLiveM3U8(channel, clientId);

    for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const picker = document.createElement("div");
        picker.className = "picker";
        picker.innerText = v.resolution;
        picker.addEventListener("click", () => {
            setVariant(i);
        });
        document.getElementById("quality-picker").appendChild(picker);
    }

    const savedVariant = localStorage.getItem("twitch-dvr:variant");
    player.src = url;
    setVariant(savedVariant ? parseInt(savedVariant) : 0);
    
    vodURLs = [];
    vodVariants = await getVODUrl(channel, clientId);
    for (const variant of vodVariants) {
        const urlParts = variant.url.split('/');
        urlParts[urlParts.length - 1] = '';
        vodURLs.push(urlParts.join('/'));
    }
}

function isInChannel(url) {
    const urlParts = url.split("/");
    if (urlParts.length === 3 && (urlParts[2] === "videos" || urlParts[2] === "schedule" || urlParts[2] === "about")) return true;
    return urlParts.length === 2 && url !== "/" && url !== "/directory";
}

const seekStep = 10;

function keyboardHandler(e) {
    if (!player) return;
    switch (e.keyCode) {
        case 37:
            let newTime = player.currentTime - seekStep + timestampOffset;
            if (maxTime - newTime < vodDeadzone + vodDeadzoneBuffer) {
                newTime = maxTime - vodDeadzoneBuffer - vodDeadzone;
            }
            seekToTime(newTime);
            break;
        case 39:
            seekToTime(player.currentTime + seekStep + timestampOffset);
            break;
        case 32:
            const nodeName = e.target.nodeName;
            if (nodeName !== "DIV" && nodeName !== "BODY" && nodeName !== "VIDEO") break;
            if (paused) play();
            else pause();
            e.stopPropagation();
            break;
    }
}

document.addEventListener("keydown", keyboardHandler);

async function main() {
    let updateSeekLabel = null;
    let timerEl = null;
    let playerContainer = null;

    function installPlayer() {
        const videoContainer = document.querySelector(".video-player__container");

        if (!videoContainer) {
            setTimeout(installPlayer, 1000);
            return;
        }

        paused = true;
        playerToggle = document.createElement('div');
        playerToggle.id = "player-toggle";
        playerToggle.innerHTML = `<div id="toggle">${playerType === 'dvr' ? 'Switch to Twitch Player' : 'Switch to DVR Player'}</div>`;

        playerContainer = document.createElement("div");
        playerContainer.id = "player-container";
        playerContainer.className = playerType;
        playerContainer.innerHTML = `
            <video id="player" width="100%" height="100%" playsinline"></video>
            <div id="control-hover">
            <div id="controls">
                <div id="play" class="control">
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 19V1L15 10L1 19Z" fill="white"/>
                    <path d="M1.27038 0.579411C1.11652 0.480504 0.920943 0.473499 0.760406 0.561144C0.599869 0.648789 0.5 0.817096 0.5 1V19C0.5 19.1829 0.599869 19.3512 0.760406 19.4389C0.920943 19.5265 1.11652 19.5195 1.27038 19.4206L15.2704 10.4206C15.4135 10.3286 15.5 10.1701 15.5 10C15.5 9.82987 15.4135 9.67141 15.2704 9.57941L1.27038 0.579411Z" stroke="black" stroke-opacity="0.2" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div id="pause" class="control">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1H7V19H1V1Z" fill="white"/>
                    <path d="M13 1H19V19H13V1Z" fill="white"/>
                    <path d="M1 0.5H0.5V1V19V19.5H1H7H7.5V19V1V0.5H7H1ZM13 0.5H12.5V1V19V19.5H13H19H19.5V19V1V0.5H19H13Z" stroke="black" stroke-opacity="0.2"/>
                    </svg>
                </div>
                <div id="volume" class="control">
                    <svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 6V12H5L10 17V1L5 6H1Z" fill="white"/>
                    <path d="M0.5 12C0.5 12.2761 0.723858 12.5 1 12.5H4.79289L9.64645 17.3536C9.78945 17.4966 10.0045 17.5393 10.1913 17.4619C10.3782 17.3846 10.5 17.2022 10.5 17V1C10.5 0.797769 10.3782 0.615451 10.1913 0.53806C10.0045 0.46067 9.78945 0.503448 9.64645 0.646447L4.79289 5.5H1C0.723858 5.5 0.5 5.72386 0.5 6V12Z" stroke="black" stroke-opacity="0.2" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div id="volume-container" class="control">
                    <div class="slider-empty control"></div>
                    <div id="volume-slider" class="slider control">
                        <div class="slider-filled control"></div>
                        <div class="slider-handle control"></div>
                    </div>
                </div>
                <div id="seek-outer" class="control">
                    <div id="seek-tooltip" class="tooltip control">
                        <div id="tooltip-text" class="tooltip-text"></div>
                        <div id="tooltip-triangle" class="triangle"></div>
                    </div>
                    <div id="seek-container" class="control">
                        <div class="slider-empty control"></div>
                        <div id="seek-slider" class="slider control">
                            <div class="slider-filled control"></div>
                            <div class="slider-handle control"></div>
                        </div>
                    </div>
                </div>

                <div id="timer" class="control"></div>
                <div id="live" class="live control">
                    <div class="tooltip control" id="go-live">
                        <div id="go-live-text" class="tooltip-text">Go to live</div>
                        <div id="go-live-triangle" class="triangle"></div>
                    </div>
                </div>
                <div id="quality-picker" class="control"></div>
                <div id="quality" class="control"></div>
                <div id="fullscreen" class="control">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 19V13H17V17H13V19H19Z" fill="white"/>
                    <path d="M19 1V7H17V3H13V1H19Z" fill="white"/>
                    <path d="M1 1V7H3V3H7V1H1Z" fill="white"/>
                    <path d="M1 13V19H7V17H3V13H1Z" fill="white"/>
                    <path d="M1 12.5H0.5V13V19V19.5H1H7H7.5V19V17V16.5H7H3.5V13V12.5H3H1ZM19.5 13V12.5H19H17H16.5V13V16.5H13H12.5V17V19V19.5H13H19H19.5V19V13ZM19 7.5H19.5V7V1V0.5H19H13H12.5V1V3V3.5H13H16.5V7V7.5H17H19ZM0.5 7V7.5H1H3H3.5V7V3.5H7H7.5V3V1V0.5H7H1H0.5V1V7Z" stroke="black" stroke-opacity="0.2"/>
                    </svg>
                </div>
            </div>
            </div>
        `;
        videoContainer.appendChild(playerContainer);
        videoContainer.appendChild(playerToggle);
        player = document.getElementById("player");
        volume = document.getElementById("volume-slider");
        seekTooltip = document.getElementById("seek-tooltip");
        seekTooltipText = document.getElementById("tooltip-text");
        seekContainer = document.getElementById("seek-container");
        seekSlider = document.getElementById("seek-slider");
        document.getElementById("play").addEventListener("click", play);
        document.getElementById("pause").addEventListener("click", pause);
        document.getElementById("fullscreen").addEventListener("click", toggleFullscreen);
        document.getElementById("player-toggle").addEventListener("dblclick", toggleFullscreen);
        playerContainer.addEventListener("dblclick", toggleFullscreen);
        document.getElementById("quality").addEventListener("click", togglePicker);
        document.getElementById("quality").addEventListener("dblclick", (e) => e.stopPropagation());
        document.getElementById("live").addEventListener("click", golive);
        document.querySelector("#player-toggle #toggle").addEventListener("click", togglePlayer);
        const savedVol = localStorage.getItem("twitch-dvr:vol");
        player.volume = savedVol ? parseFloat(savedVol) : 1;
        setVolume(player.volume);
        switchChannel();

        const volumeContainer = document.getElementById("volume-container");
        volumeContainer.addEventListener("mousedown", (ev) => {
            let leftSide = ev.pageX - ev.offsetX;
            setVolume((ev.offsetX - handleRadius) / 100);

            const mouseMove = (ev) => {
                setVolume((ev.pageX - leftSide - handleRadius) / 100);
            }
            const mouseUp = (ev) => {
                document.removeEventListener("mousemove", mouseMove);
                document.removeEventListener("mouseUp", mouseUp);
            }
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        });

        timerEl = document.getElementById("timer");

        let lastSeekEv = null;
        updateSeekLabel = (ev) => {
            if (!ev) ev = lastSeekEv;
            else lastSeekEv = ev;

            seekTooltip.style.left = `${ev.offsetX - 30}px`;
            if (!maxTime) return;

            const adjustedTime = getTimeAtOffset(ev.offsetX);
            if (maxTime - adjustedTime < vodDeadzone + vodDeadzoneBuffer) {
                seekTooltipText.innerText = "Live";
            } else {
                seekTooltipText.innerText = formatTime(adjustedTime);
            }
        };

        seekContainer.addEventListener("mousemove", updateSeekLabel);
        seekContainer.addEventListener("click", seek);
    }

    let currentUrl = document.location.pathname;
    let inChannelPage = isInChannel(currentUrl);
    if (inChannelPage) installPlayer();

    setInterval(() => {
        if (document.location.pathname !== currentUrl) {
            let prevChannel = null;
            if (inChannelPage) {
                prevChannel = currentUrl.split('/')[1];
            }
            currentUrl = document.location.pathname;
            inChannelPage = isInChannel(currentUrl);
            const toggle = document.getElementById("player-toggle");
            if (inChannelPage) {
                if (currentUrl.split('/')[1] === prevChannel) {
                    return;
                }
                if (toggle) toggle.style.display = '';
                if (!document.getElementById("player")) {
                    installPlayer();
                } else {
                    playerContainer.style.display = '';
                    switchMode('live');
                    pause();
                    switchChannel();
                }
            } else {
                if (toggle) toggle.style.display = 'none';
                if (sourceBuffer) {
                    clearTimers();
                }
                if (playerContainer && playerContainer.style) {
                    playerContainer.style.display = 'none';
                    switchMode('live');
                    pause();
                }
            }
        }
        if (!inChannelPage) return;
        if (playerType === 'twitch') return;

        const adIframe = document.getElementById("amazon-video-ads-iframe");
        if (adIframe) adIframe.remove();
        
        const videos = document.querySelectorAll("video");
        for (const video of videos) {
            if (video.id !== "player" && !video.paused) {
                video.pause();
            }
        }

        if (paused || !sourceBuffer || !sourceBuffer.buffered.length) return;
        const adjustedTime = player.currentTime + timestampOffset;
        const width = getSeekWidth();
        maxTime = (Date.now() - timeOrigin) / 1000 + timeOriginPlayerTime + timestampOffset;

        if (videoMode === "vod" && width) seekSlider.style.width = `${(width - 2*handleRadius) * adjustedTime / maxTime + 2*handleRadius}px`;
        timerEl.innerText = formatTime(adjustedTime);

        if (seekTooltip.offsetParent) updateSeekLabel();
    }, 1000);
}

main();