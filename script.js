// nav mbar
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
