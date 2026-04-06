// Shooting star tuning variables
// `SHOOTING_STAR_DELAY_RANGE_MS`: wait between night-time bursts.
// `SHOOTING_STAR_DURATION_RANGE_MS`: streak animation duration.
const SHOOTING_STAR_DELAY_RANGE_MS = [18000, 34000];
const SHOOTING_STAR_DURATION_RANGE_MS = [900, 1500];
const SHOOTING_STAR_TOP_RANGE = [8, 42];
const SHOOTING_STAR_LEFT_RANGE = [10, 88];

const activePhases = new Set(["twilight", "night"]);

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function createStreak() {
  const streak = document.createElement("div");
  streak.className = "shooting-star";
  streak.style.left = `${randomBetween(
    SHOOTING_STAR_LEFT_RANGE[0],
    SHOOTING_STAR_LEFT_RANGE[1]
  )}%`;
  streak.style.top = `${randomBetween(
    SHOOTING_STAR_TOP_RANGE[0],
    SHOOTING_STAR_TOP_RANGE[1]
  )}%`;
  streak.style.setProperty(
    "--shooting-star-duration",
    `${randomBetween(
      SHOOTING_STAR_DURATION_RANGE_MS[0],
      SHOOTING_STAR_DURATION_RANGE_MS[1]
    )}ms`
  );
  streak.style.setProperty(
    "--shooting-star-size",
    `${randomBetween(80, 160)}px`
  );
  streak.addEventListener("animationend", () => streak.remove(), { once: true });
  return streak;
}

export function createShootingStarSystem({ element, timeEngine, weatherEngine }) {
  let currentPhase = timeEngine.currentPhase;
  let currentWeatherMode = "clear";
  let timeoutId = 0;

  function scheduleNext() {
    window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      if (activePhases.has(currentPhase) && currentWeatherMode === "clear") {
        const burstCount = Math.random() < 0.28 ? randomInt(2, 3) : 1;
        for (let index = 0; index < burstCount; index += 1) {
          const streak = createStreak();
          streak.style.animationDelay = `${index * randomBetween(140, 260)}ms`;
          element.appendChild(streak);
        }
      }

      scheduleNext();
    }, randomBetween(SHOOTING_STAR_DELAY_RANGE_MS[0], SHOOTING_STAR_DELAY_RANGE_MS[1]));
  }

  return {
    init() {
      timeEngine.subscribe(snapshot => {
        currentPhase = snapshot.currentPhase;
      });

      weatherEngine?.subscribe(snapshot => {
        currentWeatherMode = snapshot.currentMode;
        if (currentWeatherMode !== "clear") {
          element.replaceChildren();
        }
      });

      scheduleNext();
    },
    destroy() {
      window.clearTimeout(timeoutId);
    }
  };
}
