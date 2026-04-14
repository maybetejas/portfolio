export function renderHome() {
  return `
    <div class="home">

      <!-- LEFT PROFILE -->
      <div class="home-left">
        <img class="home-pfp" src="assets/decor/pfp.png" />

        <h3 class="home-name">HI, I'M<br>TEESHA</h3>

        <p class="home-role">WEB DEVELOPER & PIXEL ARTIST</p>

        <p class="home-tagline">
          BUILDING WEBSITES<br>WITH LOVE & PIXELS
        </p>

        <button class="cta-btn">
          CONTACT ME
        </button>
      </div>

      <!-- RIGHT GRID -->
      <div class="home-grid">

        ${card("projects", "Projects", "projects.png")}
        ${card("skills", "Skills", "skills.png")}
        ${card("career", "Career", "career.png")}
        ${card("resume", "Resume", "resume.png")}
        ${card("blogs", "Blogs", "blogs.png")}
        ${card("services", "Services", "services.png")}

      </div>

    </div>
  `;
}

function card(page, title, icon) {
  return `
    <div class="home-card" data-page="${page}">
      <img src="assets/decor/card.webp" class="card-bg" />
      <img src="assets/decor/${icon}" class="card-icon" />
      <span class="card-title">${title}</span>
    </div>
  `;
}