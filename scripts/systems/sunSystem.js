const MOBILE_BREAKPOINT = 720;
const SUNRISE_START = 5;
const SUNSET_END = 19;

// Celestial tuning variables
// `DESKTOP_SUN_*`: desktop sun position, size, and arc controls.
// `MOBILE_SUN_*`: mobile sun position, size, and arc controls.
// `DESKTOP_MOON_*`: desktop moon position, size, and arc controls.
// `MOBILE_MOON_*`: mobile moon position, size, and arc controls.
// `MOON_PHASE_CYCLE_HOURS`: lower = moon phases change faster.
const DESKTOP_SUN_LEFT = 18;
const DESKTOP_SUN_HORIZON = 34;
const DESKTOP_SUN_ARC_HEIGHT = 24;
const DESKTOP_SUN_SCALE = 1;
const MOBILE_SUN_LEFT = 14;
const MOBILE_SUN_HORIZON = 28;
const MOBILE_SUN_ARC_HEIGHT = 18;
const MOBILE_SUN_SCALE = 0.9;

const DESKTOP_MOON_LEFT = 78;
const DESKTOP_MOON_HIGH_LINE = 10;
const DESKTOP_MOON_ARC_DEPTH = 8;
const DESKTOP_MOON_SCALE = 0.88;
const MOBILE_MOON_LEFT = 82;
const MOBILE_MOON_HIGH_LINE = 9;
const MOBILE_MOON_ARC_DEPTH = 6;
const MOBILE_MOON_SCALE = 0.76;

const MOON_PHASE_CYCLE_HOURS = 24;

const phaseStyles = {
  sunrise: {
    sunOpacity: "0.68",
    sunBrightness: "1.04",
    sunSaturate: "0.98",
    sunHueRotate: "-6deg",
    moonOpacity: "0",
    moonBrightness: "0.98",
    moonHueRotate: "2deg"
  },
  morning: {
    sunOpacity: "0.76",
    sunBrightness: "1.04",
    sunSaturate: "0.98",
    sunHueRotate: "-2deg",
    moonOpacity: "0",
    moonBrightness: "0.92",
    moonHueRotate: "0deg"
  },
  midday: {
    sunOpacity: "0.72",
    sunBrightness: "1.08",
    sunSaturate: "0.95",
    sunHueRotate: "0deg",
    moonOpacity: "0.1",
    moonBrightness: "0.88",
    moonHueRotate: "0deg"
  },
  sunset: {
    sunOpacity: "0.66",
    sunBrightness: "0.98",
    sunSaturate: "1.04",
    sunHueRotate: "-10deg",
    moonOpacity: "0.54",
    moonBrightness: "0.98",
    moonHueRotate: "4deg"
  },
  twilight: {
    sunOpacity: "0.08",
    sunBrightness: "0.82",
    sunSaturate: "0.8",
    sunHueRotate: "10deg",
    moonOpacity: "0.8",
    moonBrightness: "1",
    moonHueRotate: "6deg"
  },
  night: {
    sunOpacity: "0",
    sunBrightness: "0.7",
    sunSaturate: "0.6",
    sunHueRotate: "16deg",
    moonOpacity: "0.92",
    moonBrightness: "1.02",
    moonHueRotate: "10deg"
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

function getMoonPhasePath(phaseProgress) {
  const litFraction = (Math.cos(phaseProgress * Math.PI * 2) + 1) / 2;

  if (litFraction <= 0.02) {
    return {
      path: "",
      visibility: 0
    };
  }

  if (litFraction >= 0.98) {
    return {
      path: "M50 0 A50 50 0 1 1 49.99 0 Z",
      visibility: 1
    };
  }

  const waxing = phaseProgress < 0.5;
  const outerSweep = waxing ? 1 : 0;
  const controlX = waxing
    ? 50 + (0.5 - litFraction) * 120
    : 50 - (0.5 - litFraction) * 120;

  return {
    path: `M50 0 A50 50 0 0 ${outerSweep} 50 100 Q ${controlX} 50 50 0 Z`,
    visibility: 1
  };
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

  function updateCelestials(snapshot) {
    const phaseStyle = phaseStyles[snapshot.currentPhase] ?? phaseStyles.midday;
    const progress = getDayProgress(snapshot.normalizedHour);

    const sunArcLift = Math.sin(progress * Math.PI);
    const sunLeft = responsiveMetrics.sunLeft;
    const sunTop =
      responsiveMetrics.sunHorizon -
      sunArcLift * responsiveMetrics.sunArcHeight;

    const moonLeft = responsiveMetrics.moonLeft;
    const moonTop =
      responsiveMetrics.moonHighLine +
      Math.sin(progress * Math.PI) * responsiveMetrics.moonArcDepth;

    const phaseProgress =
      (((snapshot.normalizedHour % MOON_PHASE_CYCLE_HOURS) + MOON_PHASE_CYCLE_HOURS) %
        MOON_PHASE_CYCLE_HOURS) /
      MOON_PHASE_CYCLE_HOURS;
    const { path, visibility } = getMoonPhasePath(phaseProgress);
    const moonOpacity = Number.parseFloat(phaseStyle.moonOpacity) * visibility;

    element.style.setProperty("--sun-left", `${sunLeft}%`);
    element.style.setProperty("--sun-top", `${sunTop}%`);
    element.style.setProperty("--sun-scale", String(responsiveMetrics.sunScale));
    element.style.setProperty("--sun-opacity", phaseStyle.sunOpacity);
    element.style.setProperty("--sun-brightness", phaseStyle.sunBrightness);
    element.style.setProperty("--sun-saturate", phaseStyle.sunSaturate);
    element.style.setProperty("--sun-hue-rotate", phaseStyle.sunHueRotate);

    element.style.setProperty("--moon-left", `${moonLeft}%`);
    element.style.setProperty("--moon-top", `${moonTop}%`);
    element.style.setProperty("--moon-scale", String(responsiveMetrics.moonScale));
    element.style.setProperty("--moon-opacity", String(moonOpacity));
    element.style.setProperty("--moon-brightness", phaseStyle.moonBrightness);
    element.style.setProperty("--moon-hue-rotate", phaseStyle.moonHueRotate);
    clipShape.setAttribute("d", path);
  }

  function handleResize() {
    responsiveMetrics = getResponsiveMetrics();
    updateCelestials(timeEngine.getSnapshot());
  }

  return {
    init() {
      timeEngine.subscribe(updateCelestials);
      window.addEventListener("resize", handleResize);
    },
    destroy() {
      window.removeEventListener("resize", handleResize);
    }
  };
}
