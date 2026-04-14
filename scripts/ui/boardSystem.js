const VIEW_NAMES = ["home", "projects", "skills", "career", "resume", "blogs", "services"];

export function createBoardSystem({ menuElement, boardElement, openButton, onOpen  }) {
  const viewMap = new Map();
  const rootElement = document.documentElement;

  function setActiveView(viewName) {
    for (const [name, element] of viewMap.entries()) {
      const active = name === viewName;
      element.classList.toggle("is-active", active);
      element.setAttribute("aria-hidden", active ? "false" : "true");
    }
  }

function openBoard() {
  menuElement.classList.add("is-hidden");
  boardElement.classList.add("is-open");
  boardElement.classList.add("is-visible");
  rootElement.classList.add("is-portfolio-open");
  boardElement.setAttribute("aria-hidden", "false");

  if (onOpen) {
    onOpen(); // 🔥 THIS CALLS YOUR HOME VIEW
  }
}
  return {
    init() {
      if (!menuElement || !boardElement) {
        return;
      }

      for (const view of boardElement.querySelectorAll(".board-view")) {
        const viewName = view.dataset.view;
        if (VIEW_NAMES.includes(viewName)) {
          viewMap.set(viewName, view);
        }
      }

      if (openButton) {
        openButton.addEventListener("click", event => {
          event.preventDefault();
          openBoard();
        });
      } else {
        menuElement.addEventListener("click", event => {
          const openTrigger = event.target.closest(".fantasy-btn");
          if (!openTrigger) return;
          openBoard();
        });
      }

      boardElement.addEventListener("click", event => {
        const target = event.target.closest("[data-target-view]");
        if (!target) return;
        const nextView = target.getAttribute("data-target-view");
        if (!viewMap.has(nextView)) return;
        setActiveView(nextView);
      });
    }
  };
}
