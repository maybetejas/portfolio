import { renderHome } from "../views/homeView.js";

export function createLayoutSystem({ root, boardContent, boardTitle }) {
  const compactBreakpoint = 720;

  function updateLayoutMode() {
    root.classList.toggle("is-compact-ui", window.innerWidth < compactBreakpoint);
  }

  function navigate(page) {
    if (page === "home") {
      boardTitle.textContent = "PORTFOLIO";
      boardContent.innerHTML = renderHome();
    }
  }

  return {
    init() {
      updateLayoutMode();
      window.addEventListener("resize", updateLayoutMode);
    },
    navigate
  };
}