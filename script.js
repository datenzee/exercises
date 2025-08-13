const defaultTime = 30 * 60;
const imageQuery = 'sports gym bouldering fitness climbing workout exercise';
const announceSound = new Audio('audio/announce.wav');
const focusModeSound = new Audio('audio/silence.mp3');
const remoteVideoDataUrl = 'https://app.fair-wizard.com/wizard-api/questionnaires/973fadf9-f21b-4e81-8d42-1dc424dac96b/documents/preview';

const buttonPlay = document.getElementById('button-play')
const buttonYoutube = document.getElementById('button-youtube')
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

let exerciseList = shuffleArray(window.exercises)
let interval
let videoDiv

buttonPlay.addEventListener('click', () => {
    startStopTimer()
})

buttonYoutube.addEventListener('click', () => {
    if (videoDiv) {
        hideVideo()
    } else {
        initVideo(window.videos[window.videos.length - 1].v)
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

function toggleFocusMode() {
    if (focusMode.classList.contains('visible')) {
        focusMode.classList.remove('visible');
    } else {
        focusMode.classList.add('visible');
        focusModeSound.play();
    }
}

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

function shuffleArray(originalArray) {
    let array = JSON.parse(JSON.stringify(originalArray))
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function playAnnouncement() {
    announceSound.play();
}

function initVideo(video) {
    if (videoDiv) {
        videoDiv.remove()
    }

    const url = `https://www.youtube.com/embed/${video}`
    videoDiv = document.createElement('div')
    videoDiv.classList.add('video')
    videoDiv.innerHTML = `<iframe src="${url}"></iframe>`
    document.body.prepend(videoDiv)

    controlsTop.classList.remove('hidden')

    const params = new URLSearchParams(window.location.search);
    params.set('video', video);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

function hideVideo() {
    if (videoDiv) {
        videoDiv.remove()
        videoDiv = null
    }

    controlsTop.classList.add('hidden')
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
    const fetchPreview = () => fetch(remoteVideoDataUrl).then(r => r.json())
    const fetchPreviewData = (url) => fetch(`https://corsproxy.io/?url=${url}`).then(r => r.json())

    const fetchVideo = () => {
        fetchPreview()
            .then(data => {
                if (data.status) {
                    setTimeout(fetchVideo, 1000)
                } else {
                    fetchPreviewData(data.url)
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
            })
    }

    remoteVideoButtonLoading();
    fetchVideo();
}

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

window.onload = () => {
    initVideoLinks()

    const urlParams = new URLSearchParams(window.location.search);
    const video = urlParams.get('video');
    if (!video) return;
    initVideo(video)
}
