# HANDOFF — portfolio v3 « La pile »

Dernière mise à jour : 17/11/2026. Rien n'est en cours dans le code : le dépôt est propre, `main` est à jour avec `origin/main` (commit `bec32bb`).

## Prochaine tâche : l'animation d'ouverture « faux agents » (à construire, rien n'est commencé)

### L'idée

Au premier chargement, quelques curseurs d'« agents » apparaissent sur une page presque vide et construisent le site sous les yeux du visiteur : l'un tape le titre, un autre glisse la pile 3D en place, un autre pose la colonne de couches, un dernier coche « Disponible pour une alternance ». C'est une mise en scène de vraie manipulation du DOM, sur le vrai contenu de la page. Il n'y a pas de vidéo ni de faux écran : les éléments sont déjà là, cachés, et les agents les « posent ».

### Ce que l'animation doit respecter

- **Courte et passable.** 4 à 6 s au maximum, un bouton « Passer » visible dès la première image, et `Échap` ou n'importe quel scroll ou clic termine tout de suite sur la page finale.
- **Une seule fois.** Elle se joue à la première visite et ne revient pas ensuite (`localStorage`, dans un try/catch). Un paramètre `?intro` la rejoue pour les démos.
- **Accessible.** Aucune animation avec `prefers-reduced-motion` : la page s'affiche directement. Sans JS, la page s'affiche normalement, car l'animation ne doit jamais être la condition de l'affichage. Les lecteurs d'écran ne doivent pas lire les étiquettes des curseurs (`aria-hidden`).
- **Le contenu reste le vrai.** On anime l'apparition d'éléments existants (opacité, `clip-path`, transformations, frappe du texte du `h1`). On ne génère jamais un faux contenu qui disparaîtrait ensuite. Le SEO et l'image d'aperçu ne changent pas.
- **Ne pas casser la pile 3D.** `stack.js` démarre seulement après `load` et `fonts.ready`. L'animation doit soit attendre que le canevas soit `.on`, soit faire « glisser » le canevas déjà prêt (opacité ou translation du `#stack`). Ne jamais bloquer `boot()`.
- **Mobile.** Une version plus courte (2 ou 3 curseurs, 3 s), ou pas d'animation du tout sous 860 px. C'est à décider avec l'utilisateur.
- **Pas d'effet « généré par IA ».** L'utilisateur refuse les apparitions mot par mot avec flou et les transitions répétées à l'identique : il faut varier les gestes des agents.

### Esquisse technique (à valider avec l'utilisateur avant de coder)

- Un nouveau module `assets/js/intro.js`, importé par `main.js`, qui décide s'il faut jouer l'animation et la pilote.
- `root.classList.add('building')` au tout début (dans le script inline du `<head>`, comme pour le thème) : en CSS, `.building` cache les éléments que les agents vont poser. Ça évite tout flash du contenu final avant le début de l'animation.
- Les curseurs sont des éléments `position: fixed` (SVG de flèche et petite étiquette en mono : `agent·layout`, `agent·3d`, `agent·copy`…), dans la couleur d'accent `--acc` et dans les couleurs du thème clair et sombre.
- Un scénario déclaratif : une liste d'étapes `{ agent, cible (sélecteur), geste: 'move' | 'type' | 'drag' | 'click' | 'select', durée }`. Les positions se calculent avec `getBoundingClientRect()` au moment de l'étape. Chaque étape retire `.building` de sa cible, ou anime sa propriété.
- Une seule boucle `requestAnimationFrame` avec des courbes d'accélération (`--ease`, déjà défini). Les curseurs suivent des trajectoires courbes et légèrement imparfaites, pour faire humain sans faire robot.
- Fin : on retire `.building`, les curseurs s'effacent, le bouton « Passer » disparaît, puis `track()` est appelé pour recaler l'en-tête et la pile.
- Propositions de scénario à soumettre à l'utilisateur sous forme de choix (il préfère cocher des options plutôt que lire un pavé) :
  1. « Équipe de build » : 4 agents en parallèle, chacun sur sa zone.
  2. « Relais » : un agent pose un élément, le suivant prend la suite.
  3. « Revue de code » : un agent construit, un autre surligne et « valide ».

### Comment vérifier

- Le volet navigateur de l'app n'a pas WebGL et ne fait pas tourner les observateurs quand il est masqué : il ne sert qu'aux vérifications DOM.
- Pour la pile 3D et les vidéos, utiliser Chromium sans fenêtre, piloté en temps réel par CDP (`chromium --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --remote-debugging-port=…`, puis `Page.captureScreenshot`). `--virtual-time-budget` ne fait pas avancer l'animation de la caméra. Le petit script `cdp.mjs` utilisé jusqu'ici était dans le scratchpad et a disparu : il faut le recréer (~40 lignes, avec le `WebSocket` natif de Node 24).
- Tailles à tester : 1280×800, 1366×768, 1440×900, 1920×1080 et 390×844 (mobile), en thème clair et en thème sombre.
- Serveur local : `.claude/launch.json` du dossier parent (`python3 -m http.server 4180 --directory portfolio-v3`).

## Conventions du dépôt (à respecter)

- Après toute modification de `site.css` ou `main.js`, augmenter le `?v=` de leurs URL dans `index.html`, ainsi que celui de `stack.js` dans l'`import()` de `main.js` (dernière valeur : `v=14`).
- Commits : jamais de mention de Claude (ni `Co-Authored-By`, ni lien de session). Messages en français, comme l'historique.
- Poussée : l'autopush pousse 10 min après le dernier commit. Ne pas pousser soi-même, ne pas amender un commit de plus de 10 min.
- Clé SSH : toujours `~/.ssh/id_ed25519`, protégée par un mot de passe. Si `ssh-add -l` est vide, lancer `ssh-add ~/.ssh/id_ed25519` dans un onglet du terminal et laisser l'utilisateur taper son mot de passe.
- `apercus/` est exclu en local (`.git/info/exclude`) et ne doit pas être publié.
- Ce fichier est public : GitHub Pages sert tout le dépôt. Ne rien y mettre de privé.

## État du site (pour se repérer)

- Structure : intro, couches 01 à 06 (projets `article.project` avec kicker `NN.n`), section « Contributions open source » (`#open-source`, `data-mode="oss"`), index des technos, alternance (couche 07), contact.
- Projets avec vidéo, tous au même format (`figure.media`) : Nexus, LiveQuill, equation sound lab et le son du doute (verticaux, avec bouton de son, une seule vidéo sonore à la fois), Woofer, Rusky, CartmanCLI et PowerPrinter.
- PR : chargées en direct (`api.github.com/search/issues`, cache 30 min `prs-cache-v2`), fusionnées en tête, barre fusionnées / en revue / fermées. La liste du HTML sert de secours et est à régénérer de temps en temps.
- Pile 3D (`stack.js`) : `fitToColumn()` projette son emprise à chaque image et la garde à droite de la colonne de texte. Le filtre des technos (`mode === 'tech'` avec `hits`) cadre les couches concernées.
- Aucun projet ne s'ajoute automatiquement depuis GitHub, seules les PR le font. L'utilisateur s'y attendait pour Rusky : un ajout automatique (topic `portfolio` + `docs/demo.mp4`) reste une idée ouverte, jamais validée.
- Le site du son du doute (`ybucaille.github.io/le-son-du-doute/`) répondait encore 404 au moment de l'ajout. Le lien a été mis à la demande de l'utilisateur.
