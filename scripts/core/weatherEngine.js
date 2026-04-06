const LIVE_REFRESH_MS = 15 * 60 * 1000;
const GEOLOCATION_TIMEOUT_MS = 7000;
const FALLBACK_COORDINATES = {
  latitude: 28.6139,
  longitude: 77.209,
  label: "Fallback"
};
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export const weatherPreviewModes = [
  {
    key: "drizzle",
    label: "Drizzle",
    description: "Drizzle + rainbow"
  },
  {
    key: "rainfall",
    label: "Rainfall",
    description: "Mild steady rain"
  },
  {
    key: "thunderstorm",
    label: "Storm",
    description: "Thunder + fast clouds"
  }
];

const drizzleCodes = new Set([51, 53, 55, 56, 57]);
const rainfallCodes = new Set([61, 63, 65, 66, 67, 80, 81]);
const thunderCodes = new Set([82, 95, 96, 99]);

function mapWeatherMode(current = {}) {
  const weatherCode = Number(current.weather_code);
  const precipitation = Number(current.precipitation ?? 0);

  if (thunderCodes.has(weatherCode)) {
    return "thunderstorm";
  }

  if (drizzleCodes.has(weatherCode)) {
    return "drizzle";
  }

  if (rainfallCodes.has(weatherCode) || precipitation >= 0.35) {
    return "rainfall";
  }

  return "clear";
}

function createSnapshot(state) {
  return {
    currentMode: state.currentMode,
    isLive: state.isLive,
    label: state.isLive
      ? state.currentMode === "clear"
        ? "Live | Clear"
        : `Live | ${state.currentMode}`
      : `Preview | ${state.currentMode}`,
    weatherCode: state.weatherCode,
    precipitation: state.precipitation,
    isDay: state.isDay,
    locationLabel: state.locationLabel
  };
}

function getCurrentPosition() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve(FALLBACK_COORDINATES);
  }

  return new Promise(resolve => {
    let settled = false;

    const finish = value => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timeoutId = window.setTimeout(() => {
      finish(FALLBACK_COORDINATES);
    }, GEOLOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      position => {
        window.clearTimeout(timeoutId);
        finish({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location"
        });
      },
      () => {
        window.clearTimeout(timeoutId);
        finish(FALLBACK_COORDINATES);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 30 * 60 * 1000,
        timeout: GEOLOCATION_TIMEOUT_MS
      }
    );
  });
}

async function fetchCurrentWeather(location) {
  const url = new URL(WEATHER_API_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("current", "precipitation,weather_code,is_day");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.current ?? {};
}

export function createWeatherEngine() {
  const subscribers = new Set();
  const state = {
    currentMode: "clear",
    isLive: true,
    weatherCode: 0,
    precipitation: 0,
    isDay: true,
    locationLabel: "Fetching"
  };

  let refreshTimerId = 0;
  let currentLocation = null;

  function notify() {
    const snapshot = createSnapshot(state);
    subscribers.forEach(subscriber => subscriber(snapshot));
  }

  async function refreshLiveWeather() {
    try {
      currentLocation ??= await getCurrentPosition();
      const current = await fetchCurrentWeather(currentLocation);

      if (!state.isLive) return;

      state.weatherCode = Number(current.weather_code ?? 0);
      state.precipitation = Number(current.precipitation ?? 0);
      state.isDay = Boolean(current.is_day ?? 1);
      state.locationLabel = currentLocation.label;
      state.currentMode = mapWeatherMode(current);
      notify();
    } catch {
      if (!state.isLive) return;
      state.currentMode = "clear";
      state.locationLabel = "Unavailable";
      notify();
    }
  }

  return {
    getSnapshot() {
      return createSnapshot(state);
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      subscriber(createSnapshot(state));
      return () => subscribers.delete(subscriber);
    },
    start() {
      refreshLiveWeather();
      if (refreshTimerId) {
        window.clearInterval(refreshTimerId);
      }
      refreshTimerId = window.setInterval(refreshLiveWeather, LIVE_REFRESH_MS);
    },
    useLiveWeather() {
      state.isLive = true;
      notify();
      refreshLiveWeather();
    },
    setPreviewMode(mode) {
      state.currentMode = mode;
      state.isLive = false;
      notify();
    },
    destroy() {
      window.clearInterval(refreshTimerId);
    }
  };
}
