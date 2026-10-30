# Portfolio v3 — « La pile »

Site statique (HTML, CSS, JS module). Une scène Three.js (0.169, via jsDelivr) montre une pile de six couches ; chaque projet est un bloc posé sur sa couche, la couche active sort comme un tiroir de baie au défilement.

- Couches : 01 Interfaces & IA · 02 Bureau & GPU · 03 Ligne de commande · 04 Services · 05 Système & réseau · 06 Socle. Après la pile : les contributions open source, l'index des technologies, puis la couche 07 « votre entreprise » (alternance).
- Ajouter un projet : un `<article class="project">` dans sa couche (`data-project`, `data-tech`, numéro dans le kicker) ; la vidéo va dans `assets/media/` avec une image d'aperçu. Rien n'est ajouté automatiquement depuis GitHub, seules les pull requests le sont.
- Index des technologies généré à partir des attributs `data-tech` : survoler une techno allume ses projets, la sélectionner cadre leurs couches dans la pile.
- Pull requests chargées depuis l'API GitHub (recherche `author:Ybucaille -user:Ybucaille`, cache 30 min) : fusionnées d'abord, barre fusionnées / en revue / fermées. La liste écrite dans le HTML sert de secours.
- Sans WebGL, ou sans JS, tout le contenu reste lisible. `prefers-reduced-motion` : pas d'animation, vidéos avec contrôles et sans lecture auto, terminaux affichés d'un bloc.
- Vidéos chargées seulement quand elles deviennent visibles.
- Thème clair/sombre (bouton dans l’en-tête, mémorisé, sinon réglage du système). Le CV et les certificats RGPD et SecNum s’ouvrent dans une modale (CV en PDF intégré sur ordinateur, images sinon).
- Après une modification du CSS ou du JS, augmenter le `?v=` de leurs URL dans `index.html` (et celui de `stack.js` dans `main.js`).

Lancer : `python3 -m http.server 4180 --directory portfolio-v3` puis http://localhost:4180.

Médias : `assets/media/` (vidéo Nexus capturée sur le cockpit Horizon avec une base SQLite jetable, aucun code montré ; CartmanCLI et PowerPrinter enregistrés depuis les vrais binaires ; Rusky reprend `docs/demo.mp4` de son dépôt ; equation sound lab rendu par le lab). `apercus/` : captures de contrôle, à ne pas publier.
