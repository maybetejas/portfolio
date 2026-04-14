const phaseFireflyStyles = {
  sunrise: {
    visibility: "0",
    density: 8,
    glowOpacity: "0"
  },
  morning: {
    visibility: "0",
    density: 0,
    glowOpacity: "0"
  },
  midday: {
    visibility: "0",
    density: 0,
    glowOpacity: "0"
  },
  sunset: {
    visibility: "0",
    density: 10,
    glowOpacity: "0"
  },
  twilight: {
    visibility: "1",
    density: 56,
    glowOpacity: "0.48"
  },
  night: {
    visibility: "1",
    density: 86,
    glowOpacity: "0.72"
  }
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function createFirefly(index) {
  const firefly = document.createElement("span");
  firefly.className = "firefly";
  const clusterSeed = Math.random();
  const baseLeft = clusterSeed < 0.2
    ? randomBetween(6, 20)
    : clusterSeed > 0.8
      ? randomBetween(80, 94)
      : randomBetween(24, 76);
  const baseTop = randomBetween(52, 88);
  firefly.style.setProperty("--firefly-left", formatPercent(baseLeft));
  firefly.style.setProperty("--firefly-top", formatPercent(baseTop));
  firefly.style.setProperty("--firefly-size", `${randomBetween(0.24, 0.58).toFixed(2)}rem`);
  firefly.style.setProperty("--firefly-delay", `${randomBetween(0, 5).toFixed(2)}s`);
  firefly.style.setProperty("--firefly-drift-duration", `${randomBetween(5.5, 10.5).toFixed(2)}s`);
  firefly.style.setProperty("--firefly-pulse-duration", `${randomBetween(1.2, 3.4).toFixed(2)}s`);
  firefly.style.setProperty("--firefly-drift-x1", formatPercent(randomSign() * randomBetween(1.2, 4.5)));
  firefly.style.setProperty("--firefly-drift-y1", formatPercent(-randomBetween(1.5, 4.5)));
  firefly.style.setProperty("--firefly-drift-x2", formatPercent(randomSign() * randomBetween(2, 6.5)));
  firefly.style.setProperty("--firefly-drift-y2", formatPercent(randomBetween(0.6, 3.5)));
  firefly.style.setProperty("--firefly-drift-x3", formatPercent(randomSign() * randomBetween(1, 4)));
  firefly.style.setProperty("--firefly-drift-y3", formatPercent(-randomBetween(1, 3.2)));
  firefly.dataset.index = String(index);
  return firefly;
}

export function createFireflySystem({ element, timeEngine }) {
  let fireflies = [];
  let phase = "morning";
  let scatterTimers = [];

  function applyDensity(density) {
    const targetCount = Math.max(0, Math.round(density));

    while (fireflies.length < targetCount) {
      const firefly = createFirefly(fireflies.length);
      fireflies.push(firefly);
      element.appendChild(firefly);
    }

    while (fireflies.length > targetCount) {
      const firefly = fireflies.pop();
      firefly?.remove();
    }
  }

  function clearScatterTimers() {
    for (const timer of scatterTimers) {
      clearInterval(timer);
    }
    scatterTimers = [];
  }

  function scheduleFireflyMotion(firefly) {
    const move = () => {
      const currentLeft = readPercent(firefly, "--firefly-left");
      const driftX = randomBetween(-6, 6);
      const driftY = randomBetween(-3.5, 2.5);
      const pushedLeft = clampPercent(currentLeft + driftX, 4, 96);
      firefly.style.setProperty("--firefly-left", formatPercent(pushedLeft));
      firefly.style.setProperty("--firefly-top", formatPercent(clampPercent(readPercent(firefly, "--firefly-top") + driftY, 48, 92)));
      firefly.classList.toggle("is-pausing", Math.random() < 0.1);
    };

    move();
    const interval = window.setInterval(() => {
      if (phase !== "twilight" && phase !== "night") return;
      if (Math.random() < 0.12) {
        firefly.classList.add("is-pausing");
        window.setTimeout(() => {
          firefly.classList.remove("is-pausing");
          move();
        }, randomBetween(350, 850));
        return;
      }
      move();
    }, randomBetween(1100, 2200));
    scatterTimers.push(interval);
  }

  function readPercent(elementNode, property) {
    return Number.parseFloat(elementNode.style.getPropertyValue(property)) || 0;
  }

  function clampPercent(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  return {
    init() {
      timeEngine.subscribe(snapshot => {
        phase = snapshot.currentPhase;
        const phaseStyle = phaseFireflyStyles[snapshot.currentPhase];
        element.style.setProperty("--firefly-visibility", phaseStyle.visibility);
        element.style.setProperty("--firefly-density", String(phaseStyle.density));
        element.style.setProperty("--firefly-glow-opacity", phaseStyle.glowOpacity);
        applyDensity(phaseStyle.density);
        if (snapshot.currentPhase === "twilight" || snapshot.currentPhase === "night") {
          if (scatterTimers.length === 0) {
            for (const firefly of fireflies) {
              scheduleFireflyMotion(firefly);
            }
          }
        } else {
          clearScatterTimers();
          for (const firefly of fireflies) {
            firefly.classList.remove("is-pausing");
          }
        }
      });
    }
  };
}
