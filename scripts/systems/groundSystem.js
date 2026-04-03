const groundPhaseStyles = {
  sunrise: {
    tint: "rgba(255, 179, 132, 0.18)",
    brightness: "1.02",
    saturate: "0.95",
    contrast: "0.95",
    hueRotate: "-6deg"
  },
  morning: {
    tint: "rgba(255, 244, 220, 0.06)",
    brightness: "1.04",
    saturate: "1.02",
    contrast: "0.98",
    hueRotate: "-2deg"
  },
  midday: {
    tint: "rgba(255, 255, 255, 0.02)",
    brightness: "1.08",
    saturate: "1.08",
    contrast: "1",
    hueRotate: "0deg"
  },
  sunset: {
    tint: "rgba(255, 150, 110, 0.2)",
    brightness: "0.98",
    saturate: "1.06",
    contrast: "1.01",
    hueRotate: "-8deg"
  },
  twilight: {
    tint: "rgba(95, 112, 184, 0.22)",
    brightness: "0.82",
    saturate: "0.82",
    contrast: "1.02",
    hueRotate: "10deg"
  },
  night: {
    tint: "rgba(20, 39, 88, 0.34)",
    brightness: "0.58",
    saturate: "0.55",
    contrast: "0.96",
    hueRotate: "18deg"
  }
};

export function createGroundSystem({ element, timeEngine }) {
  return {
    init() {
      timeEngine.subscribe(snapshot => {
        const phaseStyle = groundPhaseStyles[snapshot.currentPhase];
        element.style.opacity = "1";
        element.style.setProperty("--ground-tint", phaseStyle.tint);
        element.style.setProperty("--ground-brightness", phaseStyle.brightness);
        element.style.setProperty("--ground-saturate", phaseStyle.saturate);
        element.style.setProperty("--ground-contrast", phaseStyle.contrast);
        element.style.setProperty("--ground-hue-rotate", phaseStyle.hueRotate);
      });
    }
  };
}
