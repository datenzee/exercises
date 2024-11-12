const defaultTime = 30 * 60;
const imageQuery = 'fitness sports gym';
const announceSound = new Audio('announce.wav');

const buttonPlay = document.getElementById('button-play')
const buttonExercise = document.getElementById('button-exercise')
const timer = document.querySelector('.timer')
const timerWrapper = document.querySelector('.timer-wrapper')
const exercise = document.querySelector('.exercise')
const exerciseTitle = document.querySelector('.exercise-title')
const exerciseImage = document.querySelector('.exercise-image')
const exerciseDone = document.querySelector('.exercise-done')
const exerciseNext = document.querySelector('.exercise-next')

let exerciseList = shuffleArray(window.exercises)
let interval

buttonPlay.addEventListener('click', () => {
    if (interval) {
        stopTimer()
    } else {
        startTimer()
    }
})

buttonExercise.addEventListener('click', () => {
    openExercise()
})

exerciseDone.addEventListener('click', () => {
    closeExercise()
})

exerciseNext.addEventListener('click', () => {
    openExercise()
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

function startTimer() {
    let time = defaultTime;
    updateTimer(time);
    updateBackground();
    interval = setInterval(() => {
        time--;
        updateTimer(time);
        if (time === 0) {
            clearInterval(interval);
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


function openExercise() {
    const selectedExercise = getRandomExercise();

    exerciseTitle.textContent = selectedExercise.title;
    exerciseImage.style.backgroundImage = `url(images/${selectedExercise.image})`;

    exercise.classList.add('visible');
}

function closeExercise() {
    exercise.classList.remove('visible');
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
