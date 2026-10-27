# Portfolio v3 — « La pile »

Site statique (HTML, CSS, JS module). Une scène Three.js (0.169, via jsDelivr) montre une pile de six couches ; chaque projet est un bloc posé sur sa couche, la couche active sort comme un tiroir de baie au défilement.

- Couches : 01 Interfaces & IA · 02 Bureau & GPU · 03 Ligne de commande · 04 Services · 05 Système & réseau · 06 Socle, puis la couche 07 « votre entreprise » (alternance).
- Index des technologies généré à partir des attributs `data-tech` : survoler une techno allume ses projets dans la pile.
- Sans WebGL, ou sans JS, tout le contenu reste lisible. `prefers-reduced-motion` : pas d'animation, vidéos avec contrôles et sans lecture auto, terminaux affichés d'un bloc.
- Vidéos chargées seulement quand elles deviennent visibles.
- Thème clair/sombre (bouton dans l’en-tête, mémorisé, sinon réglage du système). Le CV s’ouvre dans une modale (PDF intégré sur ordinateur, image sur mobile).

Lancer : `python3 -m http.server 4180 --directory portfolio-v3` puis http://localhost:4180.

Médias : `assets/media/` (vidéo Nexus capturée sur le cockpit Horizon avec une base SQLite jetable, aucun code montré). `apercus/` : captures de contrôle, à ne pas publier.
