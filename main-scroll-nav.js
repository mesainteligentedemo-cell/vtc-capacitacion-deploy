// VTC Capacitación - Main Navigation Controller
// GSAP + ScrollTrigger + ElevenLabs Agent Integration

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
    moduleCount: 16,
    elevenLabsAgentId: 'agent_5701kr0h5gg6eetb69tv6c5hwfj1',
    scrollSpeed: 1.2,
    transitionDuration: 0.8,
    lockDelay: 200
};

// STATE MANAGEMENT
const state = {
    currentModuleIndex: 0,
    completedModules: new Set(),
    isScrolling: false,
    lastScrollTime: 0,
    scrollLocked: false,
    moduleSequence: ['hero', 'temario', 'f', 'o', 'd', 'i', 'a', 't', 'c', 'v', 'e1', 'e2', 'p1', 'p2', 'm1', 'm2', 'r', 'f2']
};

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeModuleCards();
    initializeScrollHandler();
    initializeQuizButtons();
    initializeNextButtons();
    updateBreadcrumb();
});

/* =============================================
   NAVIGATION INITIALIZATION
   ============================================= */

function initializeNavigation() {
    const container = document.querySelector('.scroll-container');

    // Smooth scroll behavior
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNav);

    // Mouse wheel scroll control
    container.addEventListener('wheel', handleWheelScroll, { passive: false });
}

/* =============================================
   SCROLL HANDLING WITH AXIS LOCKING
   ============================================= */

function handleScroll(e) {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const moduleWidth = window.innerWidth;
    const newIndex = Math.round(scrollLeft / moduleWidth);

    if (newIndex !== state.currentModuleIndex) {
        state.currentModuleIndex = newIndex;
        updateBreadcrumb();
        updateProgress();
        triggerModuleEnter();
    }
}

function handleWheelScroll(e) {
    // Prevent default vertical scroll, convert to horizontal
    if (state.scrollLocked) {
        e.preventDefault();
        return;
    }

    const container = document.querySelector('.scroll-container');
    const currentModule = state.moduleSequence[state.currentModuleIndex];

    // Hero section: block vertical scrolling
    if (currentModule === 'hero') {
        if (e.deltaY !== 0) {
            e.preventDefault();
        }
    }

    // Other modules: allow vertical within module, horizontal between modules
    if (e.deltaX === 0) {
        const currentScroll = container.scrollLeft;
        const moduleIndex = state.currentModuleIndex;

        // Scroll horizontally instead of vertically
        if (e.deltaY > 0) {
            container.scrollLeft += 100;
        } else {
            container.scrollLeft -= 100;
        }

        // Don't prevent default for content modules (allow internal vertical scroll)
        if (currentModule === 'hero' || currentModule === 'temario') {
            e.preventDefault();
        }
    }
}

function handleKeyboardNav(e) {
    const container = document.querySelector('.scroll-container');
    const moduleWidth = window.innerWidth;

    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            smoothScroll(container.scrollLeft + moduleWidth);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            smoothScroll(container.scrollLeft - moduleWidth);
            break;
        case 'ArrowDown':
            // Allow natural vertical scroll within modules
            break;
        case 'ArrowUp':
            // Allow natural vertical scroll within modules
            break;
    }
}

function smoothScroll(targetScroll) {
    const container = document.querySelector('.scroll-container');
    gsap.to(container, {
        scrollLeft: targetScroll,
        duration: CONFIG.transitionDuration,
        ease: 'power2.inOut'
    });
}

/* =============================================
   MODULE CARDS & GRID
   ============================================= */

function initializeModuleCards() {
    const grid = document.getElementById('modules-grid');
    const modules = ['F', 'O', 'D', 'I', 'A', 'T', 'C', 'V', 'E1', 'E2', 'P1', 'P2', 'M1', 'M2', 'R', 'F2'];

    modules.forEach((mod, idx) => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.dataset.module = mod.toLowerCase();
        card.dataset.index = idx + 2; // +2 because hero=0, temario=1

        card.innerHTML = `
            <div class="module-card-number">${String(idx + 1).padStart(2, '0')}</div>
            <div class="module-card-title">Módulo ${mod}</div>
        `;

        card.addEventListener('click', () => navigateToModule(idx + 2));
        grid.appendChild(card);
    });
}

function navigateToModule(moduleIndex) {
    const targetScroll = moduleIndex * window.innerWidth;
    smoothScroll(targetScroll);
}

/* =============================================
   BREADCRUMB & PROGRESS
   ============================================= */

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb-text');
    const currentModule = state.moduleSequence[state.currentModuleIndex];

    const labels = {
        'hero': 'Inicio',
        'temario': 'Temario',
        'f': 'Módulo 01 - Fundamentos',
        'o': 'Módulo 02 - Operativa',
        'd': 'Módulo 03 - Digital',
        'i': 'Módulo 04 - Innovación',
        'a': 'Módulo 05 - Análisis',
        't': 'Módulo 06 - Talento',
        'c': 'Módulo 07 - Crecimiento',
        'v': 'Módulo 08 - Visión',
        'e1': 'Módulo 09 - Especialización I',
        'e2': 'Módulo 10 - Especialización II',
        'p1': 'Módulo 11 - Proyecto I',
        'p2': 'Módulo 12 - Proyecto II',
        'm1': 'Módulo 13 - Mentoría I',
        'm2': 'Módulo 14 - Mentoría II',
        'r': 'Módulo 15 - Recapitulación',
        'f2': 'Módulo 16 - Certificación'
    };

    breadcrumb.textContent = labels[currentModule] || 'VTC Capacitación';
    breadcrumb.style.animation = 'none';
    setTimeout(() => {
        breadcrumb.style.animation = '';
    }, 10);
}

function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const moduleIndex = state.currentModuleIndex;

    // Count only actual modules (skip hero=0 and temario=1)
    const modulesCompleted = Array.from(state.completedModules).filter(m => m > 1).length;

    progressText.textContent = `${modulesCompleted}/16`;
}

/* =============================================
   MODULE LIFECYCLE
   ============================================= */

function triggerModuleEnter() {
    const currentModule = state.moduleSequence[state.currentModuleIndex];
    const moduleElement = document.getElementById(`modulo-${currentModule}`) || document.getElementById(currentModule);

    if (!moduleElement) return;

    // Trigger enter animation
    gsap.fromTo(moduleElement,
        { opacity: 0.8 },
        { opacity: 1, duration: 0.3 }
    );

    // Preload next video
    preloadNextVideo();

    // Auto-read content (accessibility + ElevenLabs integration)
    if (currentModule !== 'hero' && currentModule !== 'temario') {
        readModuleContent(currentModule);
    }
}

function preloadNextVideo() {
    const nextIndex = state.currentModuleIndex + 1;
    if (nextIndex < state.moduleSequence.length) {
        const nextModule = state.moduleSequence[nextIndex];
        const video = document.querySelector(`#modulo-${nextModule} .module-video`) ||
                      document.querySelector(`#${nextModule} .module-video`);

        if (video && video.src) {
            // Preload video
            fetch(video.src, { method: 'HEAD' }).catch(() => {});
        }
    }
}

/* =============================================
   QUIZ HANDLER & COMPLETION
   ============================================= */

function initializeQuizButtons() {
    document.querySelectorAll('.quiz-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const module = btn.dataset.module;
            handleQuizClick(module, e.target);
        });
    });
}

function handleQuizClick(module, buttonElement) {
    // Show quiz UI (simplified - would integrate with your LMS)
    buttonElement.disabled = true;
    buttonElement.textContent = 'Cargando cuestionario...';

    // Simulate quiz duration
    setTimeout(() => {
        // Mark module as completed
        markModuleCompleted(module);

        // Update button
        buttonElement.textContent = 'Quiz Completado ✓';
        buttonElement.style.background = 'var(--color-success)';
        buttonElement.style.pointerEvents = 'none';

        // Call ElevenLabs Agent for feedback
        callElevenLabsAgent(`El usuario completó el quiz del módulo ${module}. Proporciona retroalimentación motivadora y próximos pasos.`);

        updateProgress();
    }, 2000);
}

function markModuleCompleted(module) {
    const moduleIndex = state.moduleSequence.indexOf(module);
    if (moduleIndex !== -1) {
        state.completedModules.add(moduleIndex);

        // Update card UI
        const card = document.querySelector(`[data-module="${module}"]`);
        if (card) {
            card.classList.add('completed');
        }
    }

    // Save to localStorage
    localStorage.setItem('vtc-completed', JSON.stringify(Array.from(state.completedModules)));
}

/* =============================================
   NEXT BUTTON NAVIGATION
   ============================================= */

function initializeNextButtons() {
    document.querySelectorAll('.cta-next').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            const currentIndex = state.currentModuleIndex;
            const nextIndex = currentIndex + 1;

            if (nextIndex < state.moduleSequence.length) {
                // Check if current module is completed (optional requirement)
                if (currentIndex > 1) { // Skip hero and temario
                    if (!state.completedModules.has(currentIndex)) {
                        alert('Por favor, completa el quiz antes de continuar.');
                        return;
                    }
                }

                navigateToModule(nextIndex);
            }
        });
    });

    // Hero CTA
    const heroCta = document.getElementById('hero-cta');
    if (heroCta) {
        heroCta.addEventListener('click', () => navigateToModule(1)); // Go to temario
    }

    // Certificate Button
    const certBtn = document.getElementById('certificate-btn');
    if (certBtn) {
        certBtn.addEventListener('click', () => {
            downloadCertificate();
        });
    }
}

function downloadCertificate() {
    const completedCount = Array.from(state.completedModules).filter(m => m > 1).length;

    if (completedCount < 16) {
        alert(`Has completado ${completedCount}/16 módulos. Completa todos para descargar el certificado.`);
        return;
    }

    // Create and download certificate
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Simple certificate design
    ctx.fillStyle = '#EAE6DF';
    ctx.fillRect(0, 0, 1200, 800);

    ctx.strokeStyle = '#B89A6A';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, 1120, 720);

    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#070708';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE FINALIZACIÓN', 600, 150);

    ctx.font = '32px Arial';
    ctx.fillStyle = '#B89A6A';
    ctx.fillText('VTC Capacitación - Programa Integral', 600, 250);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#070708';
    ctx.fillText(`Completado el ${new Date().toLocaleDateString('es-MX')}`, 600, 600);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'VTC_Certificado.png';
    link.click();

    callElevenLabsAgent('El usuario descargó su certificado de finalización. Felicítalo y ofrecele los próximos pasos en su formación continua.');
}

/* =============================================
   ACCESSIBILITY & CONTENT READING
   ============================================= */

function readModuleContent(module) {
    const moduleElement = document.getElementById(`modulo-${module}`) || document.getElementById(module);
    if (!moduleElement) return;

    // Extract text content
    const title = moduleElement.querySelector('.module-title')?.textContent || '';
    const content = moduleElement.querySelector('.module-content-wrapper')?.textContent || '';

    if (title && content) {
        callElevenLabsAgent(`Acaba de entrar al módulo: ${title}. ${content}. Guía al usuario a través de este contenido.`);
    }
}

/* =============================================
   ELEVENLABS AGENT INTEGRATION
   ============================================= */

function callElevenLabsAgent(userMessage) {
    // Production implementation with ElevenLabs Convai API
    // This is a placeholder - requires websocket connection

    console.log('ElevenLabs Agent Message:', userMessage);

    // Send to backend or directly to ElevenLabs API
    fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agentId: CONFIG.elevenLabsAgentId,
            message: userMessage,
            userId: getUserId()
        })
    }).catch(err => console.warn('Agent unavailable:', err));
}

function getUserId() {
    let userId = localStorage.getItem('vtc-user-id');
    if (!userId) {
        userId = 'user_' + Date.now();
        localStorage.setItem('vtc-user-id', userId);
    }
    return userId;
}

/* =============================================
   SCROLL ANIMATION WITH GSAP
   ============================================= */

function initializeScrollAnimations() {
    // Hero title animation
    gsap.fromTo('.hero-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'back.out' }
    );

    // Module cards stagger animation on temario view
    gsap.fromTo('.module-card',
        { opacity: 0, y: 10 },
        {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out',
            stagger: 0.05,
            scrollTrigger: {
                trigger: '.module-index',
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        }
    );
}

// Initialize animations after DOM ready
window.addEventListener('load', initializeScrollAnimations);

/* =============================================
   PERSISTENCE & RECOVERY
   ============================================= */

function loadSessionState() {
    const saved = localStorage.getItem('vtc-session');
    if (saved) {
        try {
            const session = JSON.parse(saved);
            state.completedModules = new Set(session.completed);
            state.currentModuleIndex = session.lastModule || 0;

            // Restore UI state
            state.completedModules.forEach(moduleIdx => {
                const module = state.moduleSequence[moduleIdx];
                const card = document.querySelector(`[data-module="${module}"]`);
                if (card) card.classList.add('completed');
            });
        } catch(e) {
            console.warn('Could not restore session:', e);
        }
    }
}

function saveSessionState() {
    localStorage.setItem('vtc-session', JSON.stringify({
        completed: Array.from(state.completedModules),
        lastModule: state.currentModuleIndex,
        timestamp: Date.now()
    }));
}

// Save state before unload
window.addEventListener('beforeunload', saveSessionState);

// Load on init
loadSessionState();

/* =============================================
   RESPONSIVE VIEWPORT HANDLING
   ============================================= */

function handleViewportChange() {
    const container = document.querySelector('.scroll-container');
    const currentScroll = container.scrollLeft;
    const targetScroll = state.currentModuleIndex * window.innerWidth;

    if (Math.abs(currentScroll - targetScroll) > 10) {
        smoothScroll(targetScroll);
    }
}

window.addEventListener('resize', handleViewportChange);

/* =============================================
   DEBUGGING & MONITORING (optional)
   ============================================= */

if (window.location.hash === '#debug') {
    window.vtcDebug = {
        state,
        smoothScroll,
        navigateToModule,
        callElevenLabsAgent,
        markModuleCompleted
    };
    console.log('VTC Debug mode enabled. Access via window.vtcDebug');
}
