// Bird tuning variables
// `FIRST_FLOCK_DELAY_MS`: first bird wave after load.
// `FLOCK_INTERVAL_MS`: repeat gap after the first wave.
// `FLOCKS_PER_WAVE`: min/max flock groups per wave.
// `BIRDS_PER_FLOCK`: min/max birds inside each flock.
const FIRST_FLOCK_DELAY_MS = 10000;
const FLOCK_INTERVAL_MS = 120000;
const FLOCKS_PER_WAVE = [2, 4];
const BIRDS_PER_FLOCK = [3, 5];
const FLOCK_DURATION_RANGE = [18, 28];
const FLOCK_HEIGHT_RANGE = [10, 42];
const FLOCK_SCALE_RANGE = [0.55, 1.2];
const FLOCK_SWAY_RANGE = [10, 28];

const activeBirdPhases = new Set(["sunrise", "morning", "midday", "sunset"]);

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function createBird() {
  const image = document.createElement("img");
  image.className = "bird-flock__bird";
  image.src = "assets/decor/bird.gif";
  image.alt = "";
  image.draggable = false;
  return image;
}

function createFlock() {
  const flock = document.createElement("div");
  flock.className = "bird-flock";

  const birds = randomInt(BIRDS_PER_FLOCK[0], BIRDS_PER_FLOCK[1]);
  for (let index = 0; index < birds; index += 1) {
    const bird = createBird();
    bird.style.left = `${index * randomBetween(18, 34)}px`;
    bird.style.top = `${randomBetween(-8, 10)}px`;
    bird.style.transform = `scale(${randomBetween(0.72, 1.12)})`;
    bird.style.opacity = String(randomBetween(0.45, 0.8));
    flock.appendChild(bird);
  }

  return flock;
}

export function createBirdSystem({ element, timeEngine, weatherEngine }) {
  let currentPhase = timeEngine.currentPhase;
  let currentWeatherMode = "clear";
  let firstWaveTimeoutId = 0;
  let intervalId = 0;

  function clearBirds() {
    element.replaceChildren();
  }

  function spawnWave() {
    if (!activeBirdPhases.has(currentPhase) || currentWeatherMode !== "clear") {
      return;
    }

    const flockCount = randomInt(FLOCKS_PER_WAVE[0], FLOCKS_PER_WAVE[1]);

    for (let index = 0; index < flockCount; index += 1) {
      const flock = createFlock();
      flock.style.top = `${randomBetween(FLOCK_HEIGHT_RANGE[0], FLOCK_HEIGHT_RANGE[1])}%`;
      flock.style.right = `${-randomBetween(8, 22)}rem`;
      flock.style.setProperty("--flock-opacity", String(randomBetween(0.26, 0.5)));
      flock.style.setProperty("--flock-scale", String(randomBetween(
        FLOCK_SCALE_RANGE[0],
        FLOCK_SCALE_RANGE[1]
      )));
      flock.style.setProperty("--flock-sway", `${randomBetween(
        FLOCK_SWAY_RANGE[0],
        FLOCK_SWAY_RANGE[1]
      )}px`);
      flock.style.setProperty("--flock-duration", `${randomBetween(
        FLOCK_DURATION_RANGE[0],
        FLOCK_DURATION_RANGE[1]
      )}s`);
      flock.style.animationDelay = `${index * randomBetween(0.6, 1.8)}s`;
      flock.addEventListener("animationend", () => flock.remove(), { once: true });
      element.appendChild(flock);
    }
  }

  return {
    init() {
      timeEngine.subscribe(snapshot => {
        currentPhase = snapshot.currentPhase;

        if (!activeBirdPhases.has(currentPhase)) {
          clearBirds();
        }
      });

      weatherEngine?.subscribe(snapshot => {
        currentWeatherMode = snapshot.currentMode;
        if (currentWeatherMode !== "clear") {
          clearBirds();
        }
      });

      firstWaveTimeoutId = window.setTimeout(() => {
        spawnWave();
        intervalId = window.setInterval(spawnWave, FLOCK_INTERVAL_MS);
      }, FIRST_FLOCK_DELAY_MS);
    },
    destroy() {
      window.clearTimeout(firstWaveTimeoutId);
      window.clearInterval(intervalId);
    }
  };
}
