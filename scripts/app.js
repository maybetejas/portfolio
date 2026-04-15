import { createTimeEngine } from "./core/timeEngine.js";
import { createWeatherEngine } from "./core/weatherEngine.js";
import { createCloudSystem } from "./systems/cloudSystem.js";
import { createGroundSystem } from "./systems/groundSystem.js";
import { createIslandSystem } from "./systems/islandSystem.js";
import { createBirdSystem } from "./systems/birdSystem.js";
import { createFireflySystem } from "./systems/fireflySystem.js";
import { createBunnySystem } from "./systems/bunnySystem.js";
import { createShootingStarSystem } from "./systems/shootingStarSystem.js";
import { createSkySystem } from "./systems/skySystem.js";
import { createSkyBeastSystem } from "./systems/skyBeastSystem.js";
import { createStarSystem } from "./systems/starSystem.js";
import { createSunSystem } from "./systems/sunSystem.js";
import { createWeatherSystem } from "./systems/weatherSystem.js";
import { createLayoutSystem } from "./ui/layoutSystem.js";
import { createBoardSystem } from "./ui/boardSystem.js";

export function bootstrapApp() {
  const timeEngine = createTimeEngine();
  const weatherEngine = createWeatherEngine();

  const systems = [
    createSkySystem({
      element: document.getElementById("skyLayer"),
      timeEngine
    }),
    createIslandSystem({
      element: document.getElementById("islandLayer"),
      timeEngine
    }),
    createCloudSystem({
      element: document.getElementById("cloudLayer"),
      timeEngine,
      weatherEngine
    }),
    createSunSystem({
      element: document.getElementById("sunLayer"),
      timeEngine
    }),
    createStarSystem({
      element: document.getElementById("starLayer"),
      timeEngine,
      weatherEngine
    }),
    createShootingStarSystem({
      element: document.getElementById("shootingStarLayer"),
      timeEngine,
      weatherEngine
    }),
    createBirdSystem({
      element: document.getElementById("birdLayer"),
      timeEngine,
      weatherEngine
    }),
    createSkyBeastSystem({
      element: document.getElementById("skyBeastLayer"),
      timeEngine,
      weatherEngine
    }),
    createFireflySystem({
      element: document.getElementById("fireflyLayer"),
      timeEngine
    }),
    createWeatherSystem({
      rainbowElement: document.getElementById("rainbowLayer"),
      toneElement: document.getElementById("weatherToneLayer"),
      rainElement: document.getElementById("rainLayer"),
      dropletElement: document.getElementById("screenDropletLayer"),
      lightningElement: document.getElementById("lightningLayer"),
      timeEngine,
      weatherEngine
    }),
    createBunnySystem({
      element: document.getElementById("bunnyLayer"),
      timeEngine,
      weatherEngine
    }),
    createGroundSystem({
      element: document.getElementById("groundLayer"),
      timeEngine
    })
  ];

  // ✅ FIXED LAYOUT SYSTEM (NOW HAS ACCESS TO BOARD)
  const layoutSystem = createLayoutSystem({
    root: document.body,
    boardContent: document.getElementById("board-content"),
    boardTitle: document.getElementById("boardTitle")
  });

  const boardSystem = createBoardSystem({
    menuElement: document.querySelector(".menu-screen"),
    openButton: document.querySelector("[data-action='open-portfolio']"),
    boardElement: document.getElementById("portfolioScreen"),

    onOpen: () => {
      layoutSystem.navigate("home");
    }
  });

  systems.forEach(system => system.init());
  boardSystem.init();
  layoutSystem.init();

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-page]");
  if (!card) return;

  const page = card.dataset.page;

  console.log("CLICKED:", page); // 👈 debug

  layoutSystem.navigate(page);
});

document.addEventListener("click", (e) => {

  // 🔥 PRIORITY 1: MENU BACK
  if (e.target.closest("[data-action='go-menu']")) {
    document.querySelector(".menu-screen").classList.remove("is-hidden");
    document.getElementById("portfolioScreen").classList.remove("is-visible", "is-open");
    document.documentElement.classList.remove("is-portfolio-open");
    return;
  }

  // 🔥 PRIORITY 2: BACK TO HOME
  if (e.target.closest("[data-action='go-home']")) {
    layoutSystem.navigate("home");
    return;
  }

  // 🔥 PRIORITY 3: PAGE NAVIGATION
  const pageEl = e.target.closest("[data-page]");
  if (!pageEl) return;

  const page = pageEl.dataset.page;
  layoutSystem.navigate(page);
});

  // 🔥 THIS WAS THE MISSING PIECE
  document
    .querySelector("[data-action='open-portfolio']")
    .addEventListener("click", () => {
      layoutSystem.navigate("home");
    });

  timeEngine.start();
  weatherEngine.start();

  window.app = {
    timeEngine,
    weatherEngine,
    systems,
    ui: {
      boardSystem,
      layoutSystem
    }
  };
}