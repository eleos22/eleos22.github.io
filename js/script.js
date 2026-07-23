// nav bar
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".toggle-button");
  const navbarLinks = document.querySelector(".navbar-links");
  const header = document.querySelector("header");

  toggleButton.addEventListener("click", () => {
    navbarLinks.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      navbarLinks.classList.remove("active");
    }
  });

  // New code for active section detection and hover effect
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".navbar-links a");

  function changeActiveLink() {
    let index = sections.length;

    while (--index && window.scrollY + 120 < sections[index].offsetTop) {}

    navLinks.forEach((link) => link.classList.remove("active"));
    navLinks[index].classList.add("active");
  }

  changeActiveLink();
  window.addEventListener("scroll", changeActiveLink);
});

// For projects section
const projects = [
  {
    title: "Bebecita's Cookbook (Recipe Saver)",
    description:
      "Create, Add, Store your favorite food recipes. Customizable CookBook with fun and useful cooking components that make cooking simpler.",
    link: "https://bebecitas-cookbook.vercel.app/",
    image: "/Images/Projects images/Bebecita's CookBook Proj IMG.png",
  },
  {
    title: "Personal Portfolio (Web Card)",
    description:
      "Web card and portfolio page for personal client allows them to be contacted seamlessly.",
    link: "https://jacob-business-card.vercel.app/",
    image: "/Images/Projects images/Jacob Proj IMG.png",
  },
];

const projectContainer = document.querySelector(".personal-projects-tiles");

if (projectContainer) {
  projects.forEach((project) => {
    const projectTile = document.createElement("div");
    projectTile.classList.add("project-tile");

    projectTile.innerHTML = `
      <img src="${project.image}" alt="Project Image" />
      <div class="project-info">
        <h4>${project.title}</h4>
        <p>${project.description}</p>
        <a href="${project.link}" class="project-link">View Project</a>
      </div>
    `;

    projectContainer.appendChild(projectTile);
  });
}
// End of projects section
