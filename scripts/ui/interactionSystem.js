export function createInteractionSystem({ cardSystem, timeEngine, weatherEngine }) {
  return {
    init() {
      cardSystem.getPresetButtons().forEach((button, phaseKey) => {
        button.addEventListener("click", () => {
          timeEngine.setPreviewPhase(phaseKey);
        });
      });

      cardSystem.getNowButton().addEventListener("click", () => {
        timeEngine.useLiveTime();
      });

      cardSystem.getWeatherButtons().forEach((button, modeKey) => {
        button.addEventListener("click", () => {
          weatherEngine.setPreviewMode(modeKey);
        });
      });

      cardSystem.getWeatherLiveButton().addEventListener("click", () => {
        weatherEngine.useLiveWeather();
      });
    }
  };
}
