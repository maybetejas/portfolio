const SKY_COVERAGE = 0.72;
const DENSITY_MULTIPLIER = 5;

const phaseStarSettings = {
  sunrise: { starOpacity: 0.08, starDensity: 210 },
  morning: { starOpacity: 0, starDensity: 260 },
  midday: { starOpacity: 0, starDensity: 260 },
  sunset: { starOpacity: 0.04, starDensity: 220 },
  twilight: { starOpacity: 0.22, starDensity: 160 },
  night: { starOpacity: 0.58, starDensity: 112 }
};

const starPalettes = [
  { color: "255,255,255", weight: 0.86 },
  { color: "205,220,255", weight: 0.06 },
  { color: "236,214,255", weight: 0.04 },
  { color: "255,220,235", weight: 0.04 }
];

function chooseWeightedPalette() {
  const roll = Math.random();
  let total = 0;

  for (const entry of starPalettes) {
    total += entry.weight;
    if (roll <= total) return entry.color;
  }

  return starPalettes[0].color;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createCanvas(element) {
  const canvas = document.createElement("canvas");
  canvas.className = "star-layer__canvas";
  canvas.setAttribute("aria-hidden", "true");
  element.appendChild(canvas);
  return canvas;
}

function createStar(width, height) {
  const depthRoll = Math.random();
  const isFront = depthRoll > 0.92;
  const isBack = depthRoll < 0.34;
  const size = isFront
    ? randomBetween(1.9, 3.1)
    : isBack
      ? randomBetween(0.55, 1.2)
      : randomBetween(1.05, 1.95);

  return {
    x: Math.random() * width,
    y: Math.random() * height * SKY_COVERAGE,
    size,
    depth: isFront ? 1 : isBack ? 0 : 0.5,
    baseAlpha: isFront
      ? randomBetween(0.52, 0.88)
      : isBack
        ? randomBetween(0.14, 0.34)
        : randomBetween(0.24, 0.6),
    glow: isFront
      ? randomBetween(6, 11)
      : isBack
        ? randomBetween(1.5, 4)
        : randomBetween(3, 7),

        //chnage for more blinks
    isShimmering: Math.random() < 0.5,
    twinkleAmplitude: 0,
    twinkleSpeed: 0,
    twinkleOffset: Math.random() * Math.PI * 2,
    shimmerBoost: 1,
    blinkThreshold: 0.82,
    blinkStrength: 1,
    color: chooseWeightedPalette()
  };
}

function drawPlusStar(context, star, elapsed, globalOpacity) {
  const wave = Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset);
  const blink =
    star.isShimmering && wave > star.blinkThreshold ? star.blinkStrength : 1;
  const twinkle = star.isShimmering
    ? (1 + wave * star.twinkleAmplitude) * blink
    : 1;
  const alpha = clamp(
    star.baseAlpha * twinkle * star.shimmerBoost * globalOpacity,
    0,
    1
  );

  if (alpha <= 0.001) return;

  const arm = star.size * (star.depth === 1 ? 2.8 : star.depth === 0 ? 1.6 : 2.15);
  const lineWidth = star.depth === 1 ? 1.2 : star.depth === 0 ? 0.7 : 0.95;
  const [red, green, blue] = star.color.split(",");

  context.save();
  context.translate(star.x, star.y);
  context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.9})`;
  context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.58})`;
  context.shadowBlur = star.glow;
  context.lineWidth = lineWidth;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(-arm, 0);
  context.lineTo(arm, 0);
  context.moveTo(0, -arm);
  context.lineTo(0, arm);
  context.stroke();

  context.beginPath();
  context.arc(0, 0, Math.max(0.5, star.size * 0.32), 0, Math.PI * 2);
  context.fill();

  if (star.isShimmering) {
    context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.2})`;
    context.beginPath();
    context.arc(0, 0, star.size * 1.4, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function finalizeStarMotion(star) {
  if (!star.isShimmering) {
    return star;
  }

  star.twinkleAmplitude =
    star.depth === 1
      ? randomBetween(0.2, 0.34)
      : star.depth === 0
        ? randomBetween(0.08, 0.14)
        : randomBetween(0.12, 0.2);
  star.twinkleSpeed = randomBetween(1.8, 3.8);
  star.glow += star.depth === 1 ? 5 : 2.5;
  star.shimmerBoost = star.depth === 1 ? 1.45 : 1.25;
  star.blinkThreshold = randomBetween(0.72, 0.9);
  star.blinkStrength =
    star.depth === 1
      ? randomBetween(1.45, 1.9)
      : randomBetween(1.25, 1.6);
  return star;
}

export function createStarSystem({ element, timeEngine, weatherEngine }) {
  const canvas = createCanvas(element);
  const context = canvas.getContext("2d");
  const stars = [];
  let width = 0;
  let height = 0;
  let currentSettings = phaseStarSettings.morning;
  let weatherVisibility = 1;
  let animationFrameId = 0;
  let resizeTimer = 0;

  function getTargetCount(starDensity) {
    const area = width * height * SKY_COVERAGE;
    return Math.round((area / (starDensity * starDensity)) * DENSITY_MULTIPLIER);
  }

  function getMaxStarCount() {
    const densities = Object.values(phaseStarSettings).map(
      settings => settings.starDensity
    );
    return getTargetCount(Math.min(...densities));
  }

  function resizeCanvas() {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(nextWidth * pixelRatio);
    canvas.height = Math.round(nextHeight * pixelRatio);
    canvas.style.width = `${nextWidth}px`;
    canvas.style.height = `${nextHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function regenerateStars() {
    stars.length = 0;
    const count = getMaxStarCount();

    for (let index = 0; index < count; index += 1) {
      stars.push(finalizeStarMotion(createStar(width, height)));
    }
  }

  function renderFrame(timestamp) {
    const elapsed = timestamp * 0.001;
    context.clearRect(0, 0, width, height);

    const visibleOpacity = currentSettings.starOpacity * weatherVisibility;

    if (visibleOpacity > 0) {
      const visibleCount = Math.min(
        stars.length,
        getTargetCount(currentSettings.starDensity)
      );

      for (let index = 0; index < visibleCount; index += 1) {
        drawPlusStar(context, stars[index], elapsed, visibleOpacity);
      }
    }

    animationFrameId = window.requestAnimationFrame(renderFrame);
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      regenerateStars();
    }, 80);
  }

  return {
    init() {
      resizeCanvas();
      regenerateStars();

      timeEngine.subscribe(snapshot => {
        currentSettings =
          phaseStarSettings[snapshot.currentPhase] ?? phaseStarSettings.morning;
        element.style.setProperty("--star-opacity", String(currentSettings.starOpacity));
      });

      weatherEngine?.subscribe(snapshot => {
        weatherVisibility = snapshot.currentMode === "clear" ? 1 : 0;
      });

      window.addEventListener("resize", handleResize);
      animationFrameId = window.requestAnimationFrame(renderFrame);
    },
    destroy() {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    }
  };
}
