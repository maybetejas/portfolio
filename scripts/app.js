import { createTimeEngine } from "./core/timeEngine.js";
import { createCloudSystem } from "./systems/cloudSystem.js";
import { createGroundSystem } from "./systems/groundSystem.js";
import { createIslandSystem } from "./systems/islandSystem.js";
import { createBirdSystem } from "./systems/birdSystem.js";
import { createBunnySystem } from "./systems/bunnySystem.js";
import { createShootingStarSystem } from "./systems/shootingStarSystem.js";
import { createSkySystem } from "./systems/skySystem.js";
import { createStarSystem } from "./systems/starSystem.js";
import { createSunSystem } from "./systems/sunSystem.js";
import { createCardSystem } from "./ui/cardSystem.js";
import { createInteractionSystem } from "./ui/interactionSystem.js";
import { createLayoutSystem } from "./ui/layoutSystem.js";

export function bootstrapApp() {
  const timeEngine = createTimeEngine();

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
      timeEngine
    }),
    createSunSystem({
      element: document.getElementById("sunLayer"),
      timeEngine
    }),
    createStarSystem({
      element: document.getElementById("starLayer"),
      timeEngine
    }),
    createShootingStarSystem({
      element: document.getElementById("shootingStarLayer"),
      timeEngine
    }),
    createBirdSystem({
      element: document.getElementById("birdLayer"),
      timeEngine
    }),
    createBunnySystem({
      element: document.getElementById("bunnyLayer"),
      timeEngine
    }),
    createGroundSystem({
      element: document.getElementById("groundLayer"),
      timeEngine
    })
  ];

  const cardSystem = createCardSystem({
    root: document.getElementById("timeControls"),
    timeEngine
  });

  const interactionSystem = createInteractionSystem({
    cardSystem,
    timeEngine
  });

  const layoutSystem = createLayoutSystem({
    root: document.body
  });

  systems.forEach(system => system.init());
  cardSystem.init();
  interactionSystem.init();
  layoutSystem.init();
  timeEngine.start();

  window.app = {
    timeEngine,
    systems,
    ui: {
      cardSystem,
      interactionSystem,
      layoutSystem
    }
  };
}
