export function createInteractionSystem({ cardSystem, timeEngine }) {
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
    }
  };
}
