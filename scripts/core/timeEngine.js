import {
  getPhaseByHour,
  getPhaseStartHour,
  normalizeHour,
  phaseDefinitions
} from "./timeConfig.js";

function getCurrentHourFromClock() {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function toDisplayLabel(hour) {
  const totalMinutes = Math.round((((hour % 24) + 24) % 24) * 60);
  const displayHours = Math.floor(totalMinutes / 60) % 24;
  const displayMinutes = totalMinutes % 60;
  const suffix = displayHours >= 12 ? "PM" : "AM";
  const hour12 = displayHours % 12 || 12;
  return `${hour12}:${String(displayMinutes).padStart(2, "0")} ${suffix}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue]
    .map(channel => {
      const segment = Math.round(channel).toString(16);
      return segment.length === 1 ? `0${segment}` : segment;
    })
    .join("")}`;
}

function blendHexColors(colorA, colorB, t) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex(a.map((channel, index) => lerp(channel, b[index], t)));
}

function getPhaseInterpolation(hour) {
  const normalizedHour = normalizeHour(hour);
  let phaseIndex = phaseDefinitions.length - 1;

  for (let index = 0; index < phaseDefinitions.length; index += 1) {
    if (normalizedHour < phaseDefinitions[index].endHour) {
      phaseIndex = index;
      break;
    }
  }

  const phase = phaseDefinitions[phaseIndex];
  const nextPhase = phaseDefinitions[(phaseIndex + 1) % phaseDefinitions.length];
  const nextStartHour =
    nextPhase.startHour <= phase.startHour
      ? nextPhase.startHour + 24
      : nextPhase.startHour;
  const duration = nextStartHour - phase.startHour;
  const progress = duration === 0 ? 0 : (normalizedHour - phase.startHour) / duration;

  return {
    phase,
    nextPhase,
    progress: Math.min(1, Math.max(0, progress))
  };
}

function createSnapshot(state) {
  const currentPhase = getPhaseByHour(state.currentHour);

  return {
    currentHour: state.currentHour,
    normalizedHour: normalizeHour(state.currentHour),
    currentPhase: currentPhase.key,
    phaseLabel: currentPhase.label,
    displayTime: toDisplayLabel(state.currentHour),
    isLive: state.isLive
  };
}

export function createTimeEngine() {
  const subscribers = new Set();
  const state = {
    currentHour: getCurrentHourFromClock(),
    isLive: true
  };
  let intervalId = null;

  function notify() {
    const snapshot = createSnapshot(state);
    subscribers.forEach(subscriber => subscriber(snapshot));
  }

  function setHour(hour, { isLive } = {}) {
    state.currentHour = ((hour % 24) + 24) % 24;
    if (typeof isLive === "boolean") {
      state.isLive = isLive;
    }
    notify();
  }

  function syncToClock() {
    if (!state.isLive) return;
    setHour(getCurrentHourFromClock(), { isLive: true });
  }

  return {
    get currentHour() {
      return state.currentHour;
    },
    get currentPhase() {
      return getPhaseByHour(state.currentHour).key;
    },
    getSnapshot() {
      return createSnapshot(state);
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      subscriber(createSnapshot(state));
      return () => subscribers.delete(subscriber);
    },
    start() {
      syncToClock();
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(syncToClock, 60000);
    },
    useLiveTime() {
      setHour(getCurrentHourFromClock(), { isLive: true });
    },
    setPreviewHour(hour) {
      setHour(hour, { isLive: false });
    },
    setPreviewPhase(phaseKey) {
      setHour(getPhaseStartHour(phaseKey), { isLive: false });
    },
    getInterpolatedColors() {
      const { phase, nextPhase, progress } = getPhaseInterpolation(state.currentHour);
      return phase.colors.map((color, index) =>
        blendHexColors(color, nextPhase.colors[index], progress)
      );
    }
  };
}
