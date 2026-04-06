// Cloud tuning variables
// `DESKTOP_MAIN_CLOUD_SCALE`: front cloud size on desktop.
// `DESKTOP_BACK_CLOUD_SCALE`: back cloud size on desktop.
// `MOBILE_MAIN_CLOUD_SCALE`: front cloud size on mobile.
// `MOBILE_BACK_CLOUD_SCALE`: back cloud size on mobile.
// `DESKTOP_MAIN_CLOUD_BOTTOM_HIDE`: how much of the front cloud sits behind the ground on desktop.
// `DESKTOP_BACK_CLOUD_BOTTOM_HIDE`: how much of the back cloud sits behind the ground on desktop.
// `MOBILE_MAIN_CLOUD_BOTTOM_HIDE`: how much of the front cloud sits behind the ground on mobile.
// `MOBILE_BACK_CLOUD_BOTTOM_HIDE`: how much of the back cloud sits behind the ground on mobile.
// `MOBILE_SPEED_MULTIPLIER`: higher = slower cloud movement on mobile.
// `MAIN_CLOUD_TRAVEL_SECONDS`: higher = slower front cloud movement.
// `BACK_CLOUD_TRAVEL_SECONDS`: higher = slower back cloud movement.
// `MAIN_CLOUD_SWING`: extra motion multiplier for the front cloud.
// `BACK_CLOUD_SWING`: extra motion multiplier for the back cloud.
const MOBILE_BREAKPOINT = 720;
const DESKTOP_MAIN_CLOUD_SCALE = 1.5;
const DESKTOP_BACK_CLOUD_SCALE = 1;
const MOBILE_MAIN_CLOUD_SCALE = 2.2;
const MOBILE_BACK_CLOUD_SCALE = 3.1;
const DESKTOP_MAIN_CLOUD_BOTTOM_HIDE = -13;
const DESKTOP_BACK_CLOUD_BOTTOM_HIDE = -10;
const MOBILE_MAIN_CLOUD_BOTTOM_HIDE = -10;
const MOBILE_BACK_CLOUD_BOTTOM_HIDE = -20;
const MOBILE_SPEED_MULTIPLIER = 1.7;
const MAIN_CLOUD_TRAVEL_SECONDS = 200;
const BACK_CLOUD_TRAVEL_SECONDS = 220;
const MAIN_CLOUD_SWING = 1;
const BACK_CLOUD_SWING = 1;

const cloudPhaseStyles = {
  sunrise: {
    mainOpacity: "1",
    backOpacity: "0.8",
    brightness: "1.02",
    saturate: "0.96",
    contrast: "0.95",
    hueRotate: "-6deg"
  },
  morning: {
    mainOpacity: "0.98",
    backOpacity: "0.78",
    brightness: "1.02",
    saturate: "0.94",
    contrast: "0.94",
    hueRotate: "-2deg"
  },
  midday: {
    mainOpacity: "0.98",
    backOpacity: "0.76",
    brightness: "1.04",
    saturate: "0.9",
    contrast: "0.92",
    hueRotate: "0deg"
  },
  sunset: {
    mainOpacity: "0.96",
    backOpacity: "0.8",
    brightness: "1",
    saturate: "0.96",
    contrast: "0.94",
    hueRotate: "-8deg"
  },
  twilight: {
    mainOpacity: "0.82",
    backOpacity: "0.5",
    brightness: "0.9",
    saturate: "0.78",
    contrast: "0.88",
    hueRotate: "10deg"
  },
  night: {
    mainOpacity: "0.66",
    backOpacity: "0.18",
    brightness: "0.72",
    saturate: "0.62",
    contrast: "0.82",
    hueRotate: "16deg"
  }
};

function getResponsiveMetrics() {
  const isCompact = window.innerWidth < MOBILE_BREAKPOINT;

  return isCompact
    ? {
        isCompact: true,
        mainScale: MOBILE_MAIN_CLOUD_SCALE,
        backScale: MOBILE_BACK_CLOUD_SCALE,
        mainBottomHide: MOBILE_MAIN_CLOUD_BOTTOM_HIDE,
        backBottomHide: MOBILE_BACK_CLOUD_BOTTOM_HIDE
      }
    : {
        isCompact: false,
        mainScale: DESKTOP_MAIN_CLOUD_SCALE,
        backScale: DESKTOP_BACK_CLOUD_SCALE,
        mainBottomHide: DESKTOP_MAIN_CLOUD_BOTTOM_HIDE,
        backBottomHide: DESKTOP_BACK_CLOUD_BOTTOM_HIDE
      };
}

function createTrack(className, src) {
  const track = document.createElement("div");
  track.className = className;

  const image = document.createElement("img");
  image.className = "cloud-track__image";
  image.src = src;
  image.alt = "";
  image.draggable = false;

  track.appendChild(image);
  return track;
}

export function createCloudSystem({ element, timeEngine, weatherEngine }) {
  const backTrack = createTrack(
    "cloud-track cloud-track--back",
    "assets/decor/cloudBack.webp"
  );
  const mainTrack = createTrack(
    "cloud-track cloud-track--main",
    "assets/decor/cloudMain.webp"
  );

  element.replaceChildren(backTrack, mainTrack);

  let animationFrameId = 0;
  let startTimestamp = 0;
  let phaseStyle = cloudPhaseStyles.midday;
  let responsiveMetrics = getResponsiveMetrics();
  let weatherSpeedMultiplier = 1;

  function applyPhaseStyle() {
    element.style.setProperty("--cloud-main-opacity", phaseStyle.mainOpacity);
    element.style.setProperty("--cloud-back-opacity", phaseStyle.backOpacity);
    element.style.setProperty("--cloud-brightness", phaseStyle.brightness);
    element.style.setProperty("--cloud-saturate", phaseStyle.saturate);
    element.style.setProperty("--cloud-contrast", phaseStyle.contrast);
    element.style.setProperty("--cloud-hue-rotate", phaseStyle.hueRotate);
    element.style.setProperty(
      "--cloud-main-scale",
      String(responsiveMetrics.mainScale)
    );
    element.style.setProperty(
      "--cloud-back-scale",
      String(responsiveMetrics.backScale)
    );
    element.style.setProperty(
      "--cloud-main-bottom-hide",
      `${responsiveMetrics.mainBottomHide}%`
    );
    element.style.setProperty(
      "--cloud-back-bottom-hide",
      `${responsiveMetrics.backBottomHide}%`
    );
  }

  function applyStartPosition() {
    const mainRange = getTravelRange(mainTrack, responsiveMetrics.mainScale) * MAIN_CLOUD_SWING;
    const backRange = getTravelRange(backTrack, responsiveMetrics.backScale) * BACK_CLOUD_SWING;

    element.style.setProperty("--cloud-main-shift", `${-mainRange}px`);
    element.style.setProperty("--cloud-back-shift", `${-backRange}px`);
  }

  function handleResize() {
    responsiveMetrics = getResponsiveMetrics();
    applyPhaseStyle();
    applyStartPosition();
  }

  function getTravelRange(track, scale) {
    const trackWidth = track.offsetWidth * scale;
    const overflow = Math.max(0, trackWidth - window.innerWidth);

    return overflow / 2;
  }

  function animate(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;

    const elapsedSeconds = (timestamp - startTimestamp) / 1000;
    const speedMultiplier = responsiveMetrics.isCompact
      ? MOBILE_SPEED_MULTIPLIER
      : 1;
    const mainTravelSeconds =
      MAIN_CLOUD_TRAVEL_SECONDS * speedMultiplier * weatherSpeedMultiplier;
    const backTravelSeconds =
      BACK_CLOUD_TRAVEL_SECONDS * speedMultiplier * weatherSpeedMultiplier;
    const mainWave = -Math.cos((elapsedSeconds / mainTravelSeconds) * Math.PI * 2);
    const backWave = -Math.cos((elapsedSeconds / backTravelSeconds) * Math.PI * 2);

    const mainRange = getTravelRange(mainTrack, responsiveMetrics.mainScale);
    const backRange = getTravelRange(backTrack, responsiveMetrics.backScale);

    element.style.setProperty(
      "--cloud-main-shift",
      `${mainWave * mainRange * MAIN_CLOUD_SWING}px`
    );
    element.style.setProperty(
      "--cloud-back-shift",
      `${backWave * backRange * BACK_CLOUD_SWING}px`
    );

    animationFrameId = window.requestAnimationFrame(animate);
  }

  return {
    init() {
      applyPhaseStyle();
      applyStartPosition();

      timeEngine.subscribe(snapshot => {
        phaseStyle = cloudPhaseStyles[snapshot.currentPhase] ?? cloudPhaseStyles.midday;
        applyPhaseStyle();
      });

      weatherEngine?.subscribe(snapshot => {
        weatherSpeedMultiplier =
          snapshot.currentMode === "thunderstorm"
            ? 0.42
            : snapshot.currentMode === "rainfall"
              ? 0.76
              : snapshot.currentMode === "drizzle"
                ? 0.92
                : 1;
      });

      window.addEventListener("resize", handleResize);
      animationFrameId = window.requestAnimationFrame(animate);
    },
    destroy() {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
    }
  };
}
