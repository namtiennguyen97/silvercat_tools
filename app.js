/**
 * ==========================================================================
 * INTERACTIVE LOGIC - MICRO-SAAS HUB (GLASSMORPHISM DARK THEME)
 * ==========================================================================
 */

// Hide loading screen as soon as possible
(function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    function hideLoading() {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hideLoading();
    } else {
        document.addEventListener('DOMContentLoaded', hideLoading);
    }

    setTimeout(hideLoading, 3000);
})();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Card Glow Mouse Spot Effect
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Dynamic Search & Category Filter
    const searchInput = document.getElementById('search-input');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const toolsGrid = document.getElementById('tools-grid');
    const noResults = document.getElementById('no-results');
    
    let activeCategory = 'all';
    let searchQuery = '';

    function filterTools() {
        let visibleCount = 0;
        const query = searchQuery.toLowerCase().trim();

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const tags = card.getAttribute('data-tags') ? card.getAttribute('data-tags').toLowerCase() : '';
            
            const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
            const matchesSearch = title.includes(query) || desc.includes(query) || tags.includes(query);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            noResults.style.display = 'block';
            toolsGrid.style.gridTemplateColumns = '1fr';
        } else {
            noResults.style.display = 'none';
            toolsGrid.style.removeProperty('grid-template-columns');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterTools();
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.getAttribute('data-category');
            filterTools();
        });
    });

    // 4. Interactive Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // 5. Typing Suggestion Animation inside Placeholder (Enhancement)
    const suggestionsDict = {
        vi: ['nén ảnh', 'chuyển pdf sang word', 'tạo mã qr', 'tải video tiktok', 'đếm từ', 'biên soạn markdown'],
        en: ['compress image', 'pdf to word', 'qr generator', 'tiktok downloader', 'word counter', 'markdown editor']
    };
    const prefixDict = {
        vi: 'Tìm kiếm công cụ (ví dụ: "',
        en: 'Search tools (e.g., "'
    };
    const suffixDict = { vi: '")', en: '")' };
    const focusDict = {
        vi: 'Nhập tên công cụ bạn cần tìm... (Nhấn "/" để tìm nhanh)',
        en: 'Type tool name... (Press "/" to quick search)'
    };
    const blurDict = {
        vi: 'Tìm kiếm công cụ...',
        en: 'Search tools...'
    };

    let currentAppLang = localStorage.getItem('preferred-lang') || 'vi';
    window.addEventListener('languageChanged', (e) => {
        if (e.detail && e.detail.lang) {
            currentAppLang = e.detail.lang;
        } else {
            currentAppLang = localStorage.getItem('preferred-lang') || 'vi';
        }
        if (!searchInput) return;
        if (document.activeElement === searchInput) {
            searchInput.placeholder = focusDict[currentAppLang];
        } else if (searchInput.value !== '') {
            searchInput.placeholder = blurDict[currentAppLang];
        }
    });

    let suggestionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer;

    function typePlaceholder() {
        if (!searchInput) return;
        if (document.activeElement === searchInput) return;

        const suggestions = suggestionsDict[currentAppLang];
        if (suggestionIndex >= suggestions.length) suggestionIndex = 0;
        
        const currentText = suggestions[suggestionIndex];
        const prefix = prefixDict[currentAppLang];
        const suffix = suffixDict[currentAppLang];
        
        if (isDeleting) {
            searchInput.placeholder = prefix + currentText.substring(0, charIndex) + suffix;
            charIndex--;
        } else {
            searchInput.placeholder = prefix + currentText.substring(0, charIndex) + suffix;
            charIndex++;
        }

        let typingSpeed = 100;
        if (isDeleting) typingSpeed /= 2;

        if (!isDeleting && charIndex === currentText.length + 1) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            suggestionIndex = (suggestionIndex + 1) % suggestions.length;
            typingSpeed = 500;
        }

        typingTimer = setTimeout(typePlaceholder, typingSpeed);
    }

    typePlaceholder();

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            clearTimeout(typingTimer);
            searchInput.placeholder = focusDict[currentAppLang];
        });

        searchInput.addEventListener('blur', () => {
            if (searchInput.value === '') {
                charIndex = 0;
                isDeleting = false;
                typePlaceholder();
            } else {
                searchInput.placeholder = blurDict[currentAppLang];
            }
        });
    }

    // 6. Mobile Categories Scroll Indicator Fades & Scroll Hint Bounce
    const categoriesWrapper = document.querySelector('.categories-wrapper');
    const categoriesContainer = document.getElementById('categories-container');

    if (categoriesWrapper && categoriesContainer) {
        const fadeLeft = document.createElement('div');
        fadeLeft.className = 'categories-fade-left';
        const fadeRight = document.createElement('div');
        fadeRight.className = 'categories-fade-right';
        
        categoriesWrapper.appendChild(fadeLeft);
        categoriesWrapper.appendChild(fadeRight);

        const checkOverflowAndScroll = () => {
            const scrollLeft = categoriesContainer.scrollLeft;
            const scrollWidth = categoriesContainer.scrollWidth;
            const clientWidth = categoriesContainer.clientWidth;

            if (scrollWidth > clientWidth) {
                if (scrollLeft > 5) categoriesWrapper.classList.add('is-overflowing-left');
                else categoriesWrapper.classList.remove('is-overflowing-left');
                if (scrollLeft + clientWidth < scrollWidth - 5) categoriesWrapper.classList.add('is-overflowing-right');
                else categoriesWrapper.classList.remove('is-overflowing-right');
            } else {
                categoriesWrapper.classList.remove('is-overflowing-left', 'is-overflowing-right');
            }
        };

        checkOverflowAndScroll();
        categoriesContainer.addEventListener('scroll', checkOverflowAndScroll);
        window.addEventListener('resize', checkOverflowAndScroll);

        if (window.innerWidth <= 768) {
            setTimeout(() => {
                if (categoriesContainer.scrollWidth > categoriesContainer.clientWidth) {
                    categoriesContainer.scrollTo({ left: 45, behavior: 'smooth' });
                    setTimeout(() => {
                        categoriesContainer.scrollTo({ left: 0, behavior: 'smooth' });
                    }, 500);
                }
            }, 1500);
        }
    }
});

// Dynamic keyframe animation style injection for smooth card entry
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);

// ==========================================================================
// 7. PWA: SERVICE WORKER REGISTRATION
// ==========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW registered:', reg.scope);
        }).catch(err => {
            console.log('SW registration failed:', err);
        });
    });
}

// ==========================================================================
// 8. PWA: ADD TO HOME SCREEN / INSTALL BANNER
// ==========================================================================
(function() {
    let deferredPrompt = null;
    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.style.display = 'none';
    
    const getBannerText = () => {
        const lang = localStorage.getItem('preferred-lang') || 'vi';
        if (lang === 'en') {
            return {
                title: '📱 Install Silver Cat Tools',
                desc: 'Add to your home screen for quick access to all tools!',
                install: 'Install App',
                later: 'Later'
            };
        }
        return {
            title: '📱 Cài Đặt Silver Cat Tools',
            desc: 'Thêm vào màn hình chính để truy cập nhanh các công cụ tiện ích!',
            install: 'Cài Đặt',
            later: 'Để Sau'
        };
    };

    function renderBanner() {
        const txt = getBannerText();
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">
                    <img src="logo.jpg" alt="Silver Cat Tools" width="48" height="48" style="border-radius:12px;">
                </div>
                <div class="pwa-banner-text">
                    <strong>${txt.title}</strong>
                    <span>${txt.desc}</span>
                </div>
                <div class="pwa-banner-actions">
                    <button class="pwa-banner-install">${txt.install}</button>
                    <button class="pwa-banner-close">${txt.later}</button>
                </div>
            </div>
        `;
    }

    renderBanner();
    document.body.appendChild(banner);

    // Listen for language changes
    window.addEventListener('languageChanged', renderBanner);

    // Check if 5 days have passed since last dismiss
    function shouldShowBanner() {
        const dismissedTime = localStorage.getItem('pwa-dismissed-time');
        if (!dismissedTime) return true; // Never dismissed
        const elapsed = Date.now() - parseInt(dismissedTime);
        const fiveDays = 5 * 24 * 60 * 60 * 1000;
        return elapsed > fiveDays;
    }

    // Listen for the beforeinstallprompt event (all Chrome platforms)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (shouldShowBanner()) {
            banner.style.display = 'flex';
        }
    });

    // Handle install button click
    banner.addEventListener('click', (e) => {
        const installBtn = e.target.closest('.pwa-banner-install');
        const closeBtn = e.target.closest('.pwa-banner-close');
        
        if (installBtn && deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choice) => {
                if (choice.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                    banner.style.display = 'none';
                }
                deferredPrompt = null;
            });
        }
        
        if (closeBtn) {
            banner.style.display = 'none';
            // 5 ngày sau mới hỏi lại
            localStorage.setItem('pwa-dismissed-time', Date.now().toString());
        }
    });

    // iOS Safari fallback
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    if (isIOS && !isStandalone && shouldShowBanner()) {
        setTimeout(() => {
            if (shouldShowBanner()) {
                const txt = getBannerText();
                banner.innerHTML = `
                    <div class="pwa-banner-content">
                        <div class="pwa-banner-icon">
                            <img src="logo.jpg" alt="Silver Cat Tools" width="48" height="48" style="border-radius:12px;">
                        </div>
                        <div class="pwa-banner-text">
                            <strong>${txt.title}</strong>
                            <span>Nhấn vào nút chia sẻ <strong>Chia sẻ</strong> &rarr; <strong>Thêm vào Màn hình chính</strong></span>
                        </div>
                        <div class="pwa-banner-actions">
                            <button class="pwa-banner-close">${txt.later}</button>
                        </div>
                    </div>
                `;
                banner.style.display = 'flex';
            }
        }, 3000);
    }

    if (isStandalone) {
        banner.style.display = 'none';
    }

    // ======================================================================
    // CREATE INSTALL BUTTONS: Header (desktop) + Footer (mobile)
    // ======================================================================
    function createInstallButtons() {
        // Remove old buttons
        document.querySelectorAll('.pwa-install-header-btn, .pwa-install-footer-btn, .nav-cta').forEach(el => el.remove());

        if (isStandalone) {
            return;
        }

        const lang = localStorage.getItem('preferred-lang') || 'vi';
        const headerText = lang === 'en' ? 'Install App' : 'Cài Đặt';
        const footerText = lang === 'en' ? '📥 Install App' : '📥 Cài Đặt Ứng Dụng';

        // === HEADER: Install App button ===
        const navbar = document.getElementById('main-navbar');
        if (navbar) {
            const headerBtn = document.createElement('button');
            headerBtn.className = 'pwa-install-header-btn';
            headerBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span class="install-text">${headerText}</span>
            `;
            headerBtn.addEventListener('click', triggerInstall);
            navbar.appendChild(headerBtn);
        }

        // === FOOTER: Install App button ===
        const footerContainer = document.querySelector('.footer-container');
        if (footerContainer) {
            const footerBtn = document.createElement('button');
            footerBtn.className = 'pwa-install-footer-btn';
            footerBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                ${footerText}
            `;
            footerBtn.addEventListener('click', triggerInstall);
            const copyright = footerContainer.querySelector('.footer-copyright');
            if (copyright) {
                footerContainer.insertBefore(footerBtn, copyright);
            } else {
                footerContainer.appendChild(footerBtn);
            }
        }
    }

    function triggerInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
        } else if (isIOS && !isStandalone) {
            const txt = getBannerText();
            banner.innerHTML = `
                <div class="pwa-banner-content">
                    <div class="pwa-banner-icon"><img src="logo.jpg" alt="Silver Cat Tools" width="48" height="48" style="border-radius:12px;"></div>
                    <div class="pwa-banner-text">
                        <strong>${txt.title}</strong>
                        <span>Nhấn vào nút chia sẻ <strong>Chia sẻ</strong> &rarr; <strong>Thêm vào Màn hình chính</strong></span>
                    </div>
                    <div class="pwa-banner-actions">
                        <button class="pwa-banner-close">${txt.later}</button>
                    </div>
                </div>
            `;
            banner.style.display = 'flex';
        } else if (isStandalone) {
            alert('Ứng dụng đã được cài đặt!');
        } else {
            alert('Trình duyệt của bạn không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
        }
    }

    // Create buttons when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createInstallButtons);
    } else {
        createInstallButtons();
    }

    // Re-create buttons when language changes
    window.addEventListener('languageChanged', () => {
        setTimeout(createInstallButtons, 100);
    });

    // Remove buttons after app is installed
    window.addEventListener('appinstalled', () => {
        document.querySelectorAll('.pwa-install-header-btn, .pwa-install-footer-btn').forEach(el => el.remove());
        banner.style.display = 'none';
    });
})();