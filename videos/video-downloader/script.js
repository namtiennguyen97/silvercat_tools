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
    const videoPlatformBadge = document.getElementById('video-platform-badge');
    const downloadOptionsList = document.getElementById('download-options-list');
    const errorMessage = document.getElementById('error-message');

    // Platform detection patterns
    const platformPatterns = {
        tiktok: /tiktok\.com|vm\.tiktok\.com/i,
        facebook: /facebook\.com|fb\.watch|fb\.com|fbcdn/i,
        instagram: /instagram\.com|instagr\.am/i,
        twitter: /twitter\.com|x\.com|t\.co/i
    };

    const unsupportedPlatformPatterns = {
        youtube: /(?:youtube\.com|youtu\.be|youtube\.shorts)/i
    };

    const unsupportedPlatformMessages = {
        youtube: 'YouTube downloads are not supported in this browser tool. YouTube does not provide a stable public download API for static client-side sites, so this tool supports TikTok, Facebook, Instagram, and X links only.'
    };

    // Detect platform from URL
    function detectPlatform(url) {
        for (const [platform, pattern] of Object.entries(unsupportedPlatformPatterns)) {
            if (pattern.test(url)) return platform;
        }
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
        const lang = 'en';
        return en;
    }

    // Create download option HTML
    // filename: optional, used to force browser download with correct name
    function createDownloadOption(label, quality, badgeClass, size, downloadUrl, filename) {
        const option = document.createElement('div');
        option.className = 'download-option';

        const dlIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
        const spinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
        const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

        option.innerHTML = `
            <div class="option-info">
                <span class="option-quality">${label}</span>
                <span class="option-badge ${badgeClass}">${quality}</span>
                ${size ? `<span class="option-size">${size}</span>` : ''}
            </div>
            <button class="btn-dl-option" data-url="${downloadUrl}" data-filename="${filename || ''}">
                ${dlIcon}
                <span>${getLangText('Download', 'Download')}</span>
            </button>
        `;

        // Attach download handler
        const btn = option.querySelector('.btn-dl-option');
        btn.addEventListener('click', async () => {
            const url = btn.dataset.url;
            const originalFname = btn.dataset.filename || 'video.mp4';
            const fname = originalFname.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_');

            if (url.includes('/tunnel')) {
                // Show loading state briefly to acknowledge click
                btn.disabled = true;
                btn.innerHTML = `${spinIcon} <span>${getLangText('Đang bắt đầu tải...', 'Starting download...')}</span>`;
                
                setTimeout(() => {
                    btn.innerHTML = `${checkIcon} <span>${getLangText('Done!', 'Done!')}</span>`;
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = `${dlIcon} <span>${getLangText('Download', 'Download')}</span>`;
                    }, 2000);
                }, 800);

                const a = document.createElement('a');
                a.href = url;
                a.download = fname;
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                // For direct CDN links (like Facebook), force download via fetch->blob
                btn.disabled = true;
                btn.innerHTML = `${spinIcon} <span>${getLangText('Đang tải về máy...', 'Downloading...')}</span>`;
                
                try {
                    const res = await fetch(url, { mode: 'cors' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const blob = await res.blob();
                    if (blob.size === 0) throw new Error('empty');

                    const objectUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = fname;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

                    // Show success
                    btn.innerHTML = `${checkIcon} <span>${getLangText('Done!', 'Done!')}</span>`;
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = `${dlIcon} <span>${getLangText('Download', 'Download')}</span>`;
                    }, 2500);
                } catch (err) {
                    console.warn('fetch-blob failed:', err.message);
                    // Fallback to navigating if fetch fails
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fname;
                    a.rel = 'noopener noreferrer';
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    btn.disabled = false;
                    btn.innerHTML = `${dlIcon} <span>${getLangText('Download', 'Download')}</span>`;
                }
            }
        });

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
        'https://dog.kittycat.boo',
        'https://api.cobalt.blackcat.sweeux.org',
        'https://cobaltapi.kittycat.boo',
        'https://cobaltapi.squair.xyz'
    ];

    async function tryInstance(instanceUrl, url, overrides = {}) {
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
                downloadMode: 'auto',
                filenameStyle: 'classic',
                ...overrides
            }),
            signal: AbortSignal.timeout(25000)
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

                // Also fetch audio-only version in parallel (best effort)
                let audioData = null;
                try {
                    audioData = await tryInstance(instance, url, { downloadMode: 'audio' });
                } catch (audioErr) {
                    console.warn('Audio-only fetch failed (non-critical):', audioErr.message);
                }

                displayResult(data, url, platform, audioData);
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
    function displayResult(data, url, platform, audioData) {
        // Set platform-specific display
        const platformNames = {
            tiktok: 'TikTok',
            facebook: 'Facebook',
            instagram: 'Instagram',
            twitter: 'X (Twitter)',
            unknown: 'Video'
        };

        const platformName = platformNames[platform] || 'Video';

        // Set thumbnail - use logo as fallback if no thumbnail
        if (data.thumb) {
            videoThumbnail.src = data.thumb;
        } else {
            videoThumbnail.src = `../../logo.jpg`;
        }

        // Set video info
        let titleText = data.title;
        if (!titleText && data.filename) {
            // Remove file extension
            titleText = data.filename.replace(/\.[^/.]+$/, "");
        }
        videoTitle.textContent = titleText || `${platformName} Video`;
        videoDuration.textContent = formatDuration(data.duration);
        videoPlatformBadge.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg> ${platformName}`;

        // Build download options (Cobalt v10 statuses: redirect, tunnel, picker, local-processing)
        downloadOptionsList.innerHTML = '';

        if (data.status === 'redirect' || data.status === 'tunnel' || data.status === 'stream') {
            // Single download link — 'tunnel' is the v10 equivalent of 'stream'
            const opt = createDownloadOption(
                getLangText('Original Video (Best Quality)', 'Original Video (Best Quality)'),
                'HD',
                'badge-hd',
                '',
                data.url,
                data.filename
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
                data.output.url || data.url,
                data.filename
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
                    item.url,
                    item.filename || data.filename
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
                    data.audio,
                    data.filename ? data.filename.replace(/\.[^/.]+$/, '.mp3') : 'audio.mp3'
                );
                downloadOptionsList.appendChild(audioOpt);
            }
        }

        // Standalone audio track from video response
        if ((data.status === 'redirect' || data.status === 'tunnel') && data.audio) {
            const audioOpt = createDownloadOption(
                getLangText('Chỉ âm thanh (MP3)', 'Audio Only (MP3)'),
                'MP3',
                'badge-audio',
                '',
                data.audio,
                data.filename ? data.filename.replace(/\.[^/.]+$/, '.mp3') : 'audio.mp3'
            );
            downloadOptionsList.appendChild(audioOpt);
        }

        // Audio-only option from separate audio API call
        // Only add if we didn't already add an audio option above
        if (audioData && audioData.url && !data.audio) {
            const audioOpt = createDownloadOption(
                getLangText('Chỉ âm thanh (MP3)', 'Audio Only (MP3)'),
                'MP3',
                'badge-audio',
                '',
                audioData.url,
                audioData.filename || 'audio.mp3'
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
                data.url,
                data.filename
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
            twitter: 'X (Twitter)',
            unknown: 'Video'
        };

        const platformName = platformNames[platform] || 'Video';

        // Show a helpful error with specific message
        const lang = 'en';
        let msg;

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            msg = lang === 'en'
                ? 'Network error. The download service may be temporarily unavailable. Please try again in a few moments.'
                : 'Network error. The download service may be temporarily unavailable. Please try again in a few moments.';
        } else if (error.message.includes('API error')) {
            msg = lang === 'en'
                ? `Could not process this ${platformName} video. The video may be private, deleted, or region-locked.`
                : `Cannot process this ${platformName}  video. It may be private, deleted, or region-restricted.`;
        } else {
            msg = lang === 'en'
                ? 'An unexpected error occurred. Please check the URL and try again.'
                : 'An unexpected error occurred. Please check the URL and try again.';
        }

        errorMessage.textContent = msg;
        showSection(errorSection);
    }

    function showUnsupportedPlatform(platform) {
        errorMessage.textContent = unsupportedPlatformMessages[platform] || 'This platform is not supported by this downloader.';
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
            const lang = 'en';
            errorMessage.textContent = lang === 'en'
                ? 'Please enter a valid URL starting with http:// or https://'
                : 'Please enter a valid URL starting with http:// or https://';
            showSection(errorSection);
            return;
        }

        const platform = detectPlatform(url);
        if (unsupportedPlatformMessages[platform]) {
            showUnsupportedPlatform(platform);
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

    // Auto-focus URL input on page load
    window.addEventListener('load', () => {
        setTimeout(() => urlInput.focus(), 300);
    });

})();
