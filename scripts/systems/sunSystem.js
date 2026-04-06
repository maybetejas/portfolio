const MOBILE_BREAKPOINT = 720;
const SUNRISE_START = 5;
const SUNSET_END = 19;
const TWILIGHT_START = 19;
const NIGHT_START = 22;
const MOON_API_URL = "https://api.met.no/weatherapi/sunrise/3.0/moon";

// Celestial tuning variables
// `DESKTOP_SUN_*`: desktop sun position, size, and arc controls.
// `MOBILE_SUN_*`: mobile sun position, size, and arc controls.
// `DESKTOP_MOON_*`: desktop moon position, size, and arc controls.
// `MOBILE_MOON_*`: mobile moon position, size, and arc controls.
const DESKTOP_SUN_LEFT = 12;
const DESKTOP_SUN_HORIZON = 48;
const DESKTOP_SUN_ARC_HEIGHT = 34;
const DESKTOP_SUN_SCALE = 1.1;
const MOBILE_SUN_LEFT = 12;
const MOBILE_SUN_HORIZON = 46;
const MOBILE_SUN_ARC_HEIGHT = 30;
const MOBILE_SUN_SCALE = 1;

const DESKTOP_MOON_LEFT = 78;
const DESKTOP_MOON_HIGH_LINE = 10;
const DESKTOP_MOON_ARC_DEPTH = 8;
const DESKTOP_MOON_SCALE = 0.88;
const MOBILE_MOON_LEFT = 82;
const MOBILE_MOON_HIGH_LINE = 9;
const MOBILE_MOON_ARC_DEPTH = 6;
const MOBILE_MOON_SCALE = 0.76;

const phaseStyles = {
  sunrise: {
    sunOpacity: 0.34,
    sunBrightness: 0.76,
    sunSaturate: 0.58,
    sunHueRotate: "-8deg",
    moonOpacity: 0,
    moonBrightness: 0.95,
    moonHueRotate: "0deg"
  },
  morning: {
    sunOpacity: 0.42,
    sunBrightness: 0.8,
    sunSaturate: 0.6,
    sunHueRotate: "-4deg",
    moonOpacity: 0,
    moonBrightness: 0.94,
    moonHueRotate: "0deg"
  },
  midday: {
    sunOpacity: 0.5,
    sunBrightness: 0.86,
    sunSaturate: 0.64,
    sunHueRotate: "0deg",
    moonOpacity: 0,
    moonBrightness: 0.92,
    moonHueRotate: "0deg"
  },
  sunset: {
    sunOpacity: 0.3,
    sunBrightness: 0.72,
    sunSaturate: 0.58,
    sunHueRotate: "-12deg",
    moonOpacity: 0.08,
    moonBrightness: 0.92,
    moonHueRotate: "4deg"
  },
  twilight: {
    sunOpacity: 0,
    sunBrightness: 0.78,
    sunSaturate: 0.84,
    sunHueRotate: "10deg",
    moonOpacity: 0.34,
    moonBrightness: 0.96,
    moonHueRotate: "6deg"
  },
  night: {
    sunOpacity: 0,
    sunBrightness: 0.7,
    sunSaturate: 0.7,
    sunHueRotate: "12deg",
    moonOpacity: 0.82,
    moonBrightness: 1,
    moonHueRotate: "8deg"
  }
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getResponsiveMetrics() {
  const compact = window.innerWidth < MOBILE_BREAKPOINT;

  return compact
    ? {
        sunLeft: MOBILE_SUN_LEFT,
        sunHorizon: MOBILE_SUN_HORIZON,
        sunArcHeight: MOBILE_SUN_ARC_HEIGHT,
        sunScale: MOBILE_SUN_SCALE,
        moonLeft: MOBILE_MOON_LEFT,
        moonHighLine: MOBILE_MOON_HIGH_LINE,
        moonArcDepth: MOBILE_MOON_ARC_DEPTH,
        moonScale: MOBILE_MOON_SCALE
      }
    : {
        sunLeft: DESKTOP_SUN_LEFT,
        sunHorizon: DESKTOP_SUN_HORIZON,
        sunArcHeight: DESKTOP_SUN_ARC_HEIGHT,
        sunScale: DESKTOP_SUN_SCALE,
        moonLeft: DESKTOP_MOON_LEFT,
        moonHighLine: DESKTOP_MOON_HIGH_LINE,
        moonArcDepth: DESKTOP_MOON_ARC_DEPTH,
        moonScale: DESKTOP_MOON_SCALE
      };
}

function getDayProgress(hour) {
  const clampedHour = clamp(hour, SUNRISE_START, SUNSET_END);
  return (clampedHour - SUNRISE_START) / (SUNSET_END - SUNRISE_START);
}

function getLocalDateIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getTimezoneOffsetLabel() {
  const totalMinutes = -new Date().getTimezoneOffset();
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function getFallbackMoonPhaseAngle(date = new Date()) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicMonthMs = 29.530588853 * 24 * 60 * 60 * 1000;
  const age = ((date.getTime() - knownNewMoon) % synodicMonthMs + synodicMonthMs) % synodicMonthMs;
  return (age / synodicMonthMs) * 360;
}

async function fetchMoonPhaseAngle() {
  const url = new URL(MOON_API_URL);
  url.searchParams.set("lat", "0");
  url.searchParams.set("lon", "0");
  url.searchParams.set("date", getLocalDateIso());
  url.searchParams.set("offset", getTimezoneOffsetLabel());

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Moon API failed: ${response.status}`);
  }

  const payload = await response.json();
  return Number(payload?.properties?.moonphase);
}

function buildMoon() {
  const moon = document.createElement("div");
  moon.className = "moon-layer__orb";

  const namespace = "http://www.w3.org/2000/svg";
  const clipId = `moon-clip-${Math.random().toString(36).slice(2)}`;
  const svg = document.createElementNS(namespace, "svg");
  const defs = document.createElementNS(namespace, "defs");
  const clipPath = document.createElementNS(namespace, "clipPath");
  const clipShape = document.createElementNS(namespace, "path");
  const image = document.createElementNS(namespace, "image");

  svg.setAttribute("class", "moon-layer__svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");

  clipPath.setAttribute("id", clipId);
  clipShape.setAttribute("d", "M50 0 A50 50 0 1 1 49.99 0 Z");
  clipPath.appendChild(clipShape);
  defs.appendChild(clipPath);

  image.setAttribute("class", "moon-layer__image");
  image.setAttribute("href", "assets/decor/moon.webp");
  image.setAttribute("width", "100");
  image.setAttribute("height", "100");
  image.setAttribute("clip-path", `url(#${clipId})`);

  svg.append(defs, image);
  moon.appendChild(svg);

  return { moon, clipShape };
}

function getMoonPhasePathFromAngle(angle) {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const radians = (normalizedAngle * Math.PI) / 180;
  const litFraction = (1 - Math.cos(radians)) / 2;

  if (litFraction <= 0.02) {
    return { path: "", visibility: 0 };
  }

  if (litFraction >= 0.98) {
    return {
      path: "M50 0 A50 50 0 1 1 49.99 0 Z",
      visibility: 1
    };
  }

  const waxing = normalizedAngle < 180;
  const outerSweep = waxing ? 1 : 0;
  const controlX = waxing
    ? 50 + (0.5 - litFraction) * 120
    : 50 - (0.5 - litFraction) * 120;

  return {
    path: `M50 0 A50 50 0 0 ${outerSweep} 50 100 Q ${controlX} 50 50 0 Z`,
    visibility: 1
  };
}

function getMoonNightGlow(hour) {
  const wrappedHour = hour >= NIGHT_START ? hour : hour + 24;
  const distanceFromMidnight = Math.abs(wrappedHour - 24);
  return clamp(1 - distanceFromMidnight / 2.5, 0, 1);
}

export function createSunSystem({ element, timeEngine }) {
  const sun = document.createElement("img");
  sun.className = "sun-layer__image";
  sun.src = "assets/decor/sun.webp";
  sun.alt = "";
  sun.draggable = false;

  const { moon, clipShape } = buildMoon();
  element.replaceChildren(sun, moon);

  let responsiveMetrics = getResponsiveMetrics();
  let moonPhaseAngle = getFallbackMoonPhaseAngle();
  let lastMoonPhaseDate = "";

  function applyMoonPhase() {
    const { path } = getMoonPhasePathFromAngle(moonPhaseAngle);
    clipShape.setAttribute("d", path);
  }

  async function refreshMoonPhase() {
    const today = getLocalDateIso();
    if (today === lastMoonPhaseDate) return;

    lastMoonPhaseDate = today;

    try {
      moonPhaseAngle = await fetchMoonPhaseAngle();
    } catch {
      moonPhaseAngle = getFallbackMoonPhaseAngle();
    }

    applyMoonPhase();
  }

  function updateCelestials(snapshot) {
    const phaseStyle = phaseStyles[snapshot.currentPhase] ?? phaseStyles.midday;
    const progress = getDayProgress(snapshot.normalizedHour);
    const sunArcLift = Math.sin(progress * Math.PI);
    const sunTop = responsiveMetrics.sunHorizon - sunArcLift * responsiveMetrics.sunArcHeight;
    const moonTop = responsiveMetrics.moonHighLine + Math.sin(progress * Math.PI) * responsiveMetrics.moonArcDepth;
    const moonGlowBoost =
      snapshot.currentPhase === "night"
        ? getMoonNightGlow(snapshot.normalizedHour)
        : 0;

    element.style.setProperty("--sun-left", `${responsiveMetrics.sunLeft}%`);
    element.style.setProperty("--sun-top", `${sunTop}%`);
    element.style.setProperty("--sun-scale", String(responsiveMetrics.sunScale));
    element.style.setProperty("--sun-opacity", String(phaseStyle.sunOpacity));
    element.style.setProperty("--sun-brightness", phaseStyle.sunBrightness);
    element.style.setProperty("--sun-saturate", phaseStyle.sunSaturate);
    element.style.setProperty("--sun-hue-rotate", phaseStyle.sunHueRotate);
    element.style.setProperty("--moon-left", `${responsiveMetrics.moonLeft}%`);
    element.style.setProperty("--moon-top", `${moonTop}%`);
    element.style.setProperty("--moon-scale", String(responsiveMetrics.moonScale));
    element.style.setProperty("--moon-opacity", String(phaseStyle.moonOpacity));
    element.style.setProperty("--moon-brightness", phaseStyle.moonBrightness);
    element.style.setProperty("--moon-hue-rotate", phaseStyle.moonHueRotate);
    element.style.setProperty("--moon-glow-opacity", String(0.08 + moonGlowBoost * 0.3));
  }

  function handleResize() {
    responsiveMetrics = getResponsiveMetrics();
    updateCelestials(timeEngine.getSnapshot());
  }

  return {
    init() {
      applyMoonPhase();
      refreshMoonPhase();

      timeEngine.subscribe(snapshot => {
        updateCelestials(snapshot);
        if (snapshot.isLive) {
          refreshMoonPhase();
        }
      });

      window.addEventListener("resize", handleResize);
    },
    destroy() {
      window.removeEventListener("resize", handleResize);
    }
  };
}
