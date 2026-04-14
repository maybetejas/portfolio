export function createMenuSystem({ menuElement, portfolioButton, portfolioScreen }) {
  function showPortfolio() {
    menuElement.classList.add("is-hidden");
    portfolioScreen.classList.add("is-visible");
    portfolioScreen.setAttribute("aria-hidden", "false");
  }

  return {
    init() {
      portfolioButton?.addEventListener("click", showPortfolio);
    }
  };
}
