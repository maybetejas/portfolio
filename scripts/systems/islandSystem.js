// Island tuning variables
// `ISLAND_MIN_TOP` / `ISLAND_MAX_TOP`: vertical band for both islands.
// `MAIN_ISLAND_*`: main island placement and scale.
// `SECONDARY_ISLAND_*`: secondary island placement and scale.
const ISLAND_MIN_TOP = 26;
const ISLAND_MAX_TOP = 48;
const SUN_SAFE_LEFT_ZONE = 18;
const MAIN_ISLAND_MIN_LEFT = 24;
const MAIN_ISLAND_MAX_LEFT = 38;
const MAIN_ISLAND_SCALE_RANGE = [0.5, 0.7];
const SECONDARY_ISLAND_MIN_LEFT = 56;
const SECONDARY_ISLAND_MAX_LEFT = 82;
const SECONDARY_ISLAND_SCALE_RANGE = [0.4, 0.62];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createIsland(className, src) {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = "";
  image.draggable = false;
  return image;
}

export function createIslandSystem({ element, timeEngine }) {
  const mainIsland = createIsland(
    "island-layer__island island-layer__island--main",
    "assets/decor/mainIsland.png"
  );
  const secondaryIsland = createIsland(
    "island-layer__island island-layer__island--secondary",
    "assets/decor/secondaryIsland.webp"
  );

  element.replaceChildren(mainIsland, secondaryIsland);

  const layout = {
    mainLeft: randomBetween(
      Math.max(MAIN_ISLAND_MIN_LEFT, SUN_SAFE_LEFT_ZONE),
      MAIN_ISLAND_MAX_LEFT
    ),
    mainTop: randomBetween(ISLAND_MIN_TOP, ISLAND_MAX_TOP - 4),
    mainScale: randomBetween(
      MAIN_ISLAND_SCALE_RANGE[0],
      MAIN_ISLAND_SCALE_RANGE[1]
    ),
    secondaryLeft: randomBetween(
      SECONDARY_ISLAND_MIN_LEFT,
      SECONDARY_ISLAND_MAX_LEFT
    ),
    secondaryTop: randomBetween(ISLAND_MIN_TOP + 2, ISLAND_MAX_TOP),
    secondaryScale: randomBetween(
      SECONDARY_ISLAND_SCALE_RANGE[0],
      SECONDARY_ISLAND_SCALE_RANGE[1]
    )
  };

  function applyLayout() {
    mainIsland.style.left = `${layout.mainLeft}%`;
    mainIsland.style.top = `${layout.mainTop}%`;
    mainIsland.style.transform = `translate(-50%, -50%) scale(${layout.mainScale})`;

    secondaryIsland.style.left = `${layout.secondaryLeft}%`;
    secondaryIsland.style.top = `${layout.secondaryTop}%`;
    secondaryIsland.style.transform =
      `translate(-50%, -50%) scale(${layout.secondaryScale})`;
  }

  return {
    init() {
      applyLayout();
      timeEngine.subscribe(() => {});
    }
  };
}
