import { renderHome } from "../views/homeView.js";
import {renderSkills} from "../views/skillsView.js";
import { renderProjects } from "../views/projectsView.js";
import { renderCareer } from "../views/careerView.js";
import { renderBlogs } from "../views/blogsView.js";
import { renderServices } from "../views/servicesView.js";
import { renderContact } from "../views/contactView.js";
import { renderResume } from "../views/resumeView.js";

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

     if (page === "skills") {
    boardTitle.textContent = "SKILLS";
    boardContent.innerHTML = renderSkills();
  }

  if (page === "projects") {
    boardTitle.textContent = "PROJECTS";
    boardContent.innerHTML = renderProjects();
  }
  if (page === "career") {
    boardTitle.textContent = "CAREER";
    boardContent.innerHTML = renderCareer();
  }
  if (page === "blogs") {
    boardTitle.textContent = "BLOGS";
    boardContent.innerHTML = renderBlogs();
  }
  if (page === "services") {
    boardTitle.textContent = "SERVICES";
    boardContent.innerHTML = renderServices();
  }
  
  if (page === "contact") {
    boardTitle.textContent = "CONTACT";
    boardContent.innerHTML = renderContact();
  }

  if (page === "resume") {
    boardTitle.textContent = "RESUME";
    boardContent.innerHTML = renderResume();
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