import { createTimeEngine } from "./core/timeEngine.js";
import { createWeatherEngine } from "./core/weatherEngine.js";
import { createCloudSystem } from "./systems/cloudSystem.js";
import { createGroundSystem } from "./systems/groundSystem.js";
import { createIslandSystem } from "./systems/islandSystem.js";
import { createBirdSystem } from "./systems/birdSystem.js";
import { createBunnySystem } from "./systems/bunnySystem.js";
import { createShootingStarSystem } from "./systems/shootingStarSystem.js";
import { createSkySystem } from "./systems/skySystem.js";
import { createStarSystem } from "./systems/starSystem.js";
import { createSunSystem } from "./systems/sunSystem.js";
import { createWeatherSystem } from "./systems/weatherSystem.js";
import { createCardSystem } from "./ui/cardSystem.js";
import { createInteractionSystem } from "./ui/interactionSystem.js";
import { createLayoutSystem } from "./ui/layoutSystem.js";

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

  const cardSystem = createCardSystem({
    root: document.getElementById("timeControls"),
    timeEngine,
    weatherEngine
  });

  const interactionSystem = createInteractionSystem({
    cardSystem,
    timeEngine,
    weatherEngine
  });

  const layoutSystem = createLayoutSystem({
    root: document.body
  });

  systems.forEach(system => system.init());
  cardSystem.init();
  interactionSystem.init();
  layoutSystem.init();
  timeEngine.start();
  weatherEngine.start();

  window.app = {
    timeEngine,
    weatherEngine,
    systems,
    ui: {
      cardSystem,
      interactionSystem,
      layoutSystem
    }
  };
}
