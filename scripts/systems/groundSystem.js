const groundPhaseStyles = {
  sunrise: {
    tint: "rgba(255, 179, 132, 0.18)",
    brightness: "1.5",
    saturate: "0.95",
    contrast: "0.95",
    hueRotate: "-6deg",
    forestBackBrightness: "0.92",
    forestBackSaturate: "0.92",
    forestBackHueRotate: "-6deg",
    forestFrontBrightness: "0.9",
    forestFrontSaturate: "0.92",
    forestFrontHueRotate: "-4deg",
    forestFrontBlackout: "0"
  },
  morning: {
    tint: "rgba(255, 244, 220, 0.06)",
    brightness: "1.3",
    saturate: "1.02",
    contrast: "0.98",
    hueRotate: "-2deg",
    forestBackBrightness: "0.97",
    forestBackSaturate: "0.96",
    forestBackHueRotate: "-2deg",
    forestFrontBrightness: "0.82",
    forestFrontSaturate: "0.95",
    forestFrontHueRotate: "-1deg",
    forestFrontBlackout: "0"
  },
  midday: {
    tint: "rgba(255, 255, 255, 0.02)",
    brightness: "1.2",
    saturate: "1.08",
    contrast: "1",
    hueRotate: "0deg",
    forestBackBrightness: "1",
    forestBackSaturate: "1",
    forestBackHueRotate: "0deg",
    forestFrontBrightness: "0.72",
    forestFrontSaturate: "0.97",
    forestFrontHueRotate: "0deg",
    forestFrontBlackout: "0"
  },
  sunset: {
    tint: "rgba(255, 150, 110, 0.2)",
    brightness: "1",
    saturate: "1.06",
    contrast: "1.01",
    hueRotate: "-8deg",
    forestBackBrightness: "0.82",
    forestBackSaturate: "0.9",
    forestBackHueRotate: "-10deg",
    forestFrontBrightness: "0.62",
    forestFrontSaturate: "0.88",
    forestFrontHueRotate: "-8deg",
    forestFrontBlackout: "0"
  },
  twilight: {
    tint: "rgba(95, 112, 184, 0.22)",
    brightness: "0.82",
    saturate: "0.82",
    contrast: "1.02",
    hueRotate: "10deg",
    forestBackBrightness: "0.58",
    forestBackSaturate: "0.7",
    forestBackHueRotate: "16deg",
    forestFrontBrightness: "0.5",
    forestFrontSaturate: "0.76",
    forestFrontHueRotate: "14deg",
    forestFrontBlackout: "0"
  },
  night: {
    tint: "rgba(20, 39, 88, 0.47)",
    brightness: "0.58",
    saturate: "0.55",
    contrast: "0.96",
    hueRotate: "18deg",
    forestBackBrightness: "0.3",
    forestBackSaturate: "0.52",
    forestBackHueRotate: "22deg",
    forestFrontBrightness: "0.4",
    forestFrontSaturate: "0.36",
    forestFrontHueRotate: "24deg",
    forestFrontBlackout: "0"
  }
};

export function createGroundSystem({ element, timeEngine }) {
  return {
    init() {
      timeEngine.subscribe(snapshot => {
        const phaseStyle = groundPhaseStyles[snapshot.currentPhase];
        const rootStyle = document.documentElement.style;
        element.style.opacity = "1";
        rootStyle.setProperty("--ground-tint", phaseStyle.tint);
        rootStyle.setProperty("--ground-brightness", phaseStyle.brightness);
        rootStyle.setProperty("--ground-saturate", phaseStyle.saturate);
        rootStyle.setProperty("--ground-contrast", phaseStyle.contrast);
        rootStyle.setProperty("--ground-hue-rotate", phaseStyle.hueRotate);
        rootStyle.setProperty("--forest-back-brightness", phaseStyle.forestBackBrightness);
        rootStyle.setProperty("--forest-back-saturate", phaseStyle.forestBackSaturate);
        rootStyle.setProperty("--forest-back-hue-rotate", phaseStyle.forestBackHueRotate);
        rootStyle.setProperty("--forest-front-brightness", phaseStyle.forestFrontBrightness);
        rootStyle.setProperty("--forest-front-saturate", phaseStyle.forestFrontSaturate);
        rootStyle.setProperty("--forest-front-hue-rotate", phaseStyle.forestFrontHueRotate);
        rootStyle.setProperty("--forest-front-blackout", phaseStyle.forestFrontBlackout);
      });
    }
  };
}
