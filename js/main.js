// Main JavaScript for Desa Clekatakan Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all core components
    initializeNavigation();
    initializeAnimations();
    initializeCounters();
    initializeLazyLoading();
    initializeResponsiveElements();
    initializeModal();
    
    // Log pesan untuk memastikan skrip berhasil dimuat
    console.log('Desa Clekatakan website loaded successfully');
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Determine current page filename for active link highlighting
    const pathSegments = window.location.pathname.split('/');
    let currentPage = pathSegments.pop() || 'index.html'; 
    if (currentPage === '' || currentPage.endsWith('/')) { 
        currentPage = 'index.html';
    }

    // Set active navigation item based on current page
    navLinks.forEach(link => {
        const linkHrefSegments = link.getAttribute('href').split('/');
        const linkFilename = linkHrefSegments.pop() || 'index.html';

        if (linkFilename === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }

        // Smooth scroll for anchor links
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname && this.pathname === window.location.pathname && this.hash.length > 0) {
                e.preventDefault();
                const targetId = this.hash.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // Close mobile nav after click
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                document.body.classList.remove('no-scroll'); 
            }
        });
    });
}

// Animation on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                if (entry.target.classList.contains('progress')) {
                    const classes = Array.from(entry.target.classList);
                    const widthClass = classes.find(cls => cls.startsWith('width-'));
                    if (widthClass) {
                        const targetWidth = widthClass.split('-')[1] + '%';
                        entry.target.style.width = targetWidth;
                    }
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Counter animations
function initializeCounters() {
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    const counterElements = document.querySelectorAll('.demo-number, .stat-value');
    counterElements.forEach(el => {
        observer.observe(el);
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = duration / frameDuration;
    let currentFrame = 0;
    const initialValue = 0;

    const animateStep = () => {
        currentFrame++;
        const progress = currentFrame / totalFrames;
        const easedProgress = t => t * (2 - t);
        const currentValue = initialValue + (target - initialValue) * easedProgress(progress);
        
        element.textContent = Math.floor(currentValue).toLocaleString('id-ID');

        if (currentFrame < totalFrames) {
            requestAnimationFrame(animateStep);
        } else {
            element.textContent = target.toLocaleString('id-ID');
        }
    };
    requestAnimationFrame(animateStep);
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Responsive elements handling
function initializeResponsiveElements() {
    setupHamburgerMenu();
    
    window.addEventListener('resize', debounce(function() {
        if (window.innerWidth > 768) {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }, 250));
}

// Hamburger Menu setup
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) {
        console.warn("Hamburger or navigation menu element not found. Mobile menu functionality will not be initialized.");
        return;
    }

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
        document.body.classList.toggle('no-scroll', navMenu.classList.contains('active'));
    });
}

// Modal Functionality
function initializeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (modalBackdrop && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalBackdrop.style.display === 'flex') {
                closeModal();
            }
        });
    } else {
        console.warn("Modal elements (backdrop or close button) not found. Modal functionality might be limited on this page.");
    }
}

function showModal(title, bodyHtml) {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (modalBackdrop && modalTitle && modalBody) {
        modalTitle.innerHTML = title;
        modalBody.innerHTML = bodyHtml;
        modalBackdrop.style.display = 'flex';
        document.body.classList.add('no-scroll');
    } else {
        console.error("Failed to show modal: one or more modal elements are missing.");
    }
}

function closeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}