export function createLayoutSystem({ root }) {
  const compactBreakpoint = 720;

  function updateLayoutMode() {
    root.classList.toggle("is-compact-ui", window.innerWidth < compactBreakpoint);
  }

  return {
    init() {
      updateLayoutMode();
      window.addEventListener("resize", updateLayoutMode);
    }
  };
}
