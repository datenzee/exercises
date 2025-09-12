// Configuration ---

const defaultTime = 30 * 60;
const imageQuery = 'sports gym bouldering fitness climbing workout exercise';
const wizard = 'team.fair-wizard.com'
const removeVideoProjectUuid = '2d5fe6a5-f660-441f-9995-d8de79f5cf67';
const releaseChecklistProjectUuid = 'db91894b-7abd-4b1a-adb6-0818f017f531';
const musicProjectUuid = 'cce273dc-fef5-4093-aed5-6186850cd040'

const announceSound = new Audio('audio/announce.wav');
const focusModeSound = new Audio('audio/silence.mp3');


// Elements ---

const buttonPlay = document.getElementById('button-play')
const buttonRelease = document.getElementById('button-release')
const buttonReleaseIcon = document.querySelector('#button-release .icon')
const buttonReleaseLoader = document.querySelector('#button-release .loader')
const buttonYoutube = document.getElementById('button-youtube')
const buttonMusic = document.getElementById('button-music')
const buttonMusicIcon = document.querySelector('#button-music .icon')
const buttonMusicLoader = document.querySelector('#button-music .loader')
const buttonFocusMode = document.getElementById('button-focus')
const buttonExercise = document.getElementById('button-exercise')
const buttonRemoteVideo = document.getElementById('button-remote-video')
const buttonRemoteVideoIcon = document.querySelector('#button-remote-video .icon')
const buttonRemoteVideoLoader = document.querySelector('#button-remote-video .loader')
const buttonCustomVideo = document.getElementById('button-custom-video')
const timer = document.querySelector('.timer')
const timerWrapper = document.querySelector('.timer-wrapper')
const focusMode = document.querySelector('.focus-mode')
const exercise = document.querySelector('.exercise')
const exerciseTitle = document.querySelector('.exercise-title')
const exerciseImage = document.querySelector('.exercise-image')
const exerciseDone = document.querySelector('.exercise-done')
const exerciseNext = document.querySelector('.exercise-next')
const controlsTop = document.querySelector('.controls-top')


// State ---

let exerciseList = shuffleArray(window.exercises)
let interval
let contentDiv
let contentDivType
let releaseWebsocket


// Event Listeners ---

buttonPlay.addEventListener('click', () => {
    startStopTimer()
})

buttonRelease.addEventListener('click', () => {
    const lastContentDivType = contentDivType

    if (contentDiv) {
        hideContent()
    }

    if (lastContentDivType !== 'release') {
        openReleaseWebsocket()
        initReleaseChecklist()
    }
})

buttonYoutube.addEventListener('click', () => {
    const lastContentDivType = contentDivType

    if (contentDiv) {
        hideContent()
    }

    if (lastContentDivType !== 'youtube') {
        initVideo(window.videos[window.videos.length - 1].v)
    }
})

buttonMusic.addEventListener('click', () => {
    const lastContentDivType = contentDivType

    if (contentDiv) {
        hideContent()
    }

    if (lastContentDivType !== 'music') {
        initMusic()
    }
})

buttonFocusMode.addEventListener('click', () => {
    toggleFocusMode()
})

buttonExercise.addEventListener('click', () => {
    openExercise()
})

buttonRemoteVideo.addEventListener('click', () => {
    openRemoteVideo()
})

buttonCustomVideo.addEventListener('click', () => {
    const videoCode = window.prompt('Enter the video code')
    if (videoCode) {
        initVideo(videoCode)
    }
})

exerciseDone.addEventListener('click', () => {
    closeExercise()
})

exerciseNext.addEventListener('click', () => {
    openExercise()
})

document.addEventListener('keyup', (event) => {
    if (isExerciseOpen()) {
        if (event.key === ' ') {
            event.preventDefault()
            openExercise()
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            closeExercise()
        }
    } else {
        if (event.key === ' ') {
            event.preventDefault()
            startStopTimer()
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            openExercise()
        }
    }

    if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        toggleFocusMode()
    }
})


// Timer ---

function updateTimer(value) {
    timer.textContent = convertSeconds(value)
}

function convertSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

function startStopTimer() {
    if (interval) {
        stopTimer()
    } else {
        startTimer()
    }
}

function startTimer() {
    let time = defaultTime;
    updateTimer(time);
    updateBackground();
    interval = setInterval(() => {
        time--;
        updateTimer(time);
        if (time === 0) {
            clearInterval(interval);
            interval = null;
            openExercise();
            playAnnouncement();
        }
    }, 1000);
}

function stopTimer() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function updateBackground() {
    fetch(`https://api.unsplash.com/photos/random?query=${imageQuery}&orientation=landscape&client_id=JzZl4koU2EhekuqXX239wbWVdvUhSvHFrSrwte9FDLM`)
        .then(response => response.json())
        .then(data => {
            const imageUrl = data.urls.regular;
            timerWrapper.style.backgroundImage = `url(${imageUrl})`;
        })
        .catch(() => { })
}

// Exercise ---

function openExercise() {
    const selectedExercise = getRandomExercise();

    exerciseTitle.textContent = selectedExercise.title;
    exerciseImage.style.backgroundImage = `url(images/${selectedExercise.image})`;

    exercise.classList.add('visible');

    exerciseNext.focus();
}

function closeExercise() {
    exercise.classList.remove('visible');
}

function isExerciseOpen() {
    return exercise.classList.contains('visible');
}

function getRandomExercise() {
    if (exerciseList.length === 0) {
        exerciseList = shuffleArray(window.exercises)
    }
    return exerciseList.shift()
}

function playAnnouncement() {
    announceSound.play();
}


// Content ---

function hideContent() {
    if (contentDiv) {
        contentDiv.remove()
        contentDiv = null
        contentDivType = null
    }

    if (releaseWebsocket) {
        releaseWebsocket.close()
        releaseWebsocket = null
    }

    clearUrlParams()
    controlsTop.classList.add('hidden')
}


// Release Checklist ---

function initReleaseChecklist(skipRemove = false) {
    releaseChecklistButtonLoading()

    fetchWizardPreview(releaseChecklistProjectUuid)
        .then(data => {
            const url = data.url
            if (!skipRemove && !contentDiv) {
                contentDiv = document.createElement('div')
                contentDiv.classList.add('content', 'content-release')
                document.body.prepend(contentDiv)
            }
            contentDiv.innerHTML = `<iframe src="${url}" style="zoom: 0.75"></iframe>`
            contentDivType = 'release'

        })
        .catch(() => {
            alert('Failed to load release checklist.')
        })
        .finally(() => {
            releaseChecklistButtonReady()
        })
}

function openReleaseWebsocket() {
    const wsUrl = `wss://${wizard}/wizard-api/questionnaires/${releaseChecklistProjectUuid}/websocket`

    releaseWebsocket = new WebSocket(wsUrl)
    releaseWebsocket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data)
            if (data.data.type === 'SetContent_ServerQuestionnaireAction' && contentDiv) {
                initReleaseChecklist(skipRemove = true)
            }
        } catch { }
    })
}

function releaseChecklistButtonLoading() {
    buttonReleaseIcon.classList.add('hidden')
    buttonReleaseLoader.classList.remove('hidden')
    buttonRelease.disabled = true;
}

function releaseChecklistButtonReady() {
    buttonReleaseIcon.classList.remove('hidden')
    buttonReleaseLoader.classList.add('hidden')
    buttonRelease.disabled = false;
}


// YouTube Videos ---

function initVideo(video) {
    if (contentDiv) {
        contentDiv.remove()
    }

    const url = `https://www.youtube.com/embed/${video}`
    contentDiv = document.createElement('div')
    contentDiv.classList.add('content')
    contentDiv.innerHTML = `<iframe src="${url}"></iframe>`
    document.body.prepend(contentDiv)
    contentDivType = 'youtube'

    controlsTop.classList.remove('hidden')

    addUrlParam('video', video)
}

function initVideoLinks() {
    window.videos.reverse().forEach(({ icon, v }) => {
        const button = document.createElement('a')
        button.innerHTML = `<i class="${icon}"></i>`
        button.addEventListener('click', () => {
            initVideo(v)
        })
        controlsTop.prepend(button)
    })
}

function remoteVideoButtonLoading() {
    buttonRemoteVideoIcon.classList.add('hidden')
    buttonRemoteVideoLoader.classList.remove('hidden')
    buttonRemoteVideo.disabled = true;
}

function remoteVideoButtonReady() {
    buttonRemoteVideoIcon.classList.remove('hidden')
    buttonRemoteVideoLoader.classList.add('hidden')
    buttonRemoteVideo.disabled = false;
}

function openRemoteVideo() {
    const fetchPreviewData = (url) => fetch(`https://corsproxy.io/?url=${url}`).then(r => r.json())

    remoteVideoButtonLoading();

    fetchWizardPreview(removeVideoProjectUuid)
        .then(data => fetchPreviewData(data.url))
        .then(videoData => {
            if (videoData.video) {
                const videoId = getYouTubeVideoId(videoData.video);
                if (!videoId) {
                    alert('Invalid video URL. Please provide a valid YouTube video URL.');

                } else {
                    initVideo(videoId);
                }
            } else {
                alert('No video found in the remote data.');
            }
        })
        .catch(error => {
            console.error('Error fetching video data:', error);
            alert('Failed to load remote video data.');
        })
        .finally(() => {
            remoteVideoButtonReady();
        });
}


// Music ---

function initMusic() {
    musicButtonLoading()

    fetchWizardPreview(musicProjectUuid)
        .then(data => {
            const url = data.url
            if (!contentDiv) {
                contentDiv = document.createElement('div')
                contentDiv.classList.add('content')
                document.body.prepend(contentDiv)
            }
            contentDiv.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>`
            contentDivType = 'music'
        })
        .catch(() => {
            alert('Failed to load music.')
        })
        .finally(() => {
            musicButtonReady()
        })
}

function musicButtonLoading() {
    buttonMusicIcon.classList.add('hidden')
    buttonMusicLoader.classList.remove('hidden')
    buttonMusic.disabled = true;
}

function musicButtonReady() {
    buttonMusicIcon.classList.remove('hidden')
    buttonMusicLoader.classList.add('hidden')
    buttonMusic.disabled = false;
}


// Focus Mode ---

function toggleFocusMode() {
    if (focusMode.classList.contains('visible')) {
        focusMode.classList.remove('visible');
    } else {
        hideContent();
        focusMode.classList.add('visible');
        focusModeSound.play();
    }
}


// Utilities ---

function fetchWizardPreview(projectUuid) {
    const releaseChecklistUrl = `https://${wizard}/wizard-api/questionnaires/${projectUuid}/documents/preview`;

    const fetchPreview = () => fetch(releaseChecklistUrl).then(r => r.json());

    return new Promise((resolve, reject) => {
        const fetchChecklist = () => {
            fetchPreview()
                .then(data => {
                    if (data.status) {
                        setTimeout(fetchChecklist, 1000);
                    } else {
                        resolve(data);
                    }
                })
                .catch(err => reject(err));
        };

        fetchChecklist();
    });
}

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function shuffleArray(originalArray) {
    let array = JSON.parse(JSON.stringify(originalArray))
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function addUrlParam(key, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

function clearUrlParams() {
    window.history.replaceState({}, '', window.location.pathname);
}

// Init ---

window.onload = () => {
    initVideoLinks()

    const urlParams = new URLSearchParams(window.location.search);
    const video = urlParams.get('video');
    if (!video) return;
    initVideo(video)
}
