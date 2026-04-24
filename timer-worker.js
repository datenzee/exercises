// Web Workers keep ticking even when the tab is backgrounded/minimized,
// unlike setInterval on the main thread which browsers throttle heavily.

let intervalId = null;

self.onmessage = (e) => {
    if (e.data === 'start') {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => self.postMessage('tick'), 250);
    } else if (e.data === 'stop') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
};
