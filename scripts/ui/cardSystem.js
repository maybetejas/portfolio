import { phasePreviewHours } from "../core/timeConfig.js";

export function createCardSystem({
  root,
  timeEngine
}) {
  const presetButtons = new Map();
  const readout = root.querySelector("#timeReadout");
  const nowButton = root.querySelector("#timeNowButton");

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

  return {
    init() {
      renderPresetButtons();
      timeEngine.subscribe(render);
    },
    getRoot() {
      return root;
    },
    getNowButton() {
      return nowButton;
    },
    getPresetButtons() {
      return presetButtons;
    }
  };
}
