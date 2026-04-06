// Bunny tuning variables
// `BUNNY_LEFT`: horizontal placement.
// `BUNNY_BOTTOM`: distance from the bottom edge.
// `BUNNY_SCALE`: overall bunny size.
const BUNNY_LEFT = 14;
const BUNNY_BOTTOM = 6;
const BUNNY_SCALE = 2.16;
const MOBILE_BUNNY_LEFT = 18;
const MOBILE_BUNNY_BOTTOM = 7;
const MOBILE_BUNNY_SCALE = 2.02;
const MOBILE_BREAKPOINT = 720;
const BUNNY_RIGHT = 86;
const MOBILE_BUNNY_RIGHT = 82;

const bunnyPhaseStyles = {
  sunrise: {
    brightness: "1.02",
    saturate: "0.96",
    contrast: "0.96",
    hueRotate: "-6deg"
  },
  morning: {
    brightness: "1.04",
    saturate: "1.01",
    contrast: "0.99",
    hueRotate: "-2deg"
  },
  midday: {
    brightness: "1.08",
    saturate: "1.06",
    contrast: "1",
    hueRotate: "0deg"
  },
  sunset: {
    brightness: "0.98",
    saturate: "1.04",
    contrast: "1.01",
    hueRotate: "-8deg"
  },
  twilight: {
    brightness: "0.82",
    saturate: "0.82",
    contrast: "1.01",
    hueRotate: "8deg"
  },
  night: {
    brightness: "0.64",
    saturate: "0.62",
    contrast: "0.95",
    hueRotate: "14deg"
  }
};

function getResponsiveMetrics() {
  const compact = window.innerWidth < MOBILE_BREAKPOINT;

  return compact
    ? {
        left: MOBILE_BUNNY_RIGHT,
        bottom: MOBILE_BUNNY_BOTTOM,
        scale: MOBILE_BUNNY_SCALE
      }
    : {
        left: BUNNY_RIGHT,
        bottom: BUNNY_BOTTOM,
        scale: BUNNY_SCALE
      };
}

export function createBunnySystem({ element, timeEngine, weatherEngine }) {
  const sleepImage = document.createElement("img");
  sleepImage.className = "bunny-layer__sleep";
  sleepImage.src = "assets/decor/bunnySleeping.gif";
  sleepImage.alt = "";
  sleepImage.draggable = false;
  element.replaceChildren(sleepImage);
  let responsiveMetrics = getResponsiveMetrics();

  function applyLayout() {
    element.style.setProperty("--bunny-left", `${responsiveMetrics.left}%`);
    element.style.setProperty("--bunny-bottom", `${responsiveMetrics.bottom}%`);
    element.style.setProperty("--bunny-scale", String(responsiveMetrics.scale));
  }

  function handleResize() {
    responsiveMetrics = getResponsiveMetrics();
    applyLayout();
  }

  return {
    init() {
      applyLayout();
      timeEngine.subscribe(snapshot => {
        const phaseStyle =
          bunnyPhaseStyles[snapshot.currentPhase] ?? bunnyPhaseStyles.midday;
        element.style.setProperty("--bunny-brightness", phaseStyle.brightness);
        element.style.setProperty("--bunny-saturate", phaseStyle.saturate);
        element.style.setProperty("--bunny-contrast", phaseStyle.contrast);
        element.style.setProperty("--bunny-hue-rotate", phaseStyle.hueRotate);
      });
      weatherEngine?.subscribe(snapshot => {
        element.style.opacity = snapshot.currentMode === "thunderstorm" ? "0" : "1";
      });
      window.addEventListener("resize", handleResize);
    },
    destroy() {
      window.removeEventListener("resize", handleResize);
    }
  };
}
