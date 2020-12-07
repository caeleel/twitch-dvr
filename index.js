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

    #control-hover {
        position: absolute;
        height: 40%;
        width: 100%;
        bottom: 0;
    }

    #control-hover:hover #controls {
        display: block;
    }

    .overlay {
        display: none;
        position: absolute;
        top: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        flex-direction: column;
        font-weight: 600;
        font-size: 20px;
    }

    .overlay div {
        text-align: center;
        width: 600px;
        margin-bottom: 20px;
    }

    #toast-overlay {
        display: none;
        position: absolute;
        bottom: 100px;
        width: 100%;
        justify-content: center;
        pointer-events: none;
    }

    #toast {
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-weight: 600;
        font-size: 20px;
        padding: 10px 20px;
        border: 2px solid white;
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
        right: 142px;
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
        color: black;
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

    #clip {
        display: none;
        bottom: 20px;
        height: 20px;
        width: 20px;
        right: 50px;
    }

    #quality {
        bottom: 20px;
        height: 20px;
        right: 80px;
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
        display: none;
        bottom: 42px;
        right: 80px;
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
let sourceBuffer = null;
let arrayOfBlobs = [];
let player = null;
let volume = null;
let seekTooltip = null;
let seekTooltipText = null;
let seekContainer = null;
let seekSlider = null;
let isTransitioningTypes = false;
let generation = 0;
let vodOffset = 0;
let videoMode = 'live';
let transmuxer = null;
let inChannelPage = false;
let playerInstalled = false;
let makingClip = false;
let playerType = localStorage.getItem('twitch-dvr:player-type') ? localStorage.getItem('twitch-dvr:player-type') : 'dvr';

const bufferLimit = 200;
const handleRadius = 7.25;
const vodDeadzone = 15;
const vodDeadzoneBuffer = 15;
let vodSegmentLen = 10;

function hideToggle() {
    if (document.getElementById('toggle')) {
        document.getElementById('toggle').style.display = '';
    }

    if (paused) return;
    if (document.getElementById('player-container')) {
        document.getElementById('player-container').style.cursor = 'none';
        document.getElementById('controls').style.display = 'none';
    }
}

let toggleTimer = null;

function showToggle() {
    if (toggleTimer) clearTimeout(toggleTimer);
    toggleTimer = null;
    if (document.getElementById('toggle')) {
        document.getElementById('toggle').style.display = 'block';
    }

    if (document.getElementById('player-container')) {
        document.getElementById('player-container').style.cursor = '';
        document.getElementById('controls').style.display = 'block';
    }
}

function showToggleForAWhile() {
    if (!inChannelPage) return;
    showToggle();
    toggleTimer = setTimeout(hideToggle, 3000);
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    } else {
        const element = document.getElementById('player-container');
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    }
}

let toastTimer = null;
function showToast(text) {
    if (toastTimer) {
        clearTimeout(toastTimer);
    }
    document.getElementById('toast').innerText = text;
    document.getElementById('toast-overlay').style.display = 'flex';
    toastTimer = setTimeout(() => {
        document.getElementById('toast-overlay').style.display = 'none';
        toastTimer = null;
    }, 5000);
}

async function getVODUrl(channel, clientId) {
    let resp = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        headers: {
            'client-id': clientId,
        },
        body: JSON.stringify([{
            operationName: 'HomeOfflineCarousel',
            variables: {
                channelLogin: channel,
                includeTrailerUpsell: false,
                trailerUpsellVideoID: ''
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '0c97fdcb4e0366b25ae35eb89cc932ecbbb056f663f92735d53776602e4e94c5',
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

    resp = await fetch(`https://usher.ttvnw.net/vod/${vodId}.m3u8?allow_source=true&allow_audio_only=true&playlist_include_framerate=true&reassignments_supported=true&sig=${sig}&token=${encodeURI(token)}`);
    const text = await resp.text();
    const manifests = parseMasterManifest(text);

    resp = await fetch(manifests[0].url);
    const manifest = await resp.text();
    const histogram = {};
    let maxCount = 0;
    for (const line of manifest.split('\n')) {
        if (line.substring(0, 8) === '#EXTINF:') {
            const dur = parseFloat(line.substring(8).split(',')[0]);
            if (histogram[dur]) {
                histogram[dur]++;
            } else {
                histogram[dur] = 1;
            }
            if (histogram[dur] > maxCount) {
                maxCount++;
                vodSegmentLen = dur;
            }
        }
    }

    return manifests;
}

async function bufferVOD(url, time, first) {
    const startGeneration = generation;

    const idx = Math.floor(time / vodSegmentLen);
    const baseURL = vodURLs[variantIdx];
    vodOffset = time % vodSegmentLen;

    if (!sourceBuffer.buffered.length || sourceBuffer.buffered.end(0) - player.currentTime < 0) {
        first = true;
    }
    const bufferAmount = Math.max(0, Math.min(bufferLimit / 2, maxTime - time - vodDeadzone));
    const toBuffer = first ? Math.floor(bufferAmount / vodSegmentLen) : Math.max(0, Math.floor((bufferAmount - sourceBuffer.buffered.end(0) + player.currentTime) / vodSegmentLen));

    if (toBuffer > 0) {
        time += vodSegmentLen;
        await downloadSegments(startGeneration, Promise.resolve(), [{ url: `${baseURL}${idx}.ts`, type: 'vod' }]);
    }

    if (generation !== startGeneration) return;
    const waitTime = toBuffer > 1 ? 100 : 2000;
    vodTimer = setTimeout(() => bufferVOD(url, time, false), waitTime);
}

let lastFetched = new Set();
let paused = true;
let firstTime = true;
let totalElapsed = 0;
let vodOrigin = 0;
let tmpVodOrigin = null;

async function bufferLive(url) {
    const resp = await fetch(url);
    const m3u8 = await resp.text();
    const segments = [];
    const fetched = new Set();
    let canHaveDiscontinuity = false;

    const lines = m3u8.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let segment = null;
        if (line.substring(0, 8) === '#EXTINF:') {
            canHaveDiscontinuity = true;
            const isLive = line.split(',')[1] === 'live';
            segment = { url: lines[i+1], type: isLive ? 'live' : 'ad' };
        } else if (line.substring(0, 23) === '#EXT-X-TWITCH-PREFETCH:') {
            segment = { url: line.substring(23), type: 'live' };
        } else if (line.substring(0, 25) === '#EXT-X-TWITCH-TOTAL-SECS:') {
            totalElapsed = parseFloat(line.substring(25));
        } else if (line === "#EXT-X-DISCONTINUITY" && canHaveDiscontinuity) {
            const discontinuityID = lines[i-1];
            fetched.add(discontinuityID);
            if (lastFetched.has(discontinuityID)) continue;
            segment = { type: 'discontinuity' };
        }

        if (segment) {
            fetched.add(segment.url);

            if (!lastFetched.has(segment.url)) {
                totalElapsed -= (budget / 1000);
                segments.push(segment);
            }
        }
    }

    const lastFetchedSize = lastFetched.size;
    lastFetched = fetched;

    if (segments.length > 3 && lastFetchedSize === 0) return segments.slice(segments.length - 3);

    return segments;
}

function parseMasterManifest(m3u8) {
    const lines = m3u8.split('\n');
    const variants = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.substring(0, 18) === '#EXT-X-STREAM-INF:') {
            const parts = line.substring(18).split(',');
            const variant = {};
            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                const vals = part.split('=');
                switch (vals[0]) {
                    case 'BANDWIDTH':
                        variant.bandwidth = parseInt(vals[1]);
                        break;
                    case 'RESOLUTION':
                        variant.vHeight = vals[1].split('x')[1];
                        variant.resolution = `${variant.vHeight}p`;
                        break;
                    case 'CODECS':
                        variant.codecs = `${vals[1]},${parts[j+1]}`;
                        break;
                    case 'VIDEO':
                        variant.name = vals[1];
                        if (vals[1] === '"audio_only"') {
                            variant.vHeight = 0;
                            variant.resolution = 'audio';
                            variant.framerate = 30;
                            variant.codecs = '"mp4a.40.2"';
                        }
                        break;
                    case 'FRAME-RATE':
                        variant.framerate = parseFloat(vals[1]);
                        break;
                }
            }
            if (variant.framerate !== 30) {
                variant.resolution += Math.ceil(variant.framerate);
            }
            variant.url = lines[i+1];
            variants.push(variant);
        }
    }

    return variants.sort((a, b) => b.vHeight - a.vHeight);
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

    resp = await fetch(`https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?allow_source=true&allow_audio_only=true&fast_bread=true&playlist_include_framerate=true&reassignments_supported=true&sig=${sig}&token=${encodeURI(token)}`);
    if (resp.status !== 200) {
        throw new Error('Stream not live');
    }
    const text = await resp.text();

    const parsed = parseMasterManifest(text);
    return parsed;
}

async function appendToSourceBuffer() {
    if (!sourceBuffer) return;

    await Promise.resolve();

    if (mediaSrc.readyState === 'open' && sourceBuffer && sourceBuffer.updating === false && arrayOfBlobs.length > 0) {
        const blob = arrayOfBlobs.shift();
        sourceBuffer.appendBuffer(blob);
    }
}

let lastPlayerTime = -1;
let lastRealTime = -1;

function afterBufferUpdate() {
    if (!sourceBuffer) return;

    lastPlayerTime = player.currentTime;
    lastRealTime = Date.now();
    const numBuffers = player.buffered.length;

    if (firstTime && numBuffers) {
        player.currentTime = sourceBuffer.buffered.start(0) + (videoMode === 'vod' ? vodOffset : 0);
        if (videoMode === 'live') {
            timeOriginPlayerTime = totalElapsed;
            timeOrigin = Date.now();
        }
        if (!paused) {
            setTimeout(() => {
                player.play().catch((e) => {
                    player.muted = true;
                    document.getElementById("mute-overlay").style.display = "flex";
                });
            }, 0);
        } else if (videoMode === 'vod') {
            player.pause();
        }
        tmpVodOrigin = null;
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
        try {
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
        } catch(e) {
            // pass
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
    if (!document.getElementById('pause')) return;

    document.getElementById('pause').style.display = 'none';
    document.getElementById('play').style.display = 'block';

    if (videoMode === 'vod') {
        player.pause();
        paused = true;
        return;
    }

    lastFetched = new Set();
    clearTimers();
    resetTransmuxer();
    paused = true;
    document.getElementById('controls').style.display = 'block';
}

function play() {
    document.getElementById('play').style.display = 'none';
    document.getElementById('pause').style.display = 'block';
    if (videoMode === 'vod') {
        player.play().catch((e) => {
            player.muted = true;
            document.getElementById("mute-overlay").style.display = "flex";
        });
        paused = false;
        return;
    }

    if (paused) {
        rebuffer();
        paused = false;
        firstTime = true;
    }
}

function getSeekWidth() {
    const container = document.getElementById('player-container');
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
    const timer = document.getElementById('timer');
    if (timer) timer.innerText = formatTime(seekTime);

    const buffered = sourceBuffer.buffered;
    const videoTime = seekTime - vodOrigin;
    if (videoMode === 'vod' && buffered.length && buffered.start(0) <= videoTime && buffered.end(0) >= videoTime) {
        player.currentTime = videoTime;
        return;
    }
    clearTimers();

    switchMode('vod');
    vodOrigin = seekTime - (seekTime % vodSegmentLen);
    tmpVodOrigin = seekTime;
    firstTime = true;
    resetTransmuxer();
    vodTimer = setTimeout(() => bufferVOD(vodVariants[variantIdx], seekTime, true), 500);
}

function golive() {
    if (videoMode === 'live') return;

    clearTimers();
    switchMode('live');
    paused = true;
    play();
}

function togglePicker() {
    const picker = document.getElementById('quality-picker');
    const pickerOpen = picker.style.display === 'block';
    if (pickerOpen) {
        document.removeEventListener('click', togglePicker);
    } else {
        setTimeout(() => document.addEventListener('click', togglePicker), 1);
    }
    picker.style.display = pickerOpen ? 'none' : 'block';
}

function playNative(mute) {
    let muted = null;
    for (const video of document.querySelectorAll('.video-player__container video')) {
        if (video.id !== 'player') {
            muted = video.muted;
            if (mute) video.muted = true;
            video.play();
            break;
        }
    }
    return muted;
}

function togglePlayer() {
    let typeName = 'Twitch';
    if (playerType === 'dvr') {
        typeName = 'DVR';
        playerType = 'twitch';
        pause();
        playNative();
    } else {
        playerType = 'dvr';
        switchChannel();
    }

    localStorage.setItem('twitch-dvr:player-type', playerType);
    document.querySelector('#toggle').innerText = `Switch to ${typeName} player`;
    document.getElementById('player-container').className = playerType;
}

let bufferPromise = null;

async function downloadSegments(startGeneration, lastPromise, segments) {
    let count = 0;
    for (const segment of segments) {
        if (startGeneration !== generation) break;
        try {
            if (segment.type === "discontinuity") {
                isTransitioningTypes = true;
                break;
            }
            const resp = await fetch(segment.url);
            if (startGeneration !== generation) break;

            const bytes = await resp.arrayBuffer();
            if (startGeneration !== generation) break;
            await lastPromise;
            if (startGeneration !== generation) break;
            if (transmuxer) {
                transmuxer.push(new Uint8Array(bytes));
                transmuxer.flush();
            }
            count++;
        } catch(e) {
            console.log(`Warning: failed to fetch: ${e}, stopping download early`)
            if (videoMode === "live") {
                pause();
                setTimeout(switchChannel, 1000);
            }
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

let firstSegment = false;

function resetTransmuxer() {
    isTransitioningTypes = false;
    if (transmuxer) transmuxer.off('data');
    transmuxer = new muxjs.mp4.Transmuxer();
    firstSegment = true;
    transmuxer.on('data', (segment) => {
        if (firstSegment) {
            const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
            data.set(segment.initSegment, 0);
            data.set(segment.data, segment.initSegment.byteLength);
            arrayOfBlobs.push(data);
            firstSegment = false;
        } else {
            arrayOfBlobs.push(new Uint8Array(segment.data));
        }
        appendToSourceBuffer();
    });
}

function setVariant(idx) {
    if (!document.getElementById('quality-picker')) return;
    idx = Math.max(0, Math.min(idx, variants.length - 1));
    localStorage.setItem('twitch-dvr:variant', idx);
    variantIdx = idx

    const currTime = player.currentTime + vodOrigin;
    
    mediaSrc = new MediaSource();
    if (player.src) {
        URL.revokeObjectURL(player.src);
    }
    clearTimers();
    sourceBuffer = null;

    if (!variants[idx]) return;
    document.getElementById('quality').innerText = variants[idx].resolution;

    resetTransmuxer();
    player.src = URL.createObjectURL(mediaSrc);

    lastFetched = new Set();
    let variant = videoMode === 'live' ? variants[idx] : vodVariants[idx];
    if (videoMode === 'live') pause();

    mediaSrc.addEventListener('sourceopen', function() {
        sourceBuffer = mediaSrc.addSourceBuffer(`video/mp4; codecs=${variant.codecs}`);
        sourceBuffer.addEventListener('updateend', () => {
            afterBufferUpdate();
            appendToSourceBuffer();
        });
        sourceBuffer.addEventListener('error', () => {
            pause();
            setTimeout(switchChannel, 1000);
            console.warn('Failed to append to buffer');
        });
        budgetEnd = Date.now();
        if (videoMode === 'live') {
            play();
        } else {
            firstTime = true;
            bufferVOD(variant, currTime, true);
        }
    });
}

function switchMode(mode) {
    videoMode = mode;
    budgetEnd = Date.now();
    resetTransmuxer();
    if (!document.getElementById('live')) return;
    document.getElementById('live').className = 'control ' + mode;
    if (mode === 'live') seekSlider.style.width = '100%';
    const clipButton = document.getElementById('clip');
    if (!clipButton) return;
    if (mode === 'vod') clipButton.style.display = '';
    else if (!document.querySelector('.anon-user')) clipButton.style.display = 'block';
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
    switchMode('live');

    const channel = document.location.pathname.split('/')[1];
    const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
    document.getElementById('quality-picker').innerHTML = '';
    try {
        variants = await getLiveM3U8(channel, clientId);
    } catch(e) {
        uninstallPlayer();
        return;
    }
    playerInstalled = true;

    for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const picker = document.createElement('div');
        picker.className = 'picker';
        picker.innerText = v.resolution;
        picker.addEventListener('click', () => {
            setVariant(i);
        });
        document.getElementById('quality-picker').appendChild(picker);
    }

    const savedVariant = localStorage.getItem('twitch-dvr:variant');
    setVariant(savedVariant ? parseInt(savedVariant) : 0);
    if (!document.querySelector('.anon-user')) document.getElementById('clip').style.display = 'block';

    vodURLs = [];
    vodVariants = await getVODUrl(channel, clientId);
    for (const variant of vodVariants) {
        const urlParts = variant.url.split('/');
        urlParts[urlParts.length - 1] = '';
        vodURLs.push(urlParts.join('/'));
    }
}

function isInChannel(url) {
    const urlParts = url.split('/');
    if (urlParts.length === 3 && (urlParts[2] === 'videos' || urlParts[2] === 'schedule' || urlParts[2] === 'about')) return true;
    return urlParts.length === 2 && url !== '/' && url !== '/directory' && url !== '/search';
}

const seekStep = 10;
async function getClipButton(click) {
    makingClip = true;
    const wasMuted = playNative(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    let found = false;
    const buttons = document.querySelectorAll('.tw-core-button--overlay');
    for (const button of buttons) {
        if (button.dataset.aTarget === 'player-clip-button') {
            found = true;
            if (click) button.click();
        }
    }

    for (const video of document.querySelectorAll('.video-player__container video')) {
        if (video.id !== 'player' && !video.paused) {
            video.pause();
            video.muted = wasMuted;
            break;
        }
    }
    makingClip = false;
    return found;
}

async function createClip() {
    if (!await getClipButton(/* click = */ true)) {
        document.getElementById('clip-overlay').style.display = 'flex';
    }
}

function keyboardHandler(e) {
    if (!player) return;
    const nodeName = e.target.nodeName;
    if (nodeName !== 'DIV' && nodeName !== 'BODY' && nodeName !== 'VIDEO') return;
    switch (e.keyCode) {
        case 37:
            let newTime = videoMode === 'vod' ? vodOrigin + player.currentTime - seekStep : maxTime - seekStep;
            if (tmpVodOrigin) newTime = tmpVodOrigin - seekStep;
            if (maxTime - newTime < vodDeadzone + vodDeadzoneBuffer) {
                newTime = maxTime - vodDeadzoneBuffer - vodDeadzone;
            }
            seekToTime(newTime);
            break;
        case 39:
            if (videoMode === 'live') break;
            seekToTime(tmpVodOrigin ? tmpVodOrigin + seekStep : vodOrigin + player.currentTime + seekStep);
            break;
        case 32:
            if (paused) play();
            else pause();
            e.stopPropagation();
            break;
        case 188:
            if (videoMode === 'live') break;
            if (!player.buffered || !player.buffered.length) break;
            const seekTime = player.currentTime - 1 / (vodVariants[variantIdx].framerate);
            if (player.buffered.start(0) > seekTime) {
                showToast("Seek backward to frame-by-frame further")
                break;
            }
            pause();
            player.currentTime = seekTime;
            break;
        case 190:
            if (videoMode === 'live') break;
            if (!player.buffered || !player.buffered.length) break;
            pause();
            player.currentTime += 1 / (vodVariants[variantIdx].framerate);
            break;
    }
}

let playerContainer = null;
let installationTimer = null;
function uninstallPlayer() {
    playerInstalled = false;
    if (playerContainer && playerContainer.style) {
        playerContainer.style.display = 'none';
        switchMode('live');
        pause();
    } else {
        if (installationTimer) {
            clearTimeout(installationTimer);
            installationTimer = null;
        }
    }
}

document.addEventListener('keydown', keyboardHandler);

async function main() {
    let updateSeekLabel = null;
    let timerEl = null;

    function installPlayer() {
        const videoContainer = document.querySelector('.video-player__container');

        if (!videoContainer) {
            installationTimer = setTimeout(installPlayer, 1000);
            return;
        }

        if (!isInChannel(document.location.pathname)) {
            return;
        }

        paused = true;
        playerToggle = document.createElement('div');
        playerToggle.id = 'toggle';
        playerToggle.innerText = playerType === 'dvr' ? 'Switch to Twitch Player' : 'Switch to DVR Player';

        playerContainer = document.createElement('div');
        playerContainer.id = 'player-container';
        playerContainer.className = playerType;
        playerContainer.innerHTML = `
            <video id='player' width='100%' height='100%' playsinline'></video>
            <div id='control-hover'>
            <div id='controls'>
                <div id='play' class='control'>
                    <svg width='16' height='20' viewBox='0 0 16 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M1 19V1L15 10L1 19Z' fill='white'/>
                    <path d='M1.27038 0.579411C1.11652 0.480504 0.920943 0.473499 0.760406 0.561144C0.599869 0.648789 0.5 0.817096 0.5 1V19C0.5 19.1829 0.599869 19.3512 0.760406 19.4389C0.920943 19.5265 1.11652 19.5195 1.27038 19.4206L15.2704 10.4206C15.4135 10.3286 15.5 10.1701 15.5 10C15.5 9.82987 15.4135 9.67141 15.2704 9.57941L1.27038 0.579411Z' stroke='black' stroke-opacity='0.2' stroke-linejoin='round'/>
                    </svg>
                </div>
                <div id='pause' class='control'>
                    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M1 1H7V19H1V1Z' fill='white'/>
                    <path d='M13 1H19V19H13V1Z' fill='white'/>
                    <path d='M1 0.5H0.5V1V19V19.5H1H7H7.5V19V1V0.5H7H1ZM13 0.5H12.5V1V19V19.5H13H19H19.5V19V1V0.5H19H13Z' stroke='black' stroke-opacity='0.2'/>
                    </svg>
                </div>
                <div id='volume' class='control'>
                    <svg width='11' height='18' viewBox='0 0 11 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M1 6V12H5L10 17V1L5 6H1Z' fill='white'/>
                    <path d='M0.5 12C0.5 12.2761 0.723858 12.5 1 12.5H4.79289L9.64645 17.3536C9.78945 17.4966 10.0045 17.5393 10.1913 17.4619C10.3782 17.3846 10.5 17.2022 10.5 17V1C10.5 0.797769 10.3782 0.615451 10.1913 0.53806C10.0045 0.46067 9.78945 0.503448 9.64645 0.646447L4.79289 5.5H1C0.723858 5.5 0.5 5.72386 0.5 6V12Z' stroke='black' stroke-opacity='0.2' stroke-linejoin='round'/>
                    </svg>
                </div>
                <div id='volume-container' class='control'>
                    <div class='slider-empty control'></div>
                    <div id='volume-slider' class='slider control'>
                        <div class='slider-filled control'></div>
                        <div class='slider-handle control'></div>
                    </div>
                </div>
                <div id='seek-outer' class='control'>
                    <div id='seek-tooltip' class='tooltip control'>
                        <div id='tooltip-text' class='tooltip-text'></div>
                        <div id='tooltip-triangle' class='triangle'></div>
                    </div>
                    <div id='seek-container' class='control'>
                        <div class='slider-empty control'></div>
                        <div id='seek-slider' class='slider control'>
                            <div class='slider-filled control'></div>
                            <div class='slider-handle control'></div>
                        </div>
                    </div>
                </div>

                <div id='timer' class='control'></div>
                <div id='live' class='live control'>
                    <div class='tooltip control' id='go-live'>
                        <div id='go-live-text' class='tooltip-text'>Go to live</div>
                        <div id='go-live-triangle' class='triangle'></div>
                    </div>
                </div>
                <div id='quality-picker' class='control'></div>
                <div id='quality' class='control'></div>
                <div id='clip' class='control'>
                    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M14.594 4.495L14.009 2.585L15.922 2L16.507 3.91L14.594 4.495V4.495ZM11.14 3.46L11.725 5.371L13.638 4.787L13.053 2.877L11.14 3.46V3.46ZM8.856 6.247L8.272 4.337L10.184 3.753L10.769 5.663L8.856 6.247V6.247ZM5.403 5.213L5.987 7.123L7.9 6.54L7.315 4.629L5.403 5.213V5.213ZM2.534 6.09L3.118 8L5.031 7.416L4.446 5.506L2.534 6.089V6.09ZM5 9H3V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V9H15V16H5V9Z' fill='white'/>
                    <path d='M8 9H6V11H8V9ZM9 9H11V11H9V9ZM14 9H12V11H14V9Z' fill='white'/>
                    </svg>
                </div>
                <div id='fullscreen' class='control'>
                    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M19 19V13H17V17H13V19H19Z' fill='white'/>
                    <path d='M19 1V7H17V3H13V1H19Z' fill='white'/>
                    <path d='M1 1V7H3V3H7V1H1Z' fill='white'/>
                    <path d='M1 13V19H7V17H3V13H1Z' fill='white'/>
                    <path d='M1 12.5H0.5V13V19V19.5H1H7H7.5V19V17V16.5H7H3.5V13V12.5H3H1ZM19.5 13V12.5H19H17H16.5V13V16.5H13H12.5V17V19V19.5H13H19H19.5V19V13ZM19 7.5H19.5V7V1V0.5H19H13H12.5V1V3V3.5H13H16.5V7V7.5H17H19ZM0.5 7V7.5H1H3H3.5V7V3.5H7H7.5V3V1V0.5H7H1H0.5V1V7Z' stroke='black' stroke-opacity='0.2'/>
                    </svg>
                </div>
            </div>
            </div>
            <div id='mute-overlay' class='overlay'><div>Click to unmute</div></div>
            <div id='clip-overlay' class='overlay'>
                <div>
                    Clipping failed. This could be because the channel has clipping disabled,
                    or the native Twitch player is in the middle of an ad :(. If the Twitch player is in an ad,
                    you'll have to either refresh the page or switch over to it to clip.
                </div>
                <div>OK</div>
            </div>
            <div id='toast-overlay'><div id='toast'>Test Toast</div></div>
        `;
        videoContainer.appendChild(playerContainer);
        videoContainer.appendChild(playerToggle);
        videoContainer.addEventListener('mousemove', showToggleForAWhile);
        player = document.getElementById('player');
        volume = document.getElementById('volume-slider');
        seekTooltip = document.getElementById('seek-tooltip');
        seekTooltipText = document.getElementById('tooltip-text');
        seekContainer = document.getElementById('seek-container');
        seekSlider = document.getElementById('seek-slider');
        document.getElementById('play').addEventListener('click', play);
        document.getElementById('pause').addEventListener('click', pause);
        document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
        playerContainer.addEventListener('dblclick', toggleFullscreen);
        document.getElementById('quality').addEventListener('click', togglePicker);
        document.getElementById('quality').addEventListener('dblclick', (e) => e.stopPropagation());
        document.getElementById('live').addEventListener('click', golive);
        document.getElementById('toggle').addEventListener('click', togglePlayer);
        document.getElementById('clip').addEventListener('click', createClip);
        document.getElementById('mute-overlay').addEventListener('click', () => {
            document.getElementById('mute-overlay').style.display = 'none';
            player.muted = false;
        });
        document.getElementById('clip-overlay').addEventListener('click', () => {
            document.getElementById('clip-overlay').style.display = 'none';
        });
        const savedVol = localStorage.getItem('twitch-dvr:vol');
        player.volume = savedVol ? parseFloat(savedVol) : 1;
        setVolume(player.volume);
        switchChannel();

        const volumeContainer = document.getElementById('volume-container');
        volumeContainer.addEventListener('mousedown', (ev) => {
            let leftSide = ev.pageX - ev.offsetX;
            setVolume((ev.offsetX - handleRadius) / 100);

            const mouseMove = (ev) => {
                setVolume((ev.pageX - leftSide - handleRadius) / 100);
            }
            const mouseUp = (ev) => {
                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('mouseUp', mouseUp);
            }
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
        });

        timerEl = document.getElementById('timer');

        let lastSeekEv = null;
        updateSeekLabel = (ev) => {
            if (!ev) ev = lastSeekEv;
            else lastSeekEv = ev;

            seekTooltip.style.left = `${ev.layerX - 30}px`;
            if (!maxTime) return;

            const adjustedTime = getTimeAtOffset(ev.layerX);
            if (maxTime - adjustedTime < vodDeadzone + vodDeadzoneBuffer) {
                seekTooltipText.innerText = 'Live';
            } else {
                seekTooltipText.innerText = formatTime(adjustedTime);
            }
        };

        seekContainer.addEventListener('mousemove', updateSeekLabel);
        seekContainer.addEventListener('click', seek);
    }

    let currentUrl = document.location.pathname;
    inChannelPage = isInChannel(currentUrl);
    if (inChannelPage) installPlayer();

    setInterval(() => {
        if (document.location.pathname !== currentUrl) {
            let prevChannel = null;
            if (inChannelPage) {
                prevChannel = currentUrl.split('/')[1];
            }
            currentUrl = document.location.pathname;
            inChannelPage = isInChannel(currentUrl);
            if (inChannelPage) {
                if (currentUrl.split('/')[1] === prevChannel) {
                    return;
                }
                if (!document.getElementById('player')) {
                    installPlayer();
                } else {
                    playerContainer.style.display = '';
                    switchMode('live');
                    pause();
                    switchChannel();
                }
            } else {
                if (sourceBuffer) {
                    clearTimers();
                }
                uninstallPlayer();
            }
        }
        if (!inChannelPage || !playerInstalled) return;
        if (playerType === 'twitch') return;

        const adIframe = document.getElementById('amazon-video-ads-iframe');
        if (adIframe) adIframe.remove();

        if (!makingClip) {
            const videos = document.querySelectorAll('.video-player__container video');
            for (const video of videos) {
                if (video.id !== 'player' && !video.paused) {
                    video.pause();
                }
            }
        }

        if (videoMode === 'live' && (paused || !sourceBuffer || !player.buffered.length)) return;

        const width = getSeekWidth();
        maxTime = (Date.now() - timeOrigin) / 1000 + timeOriginPlayerTime;
        const adjustedTime = videoMode === 'vod' ? vodOrigin + player.currentTime : maxTime;

        if (videoMode === 'vod' && width) seekSlider.style.width = `${(width - 2*handleRadius) * adjustedTime / maxTime + 2*handleRadius}px`;
        timerEl.innerText = formatTime(adjustedTime);

        if (paused || !sourceBuffer || !player.buffered.length) return;

        if (isTransitioningTypes && lastRealTime > 0) {
            const realDiff = Date.now() - lastRealTime;
            const playerDiff = player.currentTime - lastPlayerTime;

            if (realDiff - playerDiff * 1000 > 200) {
                pause();
                resetTransmuxer();
                play();
                return;
            }
        }

        if (seekTooltip.offsetParent) updateSeekLabel();
    }, 1000);
}

main();
