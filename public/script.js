// ============================================
// HOMEBOSS - INTERACTIVE JAVASCRIPT
// ============================================

// === REAL VISITOR COUNTER (MONGODB + GEO LOCATION) ===
async function initVisitorCounter() {
    const counterElement = document.getElementById('visitor-count');
    if (!counterElement) return;

    try {
        // Track visitor only once per 30 days via server-side cookie
        const trackResponse = await fetch('/api/track-visit', { method: 'POST' });
        const trackData = await trackResponse.json();
        if (!trackData.success && trackData.message !== "Visitor already counted") {
            console.warn('Visitor tracking response:', trackData);
        }

        // Fetch total visitors + area analytics
        const response = await fetch('/api/visitors');
        const data = await response.json();

        // Animate the visitor count
        let current = 0;
        const target = data.total || 0;
        const increment = Math.ceil(target / 60);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counterElement.textContent = current.toLocaleString();
        }, 30);

        console.log('🌍 Visitor Analytics:', data.areas);
    } catch (error) {
        console.error('Visitor tracking failed:', error);
    }
}

// === MOBILE MENU TOGGLE ===
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// === SMOOTH SCROLLING ===
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#contact') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// === SCROLL REVEAL ANIMATION ===
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
    revealOnScroll();
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(revealOnScroll);
    });
}

// === NAVBAR SCROLL EFFECT ===
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 50
            ? '0 4px 20px rgba(0, 123, 255, 0.3)'
            : 'none';
    });
}

// === FORM HANDLING (No Redirect) ===
function initFormHandling() {
    const form = document.getElementById('waitlist-form');
    if (!form) return;

    const successMessage = document.getElementById('success-message');
    const submitButton = form.querySelector('.btn-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent redirect to Formspree
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (response.ok) {
                form.reset();
                form.style.display = 'none';
                if (successMessage) successMessage.style.display = 'block';
            } else {
                alert('⚠️ Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            alert('❌ Failed to send message. Check your internet connection.');
        } finally {
            submitButton.textContent = 'Join Waitlist';
            submitButton.disabled = false;
        }
    });
}


// === FORM ROLE-BASED ROUTING ===
function initFormRouting() {
    const form = document.getElementById('waitlist-form');
    const roleSelect = form?.querySelector('select[name="role"]');
    if (!form || !roleSelect) return;

    roleSelect.addEventListener('change', (e) => {
        form.action = e.target.value === 'investor'
            ? 'https://formspree.io/f/manawern'
            : 'https://formspree.io/f/manawern';
    });
}

// === DEMO VIDEO PLACEHOLDER INTERACTION ===
function initDemoVideo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (!videoPlaceholder) return;

    videoPlaceholder.addEventListener('click', () => {
        const playButton = videoPlaceholder.querySelector('.play-button');
        playButton.style.transform = 'scale(1.2)';
        setTimeout(() => playButton.style.transform = 'scale(1)', 200);
        alert('Demo video coming soon! Stay tuned.');
    });

    videoPlaceholder.style.cursor = 'pointer';
    videoPlaceholder.addEventListener('mouseenter', () => {
        videoPlaceholder.style.transform = 'scale(1.02)';
        videoPlaceholder.style.transition = 'transform 0.3s ease';
    });
    videoPlaceholder.addEventListener('mouseleave', () => {
        videoPlaceholder.style.transform = 'scale(1)';
    });
}

// === PARALLAX EFFECT FOR HERO ===
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;

    window.addEventListener('scroll', () => {
        heroBackground.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
    });
}

// === ANALYTICS TRACKING ===
function initAnalytics() {
    const pageView = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    console.log('Page View:', pageView);

    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('Button Click:', {
                element: 'button',
                text: e.target.textContent,
                timestamp: new Date().toISOString()
            });
        });
    });
}

// === INITIALIZE ALL FUNCTIONS ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 HomeBoss Website Initialized');
    initVisitorCounter();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initNavbarScroll();
    initFormHandling();
    initFormRouting();
    initDemoVideo();
    initParallax();
    initAnalytics();
});

// === PERFORMANCE OPTIMIZATION ===
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) img.src = img.dataset.src;
                img.classList.add('loaded');
                obs.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

// === EASTER EGG ===
let konamiCode = [];
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🎉 Easter egg activated! You found the HomeBoss secret! 🏠');
        }, 2000);
    }
});

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}`;
document.head.appendChild(style);

