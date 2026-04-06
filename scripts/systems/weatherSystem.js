const RAIN_STREAK_COUNT = 120;
const SCREEN_DROPLET_COUNT = 14;
const LIGHTNING_DELAY_RANGE_MS = [7000, 16000];

const dayRainbowPhases = new Set(["sunrise", "morning", "midday", "sunset"]);

const weatherVisuals = {
  clear: {
    rainOpacity: "0",
    rainSpeed: "1.15",
    toneOpacity: "0",
    dropletOpacity: "0",
    rainbowOpacity: "0",
    lightningOpacity: "0",
    starVisibility: "1"
  },
  drizzle: {
    rainOpacity: "0.28",
    rainSpeed: "1.08",
    toneOpacity: "0.05",
    dropletOpacity: "0.18",
    rainbowOpacity: "0.85",
    lightningOpacity: "0",
    starVisibility: "0.18"
  },
  rainfall: {
    rainOpacity: "0.5",
    rainSpeed: "0.92",
    toneOpacity: "0.16",
    dropletOpacity: "0.28",
    rainbowOpacity: "0",
    lightningOpacity: "0",
    starVisibility: "0"
  },
  thunderstorm: {
    rainOpacity: "0.82",
    rainSpeed: "0.58",
    toneOpacity: "0.28",
    dropletOpacity: "0.38",
    rainbowOpacity: "0",
    lightningOpacity: "1",
    starVisibility: "0"
  }
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function createRainStreak() {
  const streak = document.createElement("span");
  streak.className = "rain-streak";
  streak.style.left = `${randomBetween(-8, 108)}%`;
  streak.style.top = `${randomBetween(-30, 20)}%`;
  streak.style.setProperty("--rain-length", `${randomBetween(22, 64)}px`);
  streak.style.setProperty("--rain-delay", `${randomBetween(-4, 0)}s`);
  streak.style.setProperty("--rain-drift", `${randomBetween(-18, 14)}px`);
  streak.style.setProperty("--rain-alpha", String(randomBetween(0.28, 0.92)));
  return streak;
}

function createScreenDroplet() {
  const droplet = document.createElement("span");
  droplet.className = "screen-droplet";
  droplet.style.left = `${randomBetween(4, 96)}%`;
  droplet.style.top = `${randomBetween(4, 88)}%`;
  droplet.style.setProperty("--droplet-size", `${randomBetween(2.6, 8.8)}rem`);
  droplet.style.setProperty("--droplet-blur", `${randomBetween(0.4, 1.4)}px`);
  droplet.style.setProperty("--droplet-delay", `${randomBetween(0, 6)}s`);
  return droplet;
}

function createLightningBolt() {
  const bolt = document.createElement("div");
  bolt.className = "lightning-layer__bolt";
  return bolt;
}

function createRainbow() {
  const rainbow = document.createElement("div");
  rainbow.className = "rainbow-layer__arc";
  return rainbow;
}

export function createWeatherSystem({
  rainbowElement,
  toneElement,
  rainElement,
  dropletElement,
  lightningElement,
  timeEngine,
  weatherEngine
}) {
  const rainbow = createRainbow();
  const streaks = Array.from({ length: RAIN_STREAK_COUNT }, createRainStreak);
  const droplets = Array.from({ length: SCREEN_DROPLET_COUNT }, createScreenDroplet);
  const lightningFlash = document.createElement("div");
  lightningFlash.className = "lightning-layer__flash";
  const lightningBolt = createLightningBolt();

  rainbowElement.replaceChildren(rainbow);
  toneElement.replaceChildren();
  rainElement.replaceChildren(...streaks);
  dropletElement.replaceChildren(...droplets);
  lightningElement.replaceChildren(lightningFlash, lightningBolt);

  let currentPhase = timeEngine.currentPhase;
  let currentWeatherMode = weatherEngine.getSnapshot().currentMode;
  let lightningTimeoutId = 0;
  let lightningResetId = 0;

  function clearLightningTimers() {
    window.clearTimeout(lightningTimeoutId);
    window.clearTimeout(lightningResetId);
  }

  function setLightningVisible(visible) {
    lightningElement.classList.toggle("is-active", visible);
  }

  function scheduleLightning() {
    clearLightningTimers();

    if (currentWeatherMode !== "thunderstorm") {
      setLightningVisible(false);
      return;
    }

    lightningTimeoutId = window.setTimeout(() => {
      setLightningVisible(true);
      lightningBolt.style.left = `${randomBetween(14, 82)}%`;
      lightningBolt.style.top = `${randomBetween(2, 24)}%`;
      lightningBolt.style.height = `${randomBetween(7, 14)}rem`;
      lightningBolt.style.transform = `skewX(${randomBetween(-10, 10)}deg)`;

      lightningResetId = window.setTimeout(() => {
        setLightningVisible(false);
        if (Math.random() < 0.34) {
          lightningTimeoutId = window.setTimeout(() => {
            setLightningVisible(true);
            lightningResetId = window.setTimeout(() => {
              setLightningVisible(false);
              scheduleLightning();
            }, randomInt(120, 220));
          }, randomInt(120, 260));
        } else {
          scheduleLightning();
        }
      }, randomInt(170, 320));
    }, randomInt(LIGHTNING_DELAY_RANGE_MS[0], LIGHTNING_DELAY_RANGE_MS[1]));
  }

  function applyWeather() {
    const visuals = weatherVisuals[currentWeatherMode] ?? weatherVisuals.clear;
    const showRainbow =
      currentWeatherMode === "drizzle" && dayRainbowPhases.has(currentPhase);

    rainElement.style.setProperty("--weather-rain-opacity", visuals.rainOpacity);
    rainElement.style.setProperty("--weather-rain-speed", visuals.rainSpeed);
    toneElement.style.setProperty("--weather-tone-opacity", visuals.toneOpacity);
    dropletElement.style.setProperty(
      "--weather-droplet-opacity",
      visuals.dropletOpacity
    );
    rainbowElement.style.setProperty(
      "--weather-rainbow-opacity",
      showRainbow ? visuals.rainbowOpacity : "0"
    );
    document.documentElement.style.setProperty(
      "--weather-star-visibility",
      visuals.starVisibility
    );
    document.body.dataset.weatherMode = currentWeatherMode;
    scheduleLightning();
  }

  return {
    init() {
      timeEngine.subscribe(snapshot => {
        currentPhase = snapshot.currentPhase;
        applyWeather();
      });

      weatherEngine.subscribe(snapshot => {
        currentWeatherMode = snapshot.currentMode;
        applyWeather();
      });
    },
    destroy() {
      clearLightningTimers();
      delete document.body.dataset.weatherMode;
    }
  };
}
