particlesJS("particles-js", {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 900
      }
    },
    color: {
      value: "#ffffff"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.4,
      random: true,
      anim: {
        enable: true,
        speed: 0.2,
        opacity_min: 0.1,
        sync: false
    }
    },
    size: {
      value: 2.5,
      random: true
    },
    line_linked: {
      enable: false
    },
    move: {
      enable: true,
      speed: 0.3,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out"
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false
      },
      onclick: {
        enable: false
      },
      resize: true
    }
  },
  retina_detect: true
});

const titles = [
  "Creative Developer",
  "Indie AI Engineer",
  "Autonomous Systems Architect",
  "Software Maker",
  "Full-Stack Tinkerer"
];

document.addEventListener('DOMContentLoaded', () => {
  const favicon = document.getElementById("dynamicFavicon");
  if (!favicon) return;

  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 8;

  const iconPath = isNight
    ? "assets/images/logo_night.png"
    : "assets/images/logo_day.png";

  favicon.href = iconPath;
  console.log("Favicon utilisé :", iconPath);
});

let index = 0;
const titleElement = document.getElementById("dynamic-title");

setInterval(() => {
  index = (index + 1) % titles.length;
  titleElement.textContent = titles[index];
}, 3000);

function closeModalOutside(event) {
  const modals = ['cvModal', 'projectsModal', 'certModal'];

  modals.forEach(id => {
    if (event.target.id === id) {
      document.getElementById(id).classList.add('hidden');
    }
  });
}

const scrollBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollBtn.classList.add('show');
  } else {
    scrollBtn.classList.remove('show');
  }
});

scrollBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  const isOpen = !modal.classList.contains('hidden');

  if (isOpen) {
    modal.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  } else {
    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }

  if (modalId === "certModal") {
      renderCertifications(certifications);
    }
}

function closeModalOutside(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }
}

const customProjects = [
  {
    name: "Cat Identifier",
    description: "Système de reconnaissance de chats via webcam, combinant détection YOLOv11 et classification fine-tunée. L'application apprend à différencier tes chats au fil des captures et s'améliore en continu.",
    language: "Python",
    url: "assets/pdfs/Cats_Identifier.pdf",
    date: "2024-09-10"
  },
  {
    name: "NexNotes",
    description: "NexNotes est une application de prise de notes audio et texte, conçue pour capturer l’essentiel sans friction ni dépendance au cloud. Elle transforme tes idées en résumés clairs et exploitables, sans dépendance cloud.",
    language: "Python",
    version: "v1.0",
    url: "https://github.com/Ybucaille/NexNotes",
    date: "2025-05-15"
  },
  {
    name: "Mnemonic",
    description: "Mnemonic est un moteur de mémoire vectorielle local et autonome, conçu pour stocker et retrouver des souvenirs riches de sens : prompts, réponses, réflexions, faits, etc.",
    language: "Python",
    version: "v1.0",
    url: "https://github.com/Ybucaille/Mnemonic",
    date: "2025-05-16"
  },
  {
    name: "Youtube_Backup",
    description: "Youtube_Backup est un script Python conçu pour sauvegarder efficacement les vidéos d'une chaîne YouTube en utilisant l'API officielle de Google. Idéal pour archiver automatiquement tes contenus ou créer une copie locale avant suppression ou privatisation.",
    language: "Python",
    version: "v1.0",
    url: "https://github.com/Ybucaille/Youtube_Backup",
    date: "2023-01-06"
  },
  {
    name: "Nexus",
    description: "Projet d’IA autonome capable d’évolution, de réflexion et d’interaction intelligente avec son créateur.",
    language: "Python",
    version: "v1.0",
    url: "https://github.com/Ybucaille/Nexus",
    date: "2025-04-06"
  },
  {
    name: "ЯзXP",
    description: "ЯзXP est une webapp ludique pour apprendre le vocabulaire russe selon ton niveau CECR (A1 à C2), tout en gagnant de l’expérience et en suivant ta progression comme dans un jeu vidéo.",
    language: "Python",
    version: "v1.0",
    url: "assets/pdfs/ЯзXP.pdf",
    date: "2025-04-18"
  },
];

document.querySelector('[onclick="toggleModal(\'projectsModal\')"]').addEventListener('click', () => {
  fetchGitHubRepos('Ybucaille');
});

async function fetchGitHubRepos(username) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';

  const allProjects = [];
  const githubNames = new Set();
  const CACHE_KEY = `github_repos_${username}`;
  const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 heures

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (!isExpired && Array.isArray(parsed.projects)) {
      console.log("✅ Chargé depuis le cache GitHub");
      renderProjects([...parsed.projects, ...customProjects]);
      return;
    }
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await response.json();
    const excludedRepos = new Set(['ybucaille.github.io']);

    if (!Array.isArray(repos)) throw new Error("Réponse GitHub invalide");

    for (const repo of repos) {
      if (repo.name.toLowerCase() === username.toLowerCase()) continue;

      if (repo.name.toLowerCase() === username.toLowerCase() || excludedRepos.has(repo.name.toLowerCase())) continue;

      githubNames.add(repo.name.toLowerCase());

      let version = null;
      try {
        const releaseRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/releases/latest`);
        if (releaseRes.ok) {
          const releaseData = await releaseRes.json();
          version = releaseData.tag_name;
        }
      } catch (err) {
        console.warn(`Pas de release pour ${repo.name}`);
      }

      allProjects.push({
        name: repo.name,
        description: repo.description || 'Pas de description',
        language: repo.language || 'N/A',
        version,
        url: repo.html_url,
        date: repo.created_at
      });
    }
  } catch (error) {
    console.warn("⚠️ Requête GitHub échouée, fallback uniquement sur les projets locaux :", error);
  }

  // Fallback ou fusion des projets custom non présents sur GitHub
  customProjects.forEach(p => {
    if (!p.name || !p.date) return;

    // Ajoute si pas déjà trouvé sur GitHub
    if (!githubNames.has(p.name.toLowerCase())) {
      allProjects.push(p);
    }
  });

  // Sauvegarde en cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    projects: allProjects
  }));

  // Tri final
  allProjects.sort((a, b) => {
    const dateA = new Date(a.date ?? 0);
    const dateB = new Date(b.date ?? 0);
    return dateB - dateA;
  });

  // Debug
  /*console.table(allProjects.map(p => ({
    name: p.name,
    date: p.date
  })));*/

  // Rendu
  allProjects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'bg-[#2c2c44] rounded-xl p-4 flex flex-col';

    const versionBadge = proj.version
      ? `<span class="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full">${proj.version}</span>`
      : '';

    const isPDF = proj.url && proj.url.toLowerCase().endsWith('.pdf');

    const actions = `
      <div class="mt-auto flex ${proj.version ? 'gap-2 items-center' : 'justify-center'}">
        ${versionBadge}
        <a href="${proj.url}" target="_blank" class="inline-block bg-purple-600/30 text-white px-3 py-1 rounded-full font-bold text-sm hover:bg-purple-600/60 transition">
          ${isPDF ? 'Voir le PDF' : 'Voir le projet'}
        </a>
      </div>
    `;

    card.innerHTML = `
      <span class="text-sm text-white bg-purple-500/30 px-2 py-1 rounded-full w-fit">${proj.language}</span>
      <h3 class="text-lg font-semibold text-purple-300 mt-2">${proj.name}</h3>
      <p class="text-sm mt-1 text-white/90">${proj.description}</p>
      ${actions}
    `;

    container.appendChild(card);
  });
}

function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';

  const githubNames = new Set();
  const allProjects = [];

  projects.forEach(p => {
    if (!p.name || !p.date) return;

    const name = p.name.toLowerCase();
    if (!githubNames.has(name)) {
      githubNames.add(name);
      allProjects.push(p);
    }
  });

  allProjects.sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));

  allProjects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'bg-[#2c2c44] rounded-xl p-4 flex flex-col';

    const versionBadge = proj.version
      ? `<span class="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full">${proj.version}</span>`
      : '';

    const isPDF = proj.url && proj.url.toLowerCase().endsWith('.pdf');

    const actions = `
      <div class="mt-auto flex ${proj.version ? 'gap-2 items-center' : 'justify-center'}">
        ${versionBadge}
        <a href="${proj.url}" target="_blank" class="inline-block bg-purple-600/30 text-white px-3 py-1 rounded-full font-bold text-sm hover:bg-purple-600/60 transition">
          ${isPDF ? 'Voir le PDF' : 'Voir le projet'}
        </a>
      </div>
    `;

    card.innerHTML = `
      <span class="text-sm text-white bg-purple-500/30 px-2 py-1 rounded-full w-fit">${proj.language}</span>
      <h3 class="text-lg font-semibold text-purple-300 mt-2">${proj.name}</h3>
      <p class="text-sm mt-1 text-white/90">${proj.description}</p>
      ${actions}
    `;

    container.appendChild(card);
  });
}

const certifications = [
  {
    title: "Introduction to Modern AI",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/110x110/images/e2d12302-10f9-40d4-8ff1-066a7008b61d/blob",
    url: "https://www.credly.com/badges/a1686a18-7bb2-478a-bc9b-9a05163a034a/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Introduction to Data Science",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/340x340/images/b38a42e0-dc58-4ce2-b6c0-28d978e8aaad/image.png",
    url: "https://www.credly.com/badges/da6104bf-268e-4b8c-a302-7dc0fd3435e2/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Data Analytics Essentials",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/110x110/images/1fdfeaeb-e61c-4450-bdfe-a07bd4e715df/image.png",
    url: "https://www.credly.com/badges/1052776f-c472-42d9-8378-cfab3ff7d29f/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Linux Unhatched",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/340x340/images/f25ec9d4-c59d-49b9-944a-f160012e81cd/image.png",
    url: "https://www.credly.com/badges/fb0f5b17-09d9-4968-b4fa-0d8cb23bf447/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Computer Hardware Basics",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/340x340/images/19e742ef-13be-4d26-87ed-ac8f5fd0643c/image.png",
    url: "https://www.credly.com/badges/3a22b18b-0b46-48b1-8588-8f1aea782f66/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Endpoint Security",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/110x110/images/0ca5f542-fb5e-4a22-9b7a-c1a1ce4c3db7/EndpointSecurity.png",
    url: "https://www.credly.com/badges/ea20936a-340f-43d7-aacf-20d7d3c264bf/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Introduction to Cybersecurity",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/340x340/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/I2CS__1_.png",
    url: "https://www.credly.com/badges/6ac6fbdd-0dae-4283-bc36-4c4a88ff54e7/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "Ethical Hacker",
    issuer: "Cisco",
    year: "2025",
    image: "https://images.credly.com/size/340x340/images/242902b5-f527-42ad-865e-977c9e1b5b58/image.png",
    url: "https://www.credly.com/badges/844a0702-e748-4107-b5fe-bf75a2514399/public_url",
    validate: "Voir sur Credly"
  },
  {
    title: "RGPD",
    issuer: "CNIL",
    year: "2025",
    image: "assets/images/rgpd.jpg",
    url: "assets/pdfs/Certificat_RGPD.pdf",
    validate: "Voir le certificat PDF"
  },
  {
    title: "Attestation de suivi",
    issuer: "SecNum",
    year: "2025",
    image: "https://cdn.glitch.global/0a0fc8a5-02f2-465e-a097-4d0cfd754b7d/SecNum.png?v=1736722373099",
    url: "assets/pdfs/Certificat_SecNum.pdf",
    validate: "Voir le certificat PDF"
  }
];

function renderCertifications(data) {
  const container = document.getElementById("certificationsContainer");
  container.innerHTML = ''; // reset

  data.forEach(cert => {
    const needsBg = !cert.image.toLowerCase().includes('secnum');
    const imageClass = `w-20 h-20 rounded-md object-contain shrink-0 ${needsBg ? 'bg-white/10' : ''}`;

    const card = document.createElement('div');
    card.className = "bg-[#2c2c44] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:max-w-md";

    card.innerHTML = `
      ${cert.image.startsWith('css:')
        ? `<div class="${cert.image.replace('css:', '')} w-20 h-20 rounded-md shrink-0"></div>`
        : `<img src="${cert.image}" alt="${cert.title}" class="${imageClass}" />`}
      <div class="flex flex-col justify-between">
        <h3 class="text-white font-semibold leading-tight">${cert.title}</h3>
        <p class="text-sm text-white/80">${cert.issuer} – ${cert.year}</p>
        <a href="${cert.url}" target="_blank"
           class="mt-2 w-fit bg-purple-600/30 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-purple-600/60 transition">
           ${cert.validate}
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

function copyEmail() {
  const email = "bucaille.yann14@icloud.com";
  navigator.clipboard.writeText(email).then(() => {
    const tooltip = document.getElementById("copyTooltip");
    tooltip.classList.remove("opacity-0");
    tooltip.classList.add("opacity-100");

    setTimeout(() => {
      tooltip.classList.remove("opacity-100");
      tooltip.classList.add("opacity-0");
    }, 2000);
  }).catch(err => {
    console.error("Erreur lors de la copie :", err);
  });
}
