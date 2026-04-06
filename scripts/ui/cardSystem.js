import { weatherPreviewModes } from "../core/weatherEngine.js";
import { phasePreviewHours } from "../core/timeConfig.js";

export function createCardSystem({
  root,
  timeEngine,
  weatherEngine
}) {
  const presetButtons = new Map();
  const weatherButtons = new Map();
  const readout = root.querySelector("#timeReadout");
  const nowButton = root.querySelector("#timeNowButton");
  const weatherReadout = root.querySelector("#weatherReadout");
  const weatherLiveButton = root.querySelector("#weatherLiveButton");

  function renderPresetButtons() {
    const presetsContainer = root.querySelector("#timePresets");
    presetsContainer.innerHTML = "";

    phasePreviewHours.forEach(preset => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "time-preset-chip";
      button.dataset.phase = preset.key;
      button.innerHTML = `
        <span class="time-preset-chip__title">${preset.label}</span>
        <span class="time-preset-chip__time">${preset.rangeLabel}</span>
      `;
      presetsContainer.appendChild(button);
      presetButtons.set(preset.key, button);
    });
  }

  function renderWeatherButtons() {
    const presetsContainer = root.querySelector("#weatherPresets");
    presetsContainer.innerHTML = "";

    weatherPreviewModes.forEach(preset => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "weather-preset-chip";
      button.dataset.weatherMode = preset.key;
      button.innerHTML = `
        <span class="weather-preset-chip__title">${preset.label}</span>
        <span class="weather-preset-chip__meta">${preset.description}</span>
      `;
      presetsContainer.appendChild(button);
      weatherButtons.set(preset.key, button);
    });
  }

  function render(snapshot) {
    readout.textContent = `${snapshot.displayTime} | ${snapshot.phaseLabel}`;
    nowButton.disabled = snapshot.isLive;

    presetButtons.forEach((button, phaseKey) => {
      button.classList.toggle(
        "is-active",
        !snapshot.isLive && phaseKey === snapshot.currentPhase
      );
    });
  }

  function renderWeather(snapshot) {
    weatherReadout.textContent = snapshot.label;
    weatherLiveButton.disabled = snapshot.isLive;

    weatherButtons.forEach((button, modeKey) => {
      button.classList.toggle(
        "is-active",
        !snapshot.isLive && modeKey === snapshot.currentMode
      );
    });
  }

  return {
    init() {
      renderPresetButtons();
      renderWeatherButtons();
      timeEngine.subscribe(render);
      weatherEngine.subscribe(renderWeather);
    },
    getRoot() {
      return root;
    },
    getNowButton() {
      return nowButton;
    },
    getPresetButtons() {
      return presetButtons;
    },
    getWeatherButtons() {
      return weatherButtons;
    },
    getWeatherLiveButton() {
      return weatherLiveButton;
    }
  };
}
