/**
 * ==========================================================================
 * INTERACTIVE LOGIC - MICRO-SAAS HUB (GLASSMORPHISM DARK THEME)
 * ==========================================================================
 */

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

    // Function to filter tools
    function filterTools() {
        let visibleCount = 0;
        const query = searchQuery.toLowerCase().trim();

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const tags = card.getAttribute('data-tags') ? card.getAttribute('data-tags').toLowerCase() : '';
            
            // Category check
            const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
            
            // Search query check (title, description or tags)
            const matchesSearch = title.includes(query) || 
                                  desc.includes(query) || 
                                  tags.includes(query);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                // Add minor entrance animation
                card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle Empty/No results state
        if (visibleCount === 0) {
            noResults.style.display = 'block';
            toolsGrid.style.gridTemplateColumns = '1fr';
        } else {
            noResults.style.display = 'none';
            // Restore grid layout
            toolsGrid.style.removeProperty('grid-template-columns');
        }
    }

    // Search Input Listener with Debounce/Instant response
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterTools();
        });
    }

    // Category Tabs Listener
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Set active category and filter
            activeCategory = tab.getAttribute('data-category');
            filterTools();
        });
    });

    // 4. Interactive Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search bar on '/' key press
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
        // Don't continue typing if input is focused
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
        if (isDeleting) {
            typingSpeed /= 2;
        }

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
        // Create left and right fade indicator overlays dynamically inside the wrapper
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
                // Left overlay visibility if scrolled right
                if (scrollLeft > 5) {
                    categoriesWrapper.classList.add('is-overflowing-left');
                } else {
                    categoriesWrapper.classList.remove('is-overflowing-left');
                }

                // Right overlay visibility if more content to scroll on the right
                if (scrollLeft + clientWidth < scrollWidth - 5) {
                    categoriesWrapper.classList.add('is-overflowing-right');
                } else {
                    categoriesWrapper.classList.remove('is-overflowing-right');
                }
            } else {
                categoriesWrapper.classList.remove('is-overflowing-left', 'is-overflowing-right');
            }
        };

        // Initialize and listen to scroll and window resizing events
        checkOverflowAndScroll();
        categoriesContainer.addEventListener('scroll', checkOverflowAndScroll);
        window.addEventListener('resize', checkOverflowAndScroll);

        // One-time interactive scroll hint animation (bounce peek) on mobile load
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                if (categoriesContainer.scrollWidth > categoriesContainer.clientWidth) {
                    // Peek right
                    categoriesContainer.scrollTo({
                        left: 45,
                        behavior: 'smooth'
                    });
                    
                    // Bounce back to start
                    setTimeout(() => {
                        categoriesContainer.scrollTo({
                            left: 0,
                            behavior: 'smooth'
                        });
                    }, 500);
                }
            }, 1500); // Trigger shortly after initial loading completes
        }
    }
});

// Dynamic keyframe animation style injection for smooth card entry
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(style);
