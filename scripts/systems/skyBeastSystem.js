const FIRST_BEAST_DELAY_MS = 0;
const BEAST_INTERVAL_MS = 1;
const BEAST_DURATION_RANGE = [20, 32];
const BEAST_HEIGHT_RANGE = [6, 28];
const BEAST_SWAY_RANGE = [8, 22];

const activePhases = new Set(["sunrise", "morning", "midday", "sunset", "twilight", "night"]);

const beastAssets = [
  {
    src: "assets/decor/wyvern.gif",
    sizeVar: "var(--wyvern-size)",
    opacityRange: [0.58, 0.82],
    faceRight: true
  },
  {
    src: "assets/decor/dragon.gif",
    sizeVar: "var(--dragon-size)",
    opacityRange: [0.6, 0.86],
    faceRight: true
  }
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export function createSkyBeastSystem({ element, timeEngine, weatherEngine }) {
  let currentPhase = timeEngine.currentPhase;
  let currentWeatherMode = "clear";
  let firstSpawnTimeoutId = 0;
  let intervalId = 0;
  let activeBeast = null;
  let nextBeastIndex = 0;

  function pickBeast() {
    const beast = beastAssets[nextBeastIndex % beastAssets.length];
    nextBeastIndex = (nextBeastIndex + 1) % beastAssets.length;
    return beast;
  }

  function createBeast() {
    const beastMeta = pickBeast();
    const beast = document.createElement("img");
    beast.className = "sky-beast";
    beast.classList.add(beastMeta.src.includes("dragon") ? "sky-beast--dragon" : "sky-beast--wyvern");
    beast.src = beastMeta.src;
    beast.alt = "";
    beast.draggable = false;
    beast.style.setProperty("--beast-size", beastMeta.sizeVar);
    beast.style.setProperty("--beast-top", `${randomBetween(BEAST_HEIGHT_RANGE[0], BEAST_HEIGHT_RANGE[1])}%`);
    beast.style.setProperty("--beast-opacity", String(randomBetween(
      beastMeta.opacityRange[0],
      beastMeta.opacityRange[1]
    )));
    beast.style.setProperty("--beast-scale", String(randomBetween(0.92, 1.18)));
    beast.style.setProperty("--beast-sway", `${randomBetween(
      BEAST_SWAY_RANGE[0],
      BEAST_SWAY_RANGE[1]
    )}px`);
    beast.style.setProperty("--beast-duration", `${randomBetween(
      BEAST_DURATION_RANGE[0],
      BEAST_DURATION_RANGE[1]
    )}s`);
    beast.dataset.faceRight = beastMeta.faceRight ? "true" : "false";
    return beast;
  }

  function clearBeasts() {
    activeBeast = null;
    element.replaceChildren();
  }

  function spawnSingleBeast() {
    if (!activePhases.has(currentPhase) || currentWeatherMode !== "clear") {
      return;
    }

    if (activeBeast && activeBeast.isConnected) {
      return;
    }

    const beast = createBeast();
    const beastFaceRight = beast.dataset.faceRight === "true";
    beast.style.setProperty("--beast-flip", beastFaceRight ? "1" : "-1");
    beast.addEventListener("animationend", () => {
      if (activeBeast === beast) {
        activeBeast = null;
      }
      beast.remove();
      }, { once: true });
    activeBeast = beast;
    element.appendChild(beast);
  }

  return {
    init() {
      timeEngine.subscribe(snapshot => {
        currentPhase = snapshot.currentPhase;
      });

      weatherEngine?.subscribe(snapshot => {
        currentWeatherMode = snapshot.currentMode;
        if (currentWeatherMode !== "clear") {
          clearBeasts();
        }
      });

      firstSpawnTimeoutId = window.setTimeout(() => {
        spawnSingleBeast();
        intervalId = window.setInterval(spawnSingleBeast, BEAST_INTERVAL_MS);
      }, FIRST_BEAST_DELAY_MS);
    },
    destroy() {
      window.clearTimeout(firstSpawnTimeoutId);
      window.clearInterval(intervalId);
    }
  };
}
