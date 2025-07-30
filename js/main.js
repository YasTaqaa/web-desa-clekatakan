// Main JavaScript for Desa Clekatakan Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all core components
    initializeNavigation();
    initializeAnimations();
    initializeProgressBars();
    initializeCounters();
    initializeLazyLoading();
    initializeResponsiveElements(); // This now contains hamburger logic
    initializeModal(); // Always initialize modal, its display is handled by JS functions

    // Conditionally initialize map functionality only if the map element exists
    const villageMapElement = document.getElementById('village-map');
    if (villageMapElement) {
        initializeMap();
    } else {
        // If Google Maps API script is included on non-map pages, this prevents warnings.
        // It's better to only include the script on pages where it's needed.
        if (typeof google === 'object' && typeof google.maps === 'object') {
            console.warn("Google Maps API script included but #village-map element not found. It should be removed from this page's HTML if not used.");
        }
    }
    
    console.log('Desa Clekatakan website loaded successfully');
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Determine current page filename for active link highlighting
    const pathSegments = window.location.pathname.split('/');
    // Get the last segment, handle cases like "index.html" or "/"
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

        // Smooth scroll for anchor links (if any, on the same page)
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
            // Close mobile nav after click on any link (internal or external)
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                document.body.classList.remove('no-scroll'); 
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.nav');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(52, 73, 94, 0.98)';
                navbar.style.backdropFilter = 'blur(15px)';
            } else {
                navbar.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        });
    }
}

// Animation on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1, // Element is 10% visible
        rootMargin: '0px 0px -50px 0px' // Start animation 50px before element enters viewport bottom
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Trigger counter animation if element has counter
                if (entry.target.classList.contains('stat-number') || 
                    entry.target.classList.contains('demo-number')) {
                    animateCounter(entry.target);
                }
                // Trigger progress bar animation
                if (entry.target.classList.contains('progress')) {
                    const classes = Array.from(entry.target.classList);
                    const widthClass = classes.find(cls => cls.startsWith('width-'));
                    if (widthClass) {
                        const targetWidth = widthClass.split('-')[1] + '%';
                        entry.target.style.width = targetWidth; 
                    }
                }
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);
    
    // Observe all elements that should animate on scroll across the document
    const animateElements = document.querySelectorAll('.animate-on-scroll'); 
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Directly trigger animations for elements that are already in the viewport on page load.
    // This is especially important for the first section of any page (e.g., index.html, profil.html).
    // A slight delay might be added to ensure the browser has rendered elements before animating.
    setTimeout(() => {
        const initialElements = document.querySelectorAll('.animate-on-scroll');
        initialElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Check if the element is within the current viewport (or slightly above/below due to rootMargin)
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Manually apply 'animate-in' class
                el.classList.add('animate-in');
                // If it's a counter, animate it
                if (el.classList.contains('stat-number') || el.classList.contains('demo-number')) {
                    animateCounter(el);
                }
                // If it's a progress bar, set its width
                if (el.classList.contains('progress')) {
                    const classes = Array.from(el.classList);
                    const widthClass = classes.find(cls => cls.startsWith('width-'));
                    if (widthClass) {
                        const targetWidth = widthClass.split('-')[1] + '%';
                        el.style.width = targetWidth; 
                    }
                }
            }
        });
    }, 100); // Small delay to ensure initial rendering is complete
    

    // Ensure that direct children of .section.active that are NOT animate-on-scroll are visible
    // This applies to elements like section-title or static paragraphs that don't have animation but should be seen.
    const directVisibleElements = document.querySelectorAll('.section.active > *:not(.animate-on-scroll)');
    directVisibleElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// Progress bar animations (called by initializeAnimations when visible)
function initializeProgressBars() {
    // Logic for progress bars is now primarily handled by initializeAnimations
}

// Counter animations (called by initializeAnimations when visible)
function initializeCounters() {
    window.animateCounter = function(element) {
        if (element.dataset.animated) {
            return;
        }

        const target = parseInt(element.textContent.replace(/[^\d]/g, '')); 
        const duration = 2000; 
        const frameDuration = 1000 / 60;
        const totalFrames = duration / frameDuration;
        let currentFrame = 0;
        const initialValue = 0; 

        const animateStep = () => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            const easedProgress = easeOutQuad(progress); 
            const currentValue = initialValue + (target - initialValue) * easedProgress;
            
            element.textContent = Math.floor(currentValue).toLocaleString('id-ID'); 

            if (currentFrame < totalFrames) {
                requestAnimationFrame(animateStep);
            } else {
                element.textContent = target.toLocaleString('id-ID'); 
                element.dataset.animated = 'true'; 
            }
        };

        requestAnimationFrame(animateStep);
    };

    // Easing function (Quadratic Ease Out)
    function easeOutQuad(t) {
        return t * (2 - t);
    }
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
    // Handle responsive tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.closest('.table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-responsive');
            if (table.parentNode) {
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        }
    });
    
    // Call the dedicated hamburger setup
    setupHamburgerMenu(); 
    
    // Handle window resize event with debounce for performance
    window.addEventListener('resize', debounce(function() {
        adjustElementSizes();
        if (window.innerWidth > 768) { 
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }, 250));
    
    // Initial adjustment for element sizes on load
    adjustElementSizes();
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

function adjustElementSizes() {
    const grids = document.querySelectorAll(
        '.geographic-info, .demographic-grid, .stats-grid, .objectives-grid, ' +
        '.figures-grid, .culture-grid, .development-cards, .map-info-grid, ' +
        '.regions-grid, .facilities-grid, .topo-grid, .potensi-wisata-grid, .livelihood-stats, .indicators-grid, .village-stats' 
    );

    grids.forEach(grid => {
        // Reset grid columns first to ensure media queries take precedence
        grid.style.gridTemplateColumns = ''; 

        // Specific grid layouts for smaller screens handled by JS if CSS can't alone
        if (window.innerWidth <= 768) {
            // These elements explicitly force 1 column on tablets and smaller
            if (grid.classList.contains('profile-hero') || 
                grid.classList.contains('profile-main') || 
                grid.classList.contains('history-hero') || 
                grid.classList.contains('origin-content')) 
            {
                grid.style.gridTemplateColumns = '1fr'; 
            }
            // For .row-potensi-alam, we handle it with flex-direction column in CSS media query
            // So no direct grid-template-columns manipulation here for that specific class.
        }
    });

    // Timeline specific class handling for mobile (flex-direction changes)
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        if (window.innerWidth <= 768) {
            timeline.classList.add('mobile-timeline');
        } else {
            timeline.classList.remove('mobile-timeline');
        }
    }

    // Ensure .row-potensi-alam children adjust correctly
    const rowsPotensiAlam = document.querySelectorAll('.row-potensi-alam');
    rowsPotensiAlam.forEach(row => {
        // The flexbox properties are now primarily managed by CSS media queries.
        // We only need to ensure the parent is set to flex for the CSS to apply.
        row.style.display = 'flex';
        // The children's flex-basis and max-width are managed in style.css directly via .col-md-6 or similar.
    });
}


// Utility functions (debounce, throttle, error handling, performance monitoring)
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.addEventListener('error', function(e) {
    console.error('Unhandled JavaScript Error:', e.error || e.message || e);
});

if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType("navigation")[0];
            if (perfData) {
                const pageLoadTime = perfData.loadEventEnd - perfData.startTime;
                console.log(`Page load time: ${pageLoadTime.toFixed(2)}ms`);
            } else {
                console.log("Performance navigation timing not available.");
            }
        }, 0);
    });
}

// Map Functionality
function initializeMap() {
    const mapContainer = document.getElementById('village-map');
    if (!mapContainer) {
        console.warn("Map container with ID 'village-map' not found. Map functionality not initialized.");
        return;
    }
    
    mapContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('map-placeholder')) {
            showMapInfo(e);
        }
    });
    
    initializeMapMarkers();
}

function initializeMapMarkers() {
    const markers = document.querySelectorAll('.map-marker');
    if (markers.length === 0) {
        console.info("No map markers found on this page.");
        return;
    }

    markers.forEach(marker => {
        marker.addEventListener('click', function(e) {
            e.stopPropagation();
            showMarkerDetails(this);
        });
        
        marker.addEventListener('mouseenter', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1.2)';
            this.style.zIndex = '1000';
        });
        
        marker.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1)';
            this.style.zIndex = '10';
        });
        
        marker.setAttribute('tabindex', '0');
        marker.setAttribute('role', 'button');
        marker.setAttribute('aria-label', marker.dataset.info || 'Map location');
        
        marker.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showMarkerDetails(this);
            }
        });
    });
}

function showMarkerDetails(markerElement) {
    const info = markerElement.dataset.info;
    const markerClasses = Array.from(markerElement.classList);
    let detailsHTML = '';
    let title = 'Informasi Lokasi';

    if (markerClasses.includes('marker-village')) {
        title = 'Kantor Desa Clekatakan';
        detailsHTML = `
            <h4><i class="fas fa-home"></i> Kantor Desa Clekatakan</h4>
            <p><strong>Alamat:</strong> Jl. Raya Clekatakan No. 1</p>
            <p><strong>Jam Operasional:</strong> Senin-Jumat 08:00-16:00</p>
            <p><strong>Kepala Desa:</strong> Bapak Sukarno, S.Pd</p>
            <p><strong>Telepon:</strong> (0287) 471234</p>
            <p><strong>Fasilitas:</strong> Ruang pelayanan, Aula, Parkir</p>
        `;
    } else if (markerClasses.includes('marker-school')) {
        title = 'SD Negeri Clekatakan';
        detailsHTML = `
            <h4><i class="fas fa-school"></i> SD Negeri Clekatakan</h4>
            <p><strong>Status:</strong> Sekolah Negeri</p>
            <p><strong>Jumlah Siswa:</strong> 245 siswa</p>
            <p><strong>Jumlah Guru:</strong> 12 guru</p>
            <p><strong>Akreditasi:</strong> A</p>
            <p><strong>Fasilitas:</strong> 12 ruang kelas, perpustakaan, lab komputer</p>
        `;
    } else if (markerClasses.includes('marker-health')) {
        title = 'Puskesmas Pembantu';
        detailsHTML = `
            <h4><i class="fas fa-clinic-medical"></i> Puskesmas Pembantu</h4>
            <p><strong>Layanan:</strong> Kesehatan umum, KIA, Imunisasi</p>
            <p><strong>Jam Buka:</strong> Senin-Sabtu 08:00-15:00</p>
            <p><strong>Tenaga Medis:</strong> 1 Dokter, 2 Perawat, 1 Bidan</p>
            <p><strong>Fasilitas:</strong> Ruang periksa, apotek, ambulans</p>
        `;
    } else if (markerClasses.includes('marker-mosque')) {
        title = 'Masjid Jami\' Al-Ikhlas';
        detailsHTML = `
            <h4><i class="fas fa-mosque"></i> Masjid Jami' Al-Ikhlas</h4>
            <p><strong>Kapasitas:</strong> 500 jamaah</p>
            <p><strong>Kegiatan:</strong> Sholat 5 waktu, Jumat, Pengajian</p>
            <p><strong>Fasilitas:</strong> Tempat wudhu, perpustakaan, aula</p>
            <p><strong>Imam:</strong> KH. Ahmad Dahlan</p>
        `;
    } else if (markerClasses.includes('marker-market')) {
        title = 'Pasar Desa Clekatakan';
        detailsHTML = `
            <h4><i class="fas fa-store"></i> Pasar Desa Clekatakan</h4>
            <p><strong>Hari Pasar:</strong> Setiap hari (puncak: Selasa & Jumat)</p>
            <p><strong>Jumlah Kios:</strong> 45 kios</p>
            <p><strong>Komoditas:</strong> Sayur, buah, kebutuhan sehari-hari</p>
            <p><strong>Jam Buka:</strong> 05:00 - 17:00</p>
        `;
    } else {
        detailsHTML = `<h4>${info || 'Lokasi Tidak Dikenal'}</h4><p>Informasi detail tidak tersedia.</p>`;
    }
    
    showModal(title, detailsHTML);
}

function showMapInfo(event) {
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const infoHTML = `
        <p>Anda mengklik di koordinat relatif peta: X ${x.toFixed(2)}%, Y ${y.toFixed(2)}%.</p>
        <p>Gunakan marker yang tersedia untuk detail lokasi spesifik.</p>
    `;
    showModal('Informasi Peta Umum', infoHTML);
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