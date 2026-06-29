// app.js

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       ÉCRAN DE CHARGEMENT BRUTALISTE & TRANSITIONS DE PAGE
       ========================================================================== */
    const loader = document.getElementById('brutalist-loader');
    if (loader) {
        const isFirstLoad = !sessionStorage.getItem('siteLoaded');
        
        if (isFirstLoad) {
            // Première visite : on joue l'animation complète de chargement (1.6s)
            setTimeout(() => {
                loader.classList.add('loaded');
                sessionStorage.setItem('siteLoaded', 'true');
            }, 1600);
        } else {
            // Navigation interne : on cache les textes et la barre de progression, mais on garde le logo
            const elementsToHide = loader.querySelectorAll('.loader-title, .loader-progress-box, .loader-status');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            // On lève le rideau noir (bas vers le haut) presque immédiatement
            setTimeout(() => {
                loader.classList.add('loaded');
            }, 50);
        }

        // Gérer les transitions de page
        const pageLinks = document.querySelectorAll('a[href*=".html"]');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetUrl = href.split('#')[0];
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                
                // Si on navigue sur la même page (ex: index.html#hash alors qu'on y est déjà), on laisse le comportement par défaut
                if (targetUrl === currentPage || (targetUrl === 'index.html' && currentPage === '') || (targetUrl === '' && currentPage === 'index.html')) return;
                
                e.preventDefault();
                
                // On masque le texte et la jauge, pour ne garder que le logo
                const elementsToHide = loader.querySelectorAll('.loader-title, .loader-progress-box, .loader-status');
                elementsToHide.forEach(el => el.style.display = 'none');
                
                // Le rideau descend (haut vers le bas)
                loader.classList.remove('loaded');
                
                // Redirection après la fin du rideau (0.8s)
                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            });
        });
    }

    /* ==========================================================================
       SCROLLSPY (MISE EN ÉVIDENCE DU LIEN ACTIF AU DÉFILEMENT)
       ========================================================================== */
    const sections = document.querySelectorAll('.scroll-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px', // Déclenche quand la section atteint le haut de l'écran
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Retirer .active de tous les liens
                navLinks.forEach(link => link.classList.remove('active'));
                // Ajouter .active au lien correspondant
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Smooth scroll manuel pour gérer le décalage (offset) du header fixe de façon dynamique
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Calculer dynamiquement la hauteur du header s'il est collant
                const header = document.querySelector('.main-header');
                const isSticky = window.getComputedStyle(header).position === 'sticky';
                const yOffset = isSticky ? -header.offsetHeight - 20 : -20; 
                
                const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
    });

    /* ==========================================================================
       GESTION DES PARTICULES SAKURA
       ========================================================================== */
    const sakuraBtn = document.getElementById('toggle-sakura');
    const sakuraContainer = document.getElementById('sakura-container');
    let sakuraActive = true;
    let sakuraInterval;

    function createPetal() {
        if (!sakuraActive) return;
        const petal = document.createElement('div');
        petal.classList.add('sakura-petal');
        
        // Taille aléatoire
        const size = Math.random() * 10 + 5; // 5px à 15px
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        
        // Position X aléatoire
        petal.style.left = `${Math.random() * 100}vw`;
        
        // Durée de chute aléatoire
        const duration = Math.random() * 5 + 5; // 5s à 10s
        petal.style.animationDuration = `${duration}s`;
        
        sakuraContainer.appendChild(petal);
        
        // Nettoyer après la chute
        setTimeout(() => {
            petal.remove();
        }, duration * 1000);
    }

    function startSakura() {
        sakuraActive = true;
        sakuraInterval = setInterval(createPetal, 400); // Un pétale toutes les 400ms
    }

    function stopSakura() {
        sakuraActive = false;
        clearInterval(sakuraInterval);
        sakuraContainer.innerHTML = ''; // Nettoyer
    }

    if (sakuraBtn) {
        sakuraBtn.addEventListener('click', () => {
            sakuraActive = !sakuraActive;
            sakuraBtn.classList.toggle('active');
            
            const btnText = sakuraBtn.querySelector('.btn-text');
            if (sakuraActive) {
                btnText.textContent = "SAKURA: ON";
                startSakura();
            } else {
                btnText.textContent = "SAKURA: OFF";
                stopSakura();
            }
        });
    }

    // Démarrer au chargement
    startSakura();

    /* ==========================================================================
       LOGIQUE DU FORMULAIRE DE CONTACT (SIMULATION)
       ========================================================================== */
    const contactForm = document.getElementById('brutalist-contact-form');
    const receiptBox = document.getElementById('contact-receipt');
    
    if (contactForm && receiptBox) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('form-name').value;
            const msgInput = document.getElementById('form-message').value;
            
            // Remplir le reçu
            document.getElementById('receipt-sender').textContent = nameInput;
            
            // Format de date simple
            const d = new Date();
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
            document.getElementById('receipt-date').textContent = dateStr;
            
            // Limiter la taille du message affiché sur le reçu
            let shortMsg = msgInput;
            if (shortMsg.length > 100) {
                shortMsg = shortMsg.substring(0, 100) + '...';
            }
            document.getElementById('receipt-msg-body').textContent = shortMsg;
            
            // Afficher le reçu
            receiptBox.classList.remove('hidden');
            
            // Effacer le formulaire
            contactForm.reset();
        });
    }

    /* ==========================================================================
       LOGIQUE DE LA TIMELINE DE PARCOURS
       ========================================================================== */
    const stations = document.querySelectorAll('.metro-station');
    
    stations.forEach((station, index) => {
        station.addEventListener('click', () => {
            // Nettoyer les classes actives
            stations.forEach(s => s.classList.remove('active'));
            
            // Mettre à jour l'état visuel des stations
            stations.forEach((s, i) => {
                const node = s.querySelector('.station-node');
                if (i < index) {
                    node.style.backgroundColor = 'var(--text-dark)'; // Station passée
                } else if (i === index) {
                    node.style.backgroundColor = ''; // Reset CSS gérera .active
                } else {
                    node.style.backgroundColor = 'var(--bg-cream)'; // Station future
                }
            });
            
            station.classList.add('active');
            
            // Mettre à jour la barre de progression (très basique pour l'effet, s'adapte en hauteur ou en largeur)
            const progress = document.querySelector('.metro-progress');
            if (progress) {
                const percentage = (index / (stations.length - 1)) * 100;
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    progress.style.height = `${percentage}%`;
                    progress.style.width = '100%';
                } else {
                    progress.style.width = `${percentage}%`;
                    progress.style.height = '100%';
                }
            }
            
            // Mettre à jour la carte de détail
            const expTitle = document.querySelector('.exp-title-h3');
            const expCompany = document.querySelector('.exp-company-ja');
            const expDate = document.querySelector('.exp-date-badge');
            const list = document.querySelector('.brutalist-list');
            
            if (index === 0) {
                expTitle.textContent = "Baccalauréat Générale optin NSI et AMC";
                expDate.textContent = "2022";
                list.innerHTML = `
                    <li>Direction artistique de sites web interactifs à fort impact pour marques de luxe et culturelles.</li>
                    <li>Conception de prototypes interactifs avancés sous Figma et transfert technique rigoureux en CSS.</li>
                    <li>Développement de grilles d'information asymétriques optimisées pour tous les formats de terminaux.</li>
                `;
            } else if (index === 1) {
                expTitle.textContent = "BTS SIO option SLAM";
                expDate.textContent = "2022 - 2024";
                list.innerHTML = `
                    <li>Création d'expériences WebGL et animations complexes (Three.js, GSAP).</li>
                    <li>Intégration pixel-perfect de maquettes haute fidélité.</li>
                    <li>Optimisation des performances web (Core Web Vitals).</li>
                `;
            } else if (index === 2) {
                expTitle.textContent = "Bachelor 3ème année Webdesign";
                expDate.textContent = "2025 - 2026";
                list.innerHTML = `
                    <li>Design de systèmes de composants et UI kits.</li>
                    <li>Maquettage fil de fer (Wireframes) et tests utilisateurs.</li>
                    <li>Maintenance CSS et révision typographique.</li>
                `;
            } 
        });
    });

    /* ==========================================================================
       LOGIQUE DES PRINCIPES DE DESIGN (ONGLETS INTERNES)
       ========================================================================== */
    const principleBtns = document.querySelectorAll('.principle-btn');
    
    principleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            principleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const concept = btn.getAttribute('data-concept');
            const titleEl = document.getElementById('principle-title-ja');
            const descEl = document.getElementById('principle-description');
            
            if (concept === 'wabi-sabi') {
                titleEl.textContent = "侘寂 — WABI-SABI";
                descEl.textContent = "L'acceptation de l'imperfection, de l'asymétrie et de l'usure naturelle. Dans mon code, cela se traduit par des textures organiques et des mises en page asymétriques réfléchies.";
            } else if (concept === 'shibui') {
                titleEl.textContent = "渋味 — SHIBUI";
                descEl.textContent = "Une beauté simple, subtile et discrète. Je privilégie les palettes de couleurs restreintes et la hiérarchie visuelle claire sans ornements superflus. L'interface ne s'impose pas, elle se découvre.";
            } else if (concept === 'yugen') {
                titleEl.textContent = "幽玄 — YŪGEN";
                descEl.textContent = "Un sens profond et mystérieux de la grâce. À travers le design interactif, j'ajoute des micro-interactions insoupçonnées qui donnent vie à l'interface uniquement lorsqu'on la manipule.";
            }
        });
    });

    /* ==========================================================================
       WIDGET VIEWPORT (MISE À JOUR EN TEMPS RÉEL)
       ========================================================================== */
    const viewportSizeLabel = document.getElementById('viewport-size');
    
    function updateViewport() {
        if (viewportSizeLabel) {
            viewportSizeLabel.textContent = `${window.innerWidth} × ${window.innerHeight}`;
        }
    }
    
    window.addEventListener('resize', updateViewport);
    updateViewport(); // Init
});
