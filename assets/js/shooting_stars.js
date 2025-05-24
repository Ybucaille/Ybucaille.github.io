const starsContainer = document.getElementById('starsContainer');

function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = `${Math.random() * window.innerWidth}px`;
    shootingStar.style.top = `${Math.random() * (window.innerHeight / 3)}px`;

    const duration = 1 + Math.random() * 2;
    shootingStar.style.animation = `shootingStar ${duration}s ease-out`;

    starsContainer.appendChild(shootingStar);
    setTimeout(() => shootingStar.remove(), duration * 1000);
}

// Lancer une étoile filante de temps en temps
setInterval(() => {
    if (Math.random() < 0.6) {
        createShootingStar();
    }
}, 4000);
