document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector('.toggle-button');
    const navbarLinks = document.querySelector('.navbar-links');
    const header = document.querySelector('header');

    toggleButton.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) {
            navbarLinks.classList.remove('active');
        }
    });
});
