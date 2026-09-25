// ==========================================================================
// CONFIGURATION GLOBALE DES TEMPS D'ANIMATION ET DU CHARGEMENT
// ==========================================================================
const ANIM_CONFIG = {
    // Animations d'apparition (Fade-in gauche à droite)
    fadeEasing: 'ease-in-out',        // Courbe Easy in and out
    fadeDurationImages: 1000,         // 1200ms pour les images
    fadeDurationTexts: 1200,          // 1400ms pour les textes

    // Écran de chargement (Brutalist Loader)
    loaderFirstVisitDuration: 1600,   // Durée d'attente à la première visite (ms)
    loaderSubsequentDuration: 50,     // Durée d'attente lors des navigations internes (ms)
    loaderFailsafeTimeout: 2000,      // Sécurité max pour forcer l'ouverture du rideau (ms)
    pageTransitionDuration: 800,      // Durée de descente du rideau lors du clic avant redirection (ms)
    
    // Déclenchement des apparitions (Fade-in scroll)
    scrollAnimationInitDelay: 100,    // Délai d'initialisation après ouverture du rideau (ms)
    scrollRootMargin: '0px 0px -40px 0px', // Marge de détection de l'IntersectionObserver
    scrollThreshold: 0.08             // Pourcentage de l'élément visible pour déclencher (8%)
};
window.ANIM_CONFIG = ANIM_CONFIG;

function initApp() {

    /* ==========================================================================
       ÉCRAN DE CHARGEMENT BRUTALISTE & TRANSITIONS DE PAGE
       ========================================================================== */
    const loader = document.getElementById('brutalist-loader');
    if (loader) {
        let isFirstLoad = true;
        try {
            isFirstLoad = !sessionStorage.getItem('siteLoaded');
        } catch (e) {
            isFirstLoad = false;
        }

        const dismissLoader = () => {
            if (!loader.classList.contains('loaded')) {
                loader.classList.add('loaded');
                setTimeout(initScrollAnimations, ANIM_CONFIG.scrollAnimationInitDelay);
            }
        };
        
        if (isFirstLoad) {
            // Première visite : on joue l'animation complète de chargement
            setTimeout(() => {
                dismissLoader();
                try { sessionStorage.setItem('siteLoaded', 'true'); } catch (e) {}
            }, ANIM_CONFIG.loaderFirstVisitDuration);
        } else {
            // Navigation interne : on cache les textes et la barre de progression, mais on garde le logo
            const elementsToHide = loader.querySelectorAll('.loader-title, .loader-progress-box, .loader-status');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            // On lève le rideau noir (bas vers le haut) presque immédiatement
            setTimeout(dismissLoader, ANIM_CONFIG.loaderSubsequentDuration);
        }

        // Sécurité absolue : si le rideau ne s'est pas levé au bout du délai max, on force la levée
        setTimeout(dismissLoader, ANIM_CONFIG.loaderFailsafeTimeout);

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
                
                // Redirection après la fin du rideau
                setTimeout(() => {
                    window.location.href = href;
                }, ANIM_CONFIG.pageTransitionDuration);
            });
        });
    } else {
        initScrollAnimations();
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
                if (btnText) btnText.textContent = "SAKURA: ON";
                sakuraBtn.setAttribute('aria-pressed', 'true');
                startSakura();
            } else {
                if (btnText) btnText.textContent = "SAKURA: OFF";
                sakuraBtn.setAttribute('aria-pressed', 'false');
                stopSakura();
            }
        });
    }

    // Démarrer au chargement en respectant la préférence utilisateur de réduction de mouvements
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        sakuraActive = false;
        if (sakuraBtn) {
            sakuraBtn.classList.remove('active');
            sakuraBtn.setAttribute('aria-pressed', 'false');
            const btnText = sakuraBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = "SAKURA: OFF";
        }
    } else {
        startSakura();
    }

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
            // Nettoyer les classes actives et mettre à jour aria-pressed
            stations.forEach(s => {
                s.classList.remove('active');
                s.setAttribute('aria-pressed', 'false');
            });
            
            // Mettre à jour l'état visuel des stations
            stations.forEach((s, i) => {
                const node = s.querySelector('.station-node');
                if (node) {
                    if (i < index) {
                        node.style.backgroundColor = 'var(--text-dark)'; // Station passée
                    } else if (i === index) {
                        node.style.backgroundColor = ''; // Reset CSS gérera .active
                    } else {
                        node.style.backgroundColor = 'var(--bg-cream)'; // Station future
                    }
                }
            });
            
            station.classList.add('active');
            station.setAttribute('aria-pressed', 'true');
            
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

        station.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                station.click();
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
                descEl.innerHTML = "Ma démarche artistique est guidée par une passion profonde pour le design brutaliste et le désir de transmettre des émotions brutes à travers des interfaces sans compromis.<br><br>L'asymétrie, les contrastes marqués et l'absence d'ornements superflus ne sont pas que des choix esthétiques : ce sont des vecteurs de ressenti et de connexion humaine.";
            } else if (concept === 'shibui') {
                titleEl.textContent = "渋味 — SHIBUI";
                descEl.innerHTML = "Une beauté simple, subtile et discrète. Je privilégie les palettes de couleurs restreintes et la hiérarchie visuelle claire sans ornements superflus. L'interface ne s'impose pas, elle se découvre.";
            } else if (concept === 'yugen') {
                titleEl.textContent = "幽玄 — YŪGEN";
                descEl.innerHTML = "Un sens profond et mystérieux de la grâce. À travers le design interactif, j'ajoute des micro-interactions insoupçonnées qui donnent vie à l'interface uniquement lorsqu'on la manipule.";
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

    /* ==========================================================================
       GESTION DU MENU BURGER MOBILE
       ========================================================================== */
    const burgerBtn = document.getElementById('mobile-burger-btn');
    const classicNav = document.querySelector('.classic-nav');

    if (burgerBtn && classicNav) {
        burgerBtn.addEventListener('click', () => {
            const isOpen = burgerBtn.classList.toggle('open');
            classicNav.classList.toggle('open');
            burgerBtn.setAttribute('aria-expanded', isOpen);
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Fermer le menu lors du clic sur un lien
        const navLinks = classicNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('open');
                classicNav.classList.remove('open');
                burgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==========================================================================
       ANIMATIONS D'APPARITION (FADE IN DE GAUCHE À DROITE)
       ========================================================================== */
    function initScrollAnimations() {
        // Enrichissement automatique pour les pages projets si des éléments clés n'ont pas encore la classe
        const autoTargets = document.querySelectorAll(
            '.project-detail-header, .project-banner-card, .project-overview-block, .tech-stack-container, .gallery-item, .project-detail-footer'
        );
        autoTargets.forEach((el, index) => {
            if (!el.classList.contains('fade-in-left')) {
                el.classList.add('fade-in-left');
                el.classList.add(`delay-${(index % 4) + 1}`);
            }
        });

        const animatedElements = document.querySelectorAll('.fade-in-left');
        if (animatedElements.length === 0) return;

        if ('IntersectionObserver' in window) {
            const appearObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                rootMargin: ANIM_CONFIG.scrollRootMargin,
                threshold: ANIM_CONFIG.scrollThreshold
            });

            animatedElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                // Si l'élément est déjà visible dans la portion haute de l'écran
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('is-visible');
                } else {
                    appearObserver.observe(el);
                }
            });
        } else {
            // Fallback sans IntersectionObserver
            animatedElements.forEach(el => el.classList.add('is-visible'));
        }
    }
}

// Lancement garanti quel que soit l'état du document
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
