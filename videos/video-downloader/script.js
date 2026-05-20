// ==========================================================================
// VIDEO DOWNLOADER - Interactive Script
// Uses Cobalt API (cobalt.tools) for video extraction
// ==========================================================================

(function () {
    'use strict';

    // DOM Elements
    const urlInput = document.getElementById('video-url-input');
    const btnFetch = document.getElementById('btn-fetch-video');
    const btnPaste = document.getElementById('btn-paste');
    const btnTryAgain = document.getElementById('btn-try-again');

    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');

    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoTitle = document.getElementById('video-title');
    const videoDuration = document.getElementById('video-duration');
    const videoAuthor = document.getElementById('video-author');
    const videoPlatformBadge = document.getElementById('video-platform-badge');
    const downloadOptionsList = document.getElementById('download-options-list');
    const errorMessage = document.getElementById('error-message');

    // Platform detection patterns
    const platformPatterns = {
        tiktok: /tiktok\.com|vm\.tiktok\.com/i,
        facebook: /facebook\.com|fb\.watch|fb\.com|fbcdn/i,
        instagram: /instagram\.com|instagr\.am/i,
        youtube: /youtube\.com|youtu\.be|youtube\.shorts/i,
        twitter: /twitter\.com|x\.com|t\.co/i
    };

    // Detect platform from URL
    function detectPlatform(url) {
        for (const [platform, pattern] of Object.entries(platformPatterns)) {
            if (pattern.test(url)) return platform;
        }
        return 'unknown';
    }

    // Validate URL
    function isValidUrl(str) {
        try {
            const url = new URL(str);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Format file size
    function formatSize(bytes) {
        if (!bytes || bytes <= 0) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let unitIndex = 0;
        let size = bytes;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    // Format duration
    function formatDuration(seconds) {
        if (!seconds || seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Show/hide sections
    function showSection(section) {
        [loadingSection, resultSection, errorSection].forEach(s => {
            s.style.display = 'none';
        });
        if (section) section.style.display = 'block';
    }

    // Get language-aware text
    function getLangText(vi, en) {
        const lang = window.getCurrentLang ? window.getCurrentLang() : 'vi';
        return lang === 'en' ? en : vi;
    }

    // Create download option HTML
    function createDownloadOption(label, quality, badgeClass, size, downloadUrl) {
        const option = document.createElement('div');
        option.className = 'download-option';

        const dlIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

        option.innerHTML = `
            <div class="option-info">
                <span class="option-quality">${label}</span>
                <span class="option-badge ${badgeClass}">${quality}</span>
                ${size ? `<span class="option-size">${size}</span>` : ''}
            </div>
            <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-dl-option">
                ${dlIcon}
                <span>${getLangText('Tải xuống', 'Download')}</span>
            </a>
        `;
        return option;
    }

    // ======================================================================
    // COBALT API INTEGRATION - v10
    // Cobalt v7 (/api/json) was shut down Nov 11, 2024.
    // v10 uses POST / with updated request/response format.
    // Tries multiple public instances with fallback.
    // ======================================================================

    // Community instances (v10 compatible). Will try each in order until one works.
    const COBALT_INSTANCES = [
        'https://cobalt.api.timik.ru',
        'https://cobalt.drgns.space',
        'https://cobalt-api.damon.sh',
        'https://capi.oak.bio',
        'https://cobalt.pleb.city'
    ];

    async function tryInstance(instanceUrl, url) {
        const endpoint = instanceUrl.replace(/\/$/, '') + '/';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                videoQuality: '1080',
                audioFormat: 'mp3',
                videoCodec: 'h264',
                filenamePattern: 'basic',
                tiktokFullAudio: true,
                tiktokH265: false
            }),
            signal: AbortSignal.timeout(10000) // 10 second timeout per instance
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const code = errData?.error?.code || errData?.text || `HTTP ${response.status}`;
            throw new Error(code);
        }

        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(data.error?.code || data.text || 'Unknown error');
        }
        return data;
    }

    async function fetchVideoInfo(url) {
        const platform = detectPlatform(url);
        showSection(loadingSection);
        btnFetch.disabled = true;

        let lastError = null;

        for (const instance of COBALT_INSTANCES) {
            try {
                const data = await tryInstance(instance, url);
                displayResult(data, url, platform);
                btnFetch.disabled = false; // Re-enable after success
                return; // Success — stop trying other instances
            } catch (error) {
                console.warn(`Instance ${instance} failed:`, error.message);
                lastError = error;
                // Continue to next instance
            }
        }

        // All instances failed
        console.error('All Cobalt instances failed. Last error:', lastError);
        handleFetchError(lastError, url, platform);
        btnFetch.disabled = false;
    }

    // Display successful result
    function displayResult(data, url, platform) {
        // Set platform-specific display
        const platformNames = {
            tiktok: 'TikTok',
            facebook: 'Facebook',
            instagram: 'Instagram',
            youtube: 'YouTube',
            twitter: 'X (Twitter)',
            unknown: 'Video'
        };

        const platformName = platformNames[platform] || 'Video';

        // Set thumbnail - use a generic gradient if no thumbnail
        if (data.thumb) {
            videoThumbnail.src = data.thumb;
        } else {
            videoThumbnail.src = `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop`;
        }

        // Set video info
        videoTitle.textContent = data.title || `${platformName} Video`;
        videoDuration.textContent = formatDuration(data.duration);
        videoAuthor.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> ${data.author || getLangText('Không rõ tác giả', 'Unknown author')}`;
        videoPlatformBadge.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg> ${platformName}`;

        // Build download options (Cobalt v10 statuses: redirect, tunnel, picker, local-processing)
        downloadOptionsList.innerHTML = '';

        if (data.status === 'redirect' || data.status === 'tunnel' || data.status === 'stream') {
            // Single download link — 'tunnel' is the v10 equivalent of 'stream'
            const opt = createDownloadOption(
                getLangText('Video gốc (Chất lượng cao nhất)', 'Original Video (Best Quality)'),
                'HD',
                'badge-hd',
                '',
                data.url
            );
            downloadOptionsList.appendChild(opt);
        }

        if (data.status === 'local-processing' && data.output) {
            // Local-processing: client needs to merge audio+video (not yet supported, show info)
            const opt = createDownloadOption(
                getLangText('Video (cần xử lý trên thiết bị)', 'Video (device processing needed)'),
                'HD',
                'badge-hd',
                '',
                data.output.url || data.url
            );
            downloadOptionsList.appendChild(opt);
        }

        if (data.status === 'picker' && data.picker) {
            // Multiple options (e.g., Instagram carousel or multiple qualities)
            data.picker.forEach((item, index) => {
                const isAudio = item.type === 'audio';
                const label = isAudio
                    ? getLangText('Âm thanh (MP3)', 'Audio (MP3)')
                    : `${getLangText('Video', 'Video')} ${index + 1}`;
                const opt = createDownloadOption(
                    label,
                    isAudio ? 'MP3' : 'HD',
                    isAudio ? 'badge-audio' : 'badge-hd',
                    '',
                    item.url
                );
                downloadOptionsList.appendChild(opt);
            });
            // If picker also has an audio track
            if (data.audio) {
                const audioOpt = createDownloadOption(
                    getLangText('Chỉ âm thanh (MP3)', 'Audio Only (MP3)'),
                    'MP3',
                    'badge-audio',
                    '',
                    data.audio
                );
                downloadOptionsList.appendChild(audioOpt);
            }
        }

        // Standalone audio track
        if ((data.status === 'redirect' || data.status === 'tunnel') && data.audio) {
            const audioOpt = createDownloadOption(
                getLangText('Chỉ âm thanh (MP3)', 'Audio Only (MP3)'),
                'MP3',
                'badge-audio',
                '',
                data.audio
            );
            downloadOptionsList.appendChild(audioOpt);
        }

        // Absolute fallback: if somehow no options rendered but data.url exists
        if (downloadOptionsList.children.length === 0 && data.url) {
            const opt = createDownloadOption(
                getLangText('Tải video', 'Download Video'),
                'MP4',
                'badge-hd',
                '',
                data.url
            );
            downloadOptionsList.appendChild(opt);
        }

        showSection(resultSection);
    }

    // Handle fetch errors - show demo/fallback
    function handleFetchError(error, url, platform) {
        const platformNames = {
            tiktok: 'TikTok',
            facebook: 'Facebook',
            instagram: 'Instagram',
            youtube: 'YouTube',
            twitter: 'X (Twitter)',
            unknown: 'Video'
        };

        const platformName = platformNames[platform] || 'Video';

        // Show a helpful error with specific message
        const lang = window.getCurrentLang ? window.getCurrentLang() : 'vi';
        let msg;

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            msg = lang === 'en'
                ? 'Network error. The download service may be temporarily unavailable. Please try again in a few moments.'
                : 'Lỗi kết nối mạng. Dịch vụ tải video có thể tạm thời không khả dụng. Vui lòng thử lại sau ít phút.';
        } else if (error.message.includes('API error')) {
            msg = lang === 'en'
                ? `Could not process this ${platformName} video. The video may be private, deleted, or region-locked.`
                : `Không thể xử lý video ${platformName} này. Video có thể ở chế độ riêng tư, đã bị xóa hoặc bị giới hạn khu vực.`;
        } else {
            msg = lang === 'en'
                ? 'An unexpected error occurred. Please check the URL and try again.'
                : 'Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra lại đường link và thử lại.';
        }

        errorMessage.textContent = msg;
        showSection(errorSection);
    }

    // ======================================================================
    // EVENT LISTENERS
    // ======================================================================

    // Fetch video on button click
    btnFetch.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) {
            urlInput.focus();
            urlInput.style.outline = '2px solid #ef4444';
            setTimeout(() => { urlInput.style.outline = ''; }, 1500);
            return;
        }

        if (!isValidUrl(url)) {
            urlInput.style.outline = '2px solid #ef4444';
            setTimeout(() => { urlInput.style.outline = ''; }, 1500);
            const lang = window.getCurrentLang ? window.getCurrentLang() : 'vi';
            errorMessage.textContent = lang === 'en'
                ? 'Please enter a valid URL starting with http:// or https://'
                : 'Vui lòng nhập đường link hợp lệ bắt đầu bằng http:// hoặc https://';
            showSection(errorSection);
            return;
        }

        fetchVideoInfo(url);
    });

    // Enter key to submit
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnFetch.click();
        }
    });

    // Paste from clipboard
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text;
                urlInput.focus();
                // Visual feedback
                btnPaste.style.background = 'rgba(20, 184, 166, 0.2)';
                btnPaste.style.borderColor = 'rgba(20, 184, 166, 0.4)';
                btnPaste.style.color = '#2dd4bf';
                setTimeout(() => {
                    btnPaste.style.background = '';
                    btnPaste.style.borderColor = '';
                    btnPaste.style.color = '';
                }, 1000);
            }
        } catch (err) {
            // Fallback: focus on input for manual paste
            urlInput.focus();
            console.warn('Clipboard access denied, please paste manually.');
        }
    });

    // Try again button
    btnTryAgain.addEventListener('click', () => {
        showSection(null);
        urlInput.value = '';
        urlInput.focus();
    });

    // Highlight active platform based on input URL
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        const platform = detectPlatform(url);
        document.querySelectorAll('.platform-card').forEach(card => {
            const cardPlatform = card.getAttribute('data-platform');
            if (cardPlatform === platform) {
                card.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                card.style.background = 'rgba(236, 72, 153, 0.08)';
                card.style.color = 'white';
            } else {
                card.style.borderColor = '';
                card.style.background = '';
                card.style.color = '';
            }
        });
    });

    // Listen to languageChanged to translate dynamically rendered elements
    window.addEventListener('languageChanged', () => {
        // Translate elements inside resultSection if visible
        if (resultSection.style.display === 'block') {
            // Update the author element translation if it is "Unknown author"
            const authorText = videoAuthor.textContent.trim();
            if (authorText.includes('Không rõ tác giả') || authorText.includes('Unknown author')) {
                videoAuthor.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> ${getLangText('Không rõ tác giả', 'Unknown author')}`;
            }
            // Update download button texts
            document.querySelectorAll('.btn-dl-option span').forEach(span => {
                span.textContent = getLangText('Tải xuống', 'Download');
            });
            // Update option labels if they are "Original Video...", "Audio Only...", etc.
            document.querySelectorAll('.option-quality').forEach(span => {
                const text = span.textContent;
                if (text.includes('Video gốc') || text.includes('Original Video')) {
                    span.textContent = getLangText('Video gốc (Chất lượng cao nhất)', 'Original Video (Best Quality)');
                } else if (text.includes('Chỉ âm thanh') || text.includes('Audio Only')) {
                    span.textContent = getLangText('Chỉ âm thanh (MP3)', 'Audio Only (MP3)');
                } else if (text.includes('Âm thanh') || text.includes('Audio')) {
                    span.textContent = getLangText('Âm thanh (MP3)', 'Audio (MP3)');
                } else if (text.includes('Tải video') || text.includes('Download Video')) {
                    span.textContent = getLangText('Tải video', 'Download Video');
                } else if (text.startsWith('Video') || text.startsWith('Video')) {
                    const match = text.match(/\d+/);
                    if (match) {
                        span.textContent = `${getLangText('Video', 'Video')} ${match[0]}`;
                    }
                }
            });
        }
        
        // Translate elements inside errorSection if visible
        if (errorSection.style.display === 'block') {
            const currentErr = errorMessage.textContent.trim();
            if (currentErr.includes('Lỗi kết nối') || currentErr.includes('Network error')) {
                errorMessage.textContent = getLangText(
                    'Lỗi kết nối mạng. Dịch vụ tải video có thể tạm thời không khả dụng. Vui lòng thử lại sau ít phút.',
                    'Network error. The download service may be temporarily unavailable. Please try again in a few moments.'
                );
            } else if (currentErr.includes('Không thể xử lý') || currentErr.includes('Could not process')) {
                const platform = detectPlatform(urlInput.value.trim());
                const platformNames = {
                    tiktok: 'TikTok',
                    facebook: 'Facebook',
                    instagram: 'Instagram',
                    youtube: 'YouTube',
                    twitter: 'X (Twitter)',
                    unknown: 'Video'
                };
                const platformName = platformNames[platform] || 'Video';
                errorMessage.textContent = getLangText(
                    `Không thể xử lý video ${platformName} này. Video có thể ở chế độ riêng tư, đã bị xóa hoặc bị giới hạn khu vực.`,
                    `Could not process this ${platformName} video. The video may be private, deleted, or region-locked.`
                );
            } else {
                errorMessage.textContent = getLangText(
                    'Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra lại đường link và thử lại.',
                    'An unexpected error occurred. Please check the URL and try again.'
                );
            }
        }
    });

    // Auto-focus URL input on page load
    window.addEventListener('load', () => {
        setTimeout(() => urlInput.focus(), 300);
    });

})();
